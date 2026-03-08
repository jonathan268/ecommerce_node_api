// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const OAuthProvider = require('../models/OAuthProvider');
const Role = require('../models/Role');
const { v4: uuidv4 } = require('uuid');

// Sérialisation (optionnelle si on utilise JWT, mais nécessaire pour les sessions)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Fonction utilitaire pour créer/trouver un utilisateur OAuth
const findOrCreateUser = async (profile, provider, accessToken, refreshToken) => {
  const { id: providerUserId, emails, displayName, name } = profile;
  const email = emails?.[0]?.value || `${providerUserId}@${provider}.local`; // fallback

  // Vérifier si un OAuthProvider existe déjà
  let oauthProvider = await OAuthProvider.findOne({ provider, providerUserId }).populate('userId');
  if (oauthProvider) {
    // Mettre à jour les tokens
    oauthProvider.accessToken = accessToken;
    oauthProvider.refreshToken = refreshToken || oauthProvider.refreshToken;
    oauthProvider.updatedAt = Date.now();
    await oauthProvider.save();
    return oauthProvider.userId;
  }

  // Sinon, vérifier si un utilisateur avec cet email existe déjà
  let user = await User.findOne({ email }).populate('roles');
  if (!user) {
    // Créer un nouvel utilisateur
    const userRole = await Role.findOne({ name: 'user' }) || await new Role({ name: 'user', permissions: [] }).save();
    user = new User({
      _id: uuidv4(),
      name: displayName || `${name?.givenName} ${name?.familyName}` || profile.username,
      email,
      passwordHash: '', // pas de mot de passe pour OAuth
      roles: [userRole._id]
    });
    await user.save();
  }

  // Créer l'entrée OAuthProvider
  oauthProvider = new OAuthProvider({
    userId: user._id,
    provider,
    providerUserId,
    accessToken,
    refreshToken,
    expiresAt: profile.expiresAt ? new Date(profile.expiresAt) : null
  });
  await oauthProvider.save();

  return user;
};

// Stratégie Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser(profile, 'google', accessToken, refreshToken);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Stratégie Facebook
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/api/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'displayName'] // pour obtenir l'email
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser(profile, 'facebook', accessToken, refreshToken);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Stratégie GitHub
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/auth/github/callback',
  scope: ['user:email'] // pour obtenir l'email
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // GitHub ne fournit pas toujours l'email directement, il faut le récupérer via l'API
    // Ici on utilise profile.emails[0].value si disponible
    if (!profile.emails) {
      // Appel à l'API GitHub pour récupérer les emails (simplifié)
      const fetch = require('node-fetch');
      const res = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${accessToken}` }
      });
      const emails = await res.json();
      profile.emails = emails.filter(e => e.primary).map(e => ({ value: e.email }));
    }
    const user = await findOrCreateUser(profile, 'github', accessToken, refreshToken);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;
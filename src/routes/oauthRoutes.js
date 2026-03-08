const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const oauthController = require('../controllers/oauthProviderController');
const passport = require('passport');

router.use(auth);

router.get('/', oauthController.getMyProviders);
router.post('/link', oauthController.linkProvider);
router.delete('/:provider', oauthController.unlinkProvider);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback après Google
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Générer un token JWT
    const token = jwt.sign(
      { userId: req.user._id, roles: req.user.roles.map(r => r.name) },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback' // ou utilisez une variable d'env si nécessaire
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'google', accessToken, refreshToken);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
  console.log('Google OAuth configuré');
} else {
  console.log(' Google OAuth non configuré (variables manquantes)');
}
    // Rediriger vers le frontend avec le token (ou renvoyer JSON selon votre front)
    res.redirect(`https://c-shop-black.vercel.app?token=${token}`); 
  }
);

module.exports = router;
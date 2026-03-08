const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const oauthProviderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  userId: {
    type: String,
    ref: 'User',
    required: true,
    index: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['google', 'facebook', 'github', 'twitter']
  },
  providerUserId: {
    type: String,
    required: true
  },
  accessToken: String,
  refreshToken: String,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


oauthProviderSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });
oauthProviderSchema.index({ userId: 1, provider: 1 }, { unique: true });

oauthProviderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const OAuthProvider = mongoose.model('OAuthProvider', oauthProviderSchema);
module.exports = OAuthProvider;
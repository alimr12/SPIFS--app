const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User'); // Assuming your User model is here

const app = express();
const PORT = 5001; // Using a different port to avoid conflict if server.js is running

// 1. Connect to MongoDB (removed deprecated options)
const MONGO_URI = 'mongodb://localhost:27017/price_prediction';
mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected for Facebook Auth'))
.catch(err => console.error('MongoDB connection error:', err));

// 2. Setup Express Session with MongoDB Persistence
app.use(session({
  secret: 'your_super_secret_session_key', // Replace with a secure secret in production
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    collectionName: 'sessions' // Sessions will be saved in the 'sessions' collection
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// 3. Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// 4. Configure Facebook Strategy with account linking support
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `http://localhost:${PORT}/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'emails', 'photos']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
      
      if (!email) {
        return done(null, false, { message: 'Facebook did not return an email address' });
      }

      console.log('Facebook OAuth: Looking for existing user with Facebook providerId:', profile.id);
      
      // First, try to find user with this Facebook ID
      let user = await User.findOne({ 'providers.facebook.providerId': profile.id });

      if (!user) {
        console.log('Facebook OAuth: No user found with Facebook ID, checking for existing email:', email);
        // Check if email exists with any provider - support account linking
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
          console.log('Facebook OAuth: Email exists, linking Facebook provider to existing account');
          // Link Facebook provider to existing account
          existingUser.providers.facebook.enabled = true;
          existingUser.providers.facebook.providerId = profile.id;
          
          // Update legacy fields for backward compatibility
          if (!existingUser.providers.local.enabled && !existingUser.providers.google.enabled) {
            existingUser.provider = 'facebook';
          } else if (existingUser.providers.local.enabled || existingUser.providers.google.enabled) {
            existingUser.provider = 'multiple';
          }
          
          existingUser.profilePicture = profile.photos?.[0]?.value || existingUser.profilePicture;
          await existingUser.save();
          console.log('Facebook OAuth: Provider linked successfully');
          user = existingUser;
        } else {
          console.log('Facebook OAuth: Creating new user');
          user = new User({
            name: profile.displayName,
            username: profile.displayName.replace(/\s+/g, '').toLowerCase(),
            email: email,
            provider: 'facebook',
            profilePicture: profile.photos?.[0]?.value,
            providers: {
              facebook: {
                enabled: true,
                providerId: profile.id
              }
            }
          });
          await user.save();
          console.log('Facebook OAuth: New user created successfully');
        }
      } else {
        console.log('Facebook OAuth: Existing user found with Facebook ID');
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      return done(error, null);
    }
  }
);

// 5. Serialize and Deserialize User for Session Management
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// 6. Define Routes
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', successRedirect: '/profile' })
);

app.listen(PORT, () => {
  console.log(`Facebook Authentication service running on http://localhost:${PORT}`);
});

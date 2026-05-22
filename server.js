require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const predictionRoutes = require('./routes/predictionRoutes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();
const PORT = 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const googleOAuthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const facebookOAuthEnabled = Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/auth/google/callback`;
const facebookCallbackURL = process.env.FACEBOOK_CALLBACK_URL || `http://localhost:${PORT}/auth/facebook/callback`;

// Connect to MongoDB
// Note: useNewUrlParser and useUnifiedTopology are deprecated as of MongoDB Driver 4.0.0+
let dbConnected = false;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/price_prediction')
.then(() => {
  dbConnected = true;
  console.log('MongoDB connected successfully');
})
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Passport configuration
if (googleOAuthEnabled) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: googleCallbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    console.log('Google OAuth strategy called for user:', profile.displayName);
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        console.log('Google OAuth: No email returned');
        return done(null, false, { message: 'Google did not return an email address' });
      }

      console.log('Google OAuth: Looking for existing user with Google providerId:', profile.id);
      // First, try to find user with this Google ID
      let user = await User.findOne({ 'providers.google.providerId': profile.id });

      if (!user) {
        console.log('Google OAuth: No user found with Google ID, checking for existing email:', email);
        // Check if email exists with any provider - support account linking
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
          console.log('Google OAuth: Email exists, linking Google provider to existing account');
          // Link Google provider to existing account
          existingUser.providers.google.enabled = true;
          existingUser.providers.google.providerId = profile.id;
          
          // Update legacy fields for backward compatibility
          if (!existingUser.providers.local.enabled && !existingUser.providers.facebook.enabled) {
            existingUser.provider = 'google';
          } else if (existingUser.providers.local.enabled || existingUser.providers.facebook.enabled) {
            existingUser.provider = 'multiple';
          }
          
          existingUser.providerId = profile.id;
          
          // Update profile picture if not already set
          if (!existingUser.profilePicture && profile.photos?.[0]?.value) {
            existingUser.profilePicture = profile.photos[0].value;
          }
          
          await existingUser.save();
          console.log('Google OAuth: Provider linked successfully to existing user:', existingUser._id.toString());
          user = existingUser;
        } else {
          console.log('Google OAuth: Creating new user');
          user = new User({
            name: profile.displayName,
            username: profile.displayName.replace(/\s+/g, '').toLowerCase(),
            email,
            provider: 'google',
            providerId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            providers: {
              google: {
                enabled: true,
                providerId: profile.id
              }
            }
          });
          await user.save();
          console.log('Google OAuth: New user created successfully:', user._id.toString());
        }
      } else {
        console.log('Google OAuth: Existing user found with Google ID:', user._id.toString());
      }

      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.');
}

if (facebookOAuthEnabled) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: facebookCallbackURL,
    profileFields: ['id', 'displayName', 'emails', 'photos']
  }, async (accessToken, refreshToken, profile, done) => {
    console.log('Facebook OAuth strategy called for user:', profile.displayName);
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        console.log('Facebook OAuth: No email returned');
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
          
          existingUser.providerId = profile.id;
          
          // Update profile picture if not already set
          if (!existingUser.profilePicture && profile.photos?.[0]?.value) {
            existingUser.profilePicture = profile.photos[0].value;
          }
          
          await existingUser.save();
          console.log('Facebook OAuth: Provider linked successfully to existing user:', existingUser._id.toString());
          user = existingUser;
        } else {
          console.log('Facebook OAuth: Creating new user');
          user = new User({
            name: profile.displayName,
            username: profile.displayName.replace(/\s+/g, '').toLowerCase(),
            email,
            provider: 'facebook',
            providerId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            providers: {
              facebook: {
                enabled: true,
                providerId: profile.id
              }
            }
          });
          await user.save();
          console.log('Facebook OAuth: New user created successfully:', user._id.toString());
        }
      } else {
        console.log('Facebook OAuth: Existing user found with Facebook ID:', user._id.toString());
      }

      return done(null, user);
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('Facebook OAuth is not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to enable it.');
}

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

app.use(passport.initialize());

// Routes
app.use('/api/predict', predictionRoutes);

// Register a new user
app.post(["/signup", "/api/signup", "/api/auth/signup"], async (req, res) => {
  try {
    console.log("Signup request body:", req.body);
    
    // Accept various field name formats
    const name = req.body.name || req.body.fullName || req.body.full_name || req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword || req.body.confirm_password;
    const username = req.body.username || name; // Store username consistently

    console.log("Signup - Extracted values:", { name, email, username });

    if (!name || !email || !password) {
      console.log("Signup validation failed - missing required fields");
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    // Check if passwords match if confirmPassword is provided
    if (confirmPassword && password !== confirmPassword) {
      console.log("Signup validation failed - passwords do not match");
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Signup validation failed - email already exists:", email);
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Salt rounds set to 10 for standard security balance
    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      provider: 'local',
      providers: {
        local: {
          enabled: true
        }
      }
    });

    console.log("Signup - Creating new user with email:", email);
    await newUser.save();
    
    console.log("Signup - User created successfully:", newUser._id.toString());

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Signup Error:", error);
    console.error("Signup Error Stack:", error.stack);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
});

// Authenticate user
app.post(["/login", "/api/login", "/api/auth/login"], async (req, res) => {
  try {
    console.log("Login request body:", req.body);

    const { name, username, email, password } = req.body;
    const loginName = name || username || email;

    console.log("loginName extracted:", loginName);

    if (!loginName || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username and password"
      });
    }

    const user = await User.findOne({
      $or: [
        { email: loginName },
        { name: loginName },
        { username: loginName }
      ]
    });

    console.log("Found user:", user);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    // Check if the user registered via social login (Google/Facebook) and has no password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses social login. Please sign in with Google or Facebook."
      });
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    console.log("bcrypt compare result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
});

// OAuth Routes
if (googleOAuthEnabled) {
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/auth/google/callback',
    (req, res, next) => {
      console.log('Google OAuth callback route hit');
      passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
          console.error('Google OAuth callback error:', err);
          return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
        }
        if (!user) {
          console.log('Google OAuth callback: No user returned');
          return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
        }

        console.log('Google OAuth callback: User authenticated, generating token for:', user._id.toString());
        const token = jwt.sign(
          { userId: user._id.toString(), email: user.email, name: user.name },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&provider=google`);
      })(req, res, next);
    }
  );
} else {
  app.get('/auth/google', (req, res) => {
    res.status(503).json({ success: false, message: 'Google OAuth is not configured' });
  });
  app.get('/auth/google/callback', (req, res) => {
    res.status(503).json({ success: false, message: 'Google OAuth is not configured' });
  });
}

if (facebookOAuthEnabled) {
  app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
  );

  app.get('/auth/facebook/callback',
    (req, res, next) => {
      console.log('Facebook OAuth callback route hit');
      passport.authenticate('facebook', { session: false }, (err, user, info) => {
        if (err) {
          console.error('Facebook OAuth callback error:', err);
          return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
        }
        if (!user) {
          console.log('Facebook OAuth callback: No user returned');
          return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
        }

        console.log('Facebook OAuth callback: User authenticated, generating token for:', user._id.toString());
        const token = jwt.sign(
          { userId: user._id.toString(), email: user.email, name: user.name },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&provider=facebook`);
      })(req, res, next);
    }
  );
} else {
  app.get('/auth/facebook', (req, res) => {
    res.status(503).json({ success: false, message: 'Facebook OAuth is not configured' });
  });
  app.get('/auth/facebook/callback', (req, res) => {
    res.status(503).json({ success: false, message: 'Facebook OAuth is not configured' });
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running', dbConnected });
});

// Root/status endpoint
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server is running', port: PORT, dbConnected });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port 5001...`);
    app.listen(5001, () => {
      console.log(`Server running on http://localhost:5001`);
    });
  } else {
    console.error('Server error:', err);
  }
});
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google Profile:', profile); // Debug log
          
          // Get userType from session (set during /auth/google call)
          const userType = req.session.userType || 'user';
          console.log('🟡 Login attempt with userType:', userType);
          
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // ✅ FIX: Update existing user's userType every time they log in
            console.log('🔄 User exists. Current type:', user.userType, '-> Updating to:', userType);
            user.userType = userType;
            await user.save();
            console.log('✅ Updated existing user type to:', user.userType);
            return done(null, user);
          }

          // Create new user
          const profilePicture = profile.photos && profile.photos.length > 0 
            ? profile.photos[0].value 
            : null;
          
          console.log('🟡 Creating user with userType:', userType);
          
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            profilePicture: profilePicture,
            userType: userType
          });

          console.log('✅ Created new user:', user);
          done(null, user);
        } catch (error) {
          console.error('Error in Google Strategy:', error);
          done(error, null);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
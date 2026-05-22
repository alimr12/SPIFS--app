# Google Login Fix - Testing Guide

## Summary of Changes

✅ **Fixed Google Login Failure** - Users with existing email accounts can now authenticate with Google OAuth  
✅ **Account Linking Enabled** - Users can use multiple providers (Google, Facebook, local) with the same email  
✅ **MongoDB Warning Fixed** - Removed deprecated driver options  
✅ **Backward Compatible** - Existing users unaffected  

## Test Scenarios

### Test 1: New User Google Login
**Steps:**
1. Clear browser cookies
2. Go to login page
3. Click "Login with Google"
4. Use a Google account email not in database
5. Authorize the application

**Expected Result:**
- ✅ New user account created
- ✅ User redirected to dashboard with token
- ✅ Console logs: "Google OAuth: Creating new user" → "User saved successfully"

---

### Test 2: Existing Local User + Google Login (THE FIX!)
**Steps:**
1. Have a user registered locally with email: `afaqakram864@gmail.com`
2. Clear browser cookies
3. Go to login page
4. Click "Login with Google"
5. Authorize with the SAME Google account email

**Expected Result (BEFORE FIX):**
- ❌ "Email already registered with different provider"
- ❌ Login fails

**Expected Result (AFTER FIX):**
- ✅ User successfully logs in
- ✅ Google provider linked to existing account
- ✅ Console logs: "Email exists, linking Google provider to existing account" → "Provider linked successfully"

---

### Test 3: Existing Facebook User + Google Login
**Steps:**
1. Have a user registered via Facebook with email: `test@example.com`
2. Try logging in with Google using same email
3. Authorize the application

**Expected Result:**
- ✅ User successfully logs in
- ✅ Google provider linked to Facebook account
- ✅ User now has multiple provider support
- ✅ Console logs: "Email exists, linking Google provider to existing account"

---

### Test 4: User Profile Shows Multiple Providers
**Steps:**
1. After Test 2 or 3 succeeds, check database
2. Query user document for email `afaqakram864@gmail.com`

**Expected Result:**
```javascript
{
  email: "afaqakram864@gmail.com",
  provider: "multiple",
  providers: {
    local: { enabled: true },      // from original registration
    google: { enabled: true, providerId: "..." },  // newly linked
    facebook: { enabled: false }
  }
}
```

---

## Console Log Verification

### Successful Google Login Flow
```
Google OAuth callback route hit
Google OAuth strategy called for user: Muhammad Afaq akram
Google OAuth: Looking for existing user with Google providerId: 117723823021116311300
Google OAuth: No user found with Google ID, checking for existing email: afaqakram864@gmail.com
Google OAuth: Email exists, linking Google provider to existing account
Google OAuth: Provider linked successfully to existing user: 507f1f77bcf0000000000001
Google OAuth callback: User authenticated, generating token for: 507f1f77bcf0000000000001
```

### Successful New User Creation
```
Google OAuth callback route hit
Google OAuth strategy called for user: New User Name
Google OAuth: Looking for existing user with Google providerId: 123456789
Google OAuth: No user found with Google ID, checking for existing email: newuser@example.com
Google OAuth: Creating new user
Google OAuth: New user created successfully: 507f1f77bcf0000000000002
Google OAuth callback: User authenticated, generating token for: 507f1f77bcf0000000000002
```

---

## How to Run Tests

### 1. Start the Backend Server
```bash
cd backend
node server.js
```

Should see:
```
MongoDB connected
Server running on http://localhost:5000
```

### 2. Test Google OAuth Flow
- Visit: `http://localhost:5000/auth/google`
- Follow Google authorization
- Should be redirected to: `http://localhost:3000/auth/callback?token=...&provider=google`

### 3. Check Database (Optional)
```bash
# Connect to MongoDB
mongo

# Use database
use price_prediction

# Check user document
db.users.findOne({email: "afaqakram864@gmail.com"})
```

---

## Troubleshooting

### Issue: Still Getting "Email already registered"
**Cause:** Cached strategy or running old code  
**Solution:**
1. Clear node modules: `rm -r node_modules` or `rmdir /s node_modules`
2. Reinstall: `npm install`
3. Restart server: `node server.js`

### Issue: MongoDB Connection Error
**Cause:** MongoDB not running  
**Solution:**
1. Start MongoDB service: `mongod` or check MongoDB status
2. Verify URI in `.env`: Should be `mongodb://localhost:27017/price_prediction`

### Issue: Google OAuth Not Configured
**Cause:** Missing `.env` variables  
**Solution:**
1. Check `.env` has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Ensure values are correct from Google Cloud Console

### Issue: Token Generation Error
**Cause:** Missing `JWT_SECRET` in `.env`  
**Solution:**
1. Ensure `JWT_SECRET` is set in `.env`
2. Example: `JWT_SECRET=your-secret-key-change-in-production`

---

## Rollback Instructions

If you need to revert to the old behavior:

### Restore Original User Model
```bash
git checkout HEAD -- backend/models/User.js
```

### Restore Original Server.js OAuth Strategies
```bash
git checkout HEAD -- backend/server.js
```

---

## Database Migration (If Needed)

If you need to update existing users to use the new provider structure:

```bash
# Run this in MongoDB console
db.users.updateMany({}, {
  $set: {
    "providers.local.enabled": true,
    "providers.google.enabled": false,
    "providers.facebook.enabled": false
  }
})
```

Then update specific users who have Google/Facebook:
```bash
db.users.updateMany(
  { provider: "google" },
  {
    $set: {
      "providers.google.enabled": true,
      "providers.google.providerId": "$providerId"
    }
  }
)
```

---

## Success Indicators

✅ Users with existing emails can login with different providers  
✅ No "Email already registered" errors  
✅ Multiple provider support works  
✅ Console logs show account linking messages  
✅ Database shows `provider: "multiple"` for linked accounts  
✅ No MongoDB deprecation warnings  

---

## Next Steps

1. ✅ Test all scenarios above
2. ✅ Verify console logs
3. ✅ Check database state
4. ✅ Test logout and re-login with different provider
5. ✅ Deploy to production with confidence!

# Signup Endpoint Fix

## Problem Identified

Signup was failing because the new User model expects a `providers` object, but the signup endpoint wasn't initializing it when creating local user accounts.

## Issues Fixed

### 1. Missing Provider Structure in Signup
**Before:**
```javascript
const newUser = new User({
  name,
  username,
  email,
  password: hashedPassword
});
```

**After:**
```javascript
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
```

### 2. User Model Default Values
Updated the User model to provide proper default initialization:
```javascript
providers: {
  type: {
    local: {
      enabled: { type: Boolean, default: false }
    },
    google: {
      enabled: { type: Boolean, default: false },
      providerId: String
    },
    facebook: {
      enabled: { type: Boolean, default: false },
      providerId: String
    }
  },
  default: {
    local: { enabled: false },
    google: { enabled: false },
    facebook: { enabled: false }
  }
}
```

### 3. Enhanced Logging
Added comprehensive logging to signup endpoint for better debugging:
- Request body logging
- Extracted values logging
- Validation failure logging
- User creation logging
- Error stack trace logging

## Expected Behavior After Fix

### Successful Signup Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf0000000000001",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Console Logs:
```
Signup request body: { name: "John Doe", email: "john@example.com", password: "..." }
Signup - Extracted values: { name: "John Doe", email: "john@example.com", username: "johndoe" }
Signup - Creating new user with email: john@example.com
Signup - User created successfully: 507f1f77bcf0000000000001
```

## Database Record After Signup

```javascript
{
  _id: ObjectId("507f1f77bcf0000000000001"),
  name: "John Doe",
  username: "johndoe",
  email: "john@example.com",
  password: "$2a$10$...", // hashed password
  provider: "local",
  providers: {
    local: { enabled: true },
    google: { enabled: false },
    facebook: { enabled: false }
  },
  createdAt: ISODate("2026-05-04T...")
}
```

## Testing the Fix

### Test Case 1: Basic Signup
**Request:**
```bash
POST /signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Expected:**
- Status: 201 Created
- Response contains user ID, name, and email
- Console logs show all steps

### Test Case 2: Missing Required Fields
**Request:**
```bash
POST /signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "securePassword123"
}
```

**Expected:**
- Status: 400 Bad Request
- Message: "Name, email, and password are required"

### Test Case 3: Password Mismatch
**Request:**
```bash
POST /signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "securePassword123",
  "confirmPassword": "differentPassword"
}
```

**Expected:**
- Status: 400 Bad Request
- Message: "Passwords do not match"

### Test Case 4: Duplicate Email
**Request:**
```bash
POST /signup
Content-Type: application/json

{
  "name": "Another User",
  "email": "test@example.com", // email already exists
  "password": "securePassword123"
}
```

**Expected:**
- Status: 409 Conflict
- Message: "User with this email already exists"

## Files Modified

1. [server.js](server.js) - Enhanced signup endpoint with logging and provider initialization
2. [models/User.js](models/User.js) - Added proper default values for providers object

## Backward Compatibility

✅ No breaking changes  
✅ Existing login endpoints unaffected  
✅ OAuth flows continue to work  
✅ Legacy provider fields maintained  

## Troubleshooting

### If signup still fails:

1. **Check MongoDB Connection:**
   ```bash
   # Verify MongoDB is running
   mongod
   ```

2. **Check Console Logs:**
   - Look for error messages in server console
   - Stack trace will show the exact issue

3. **Verify Email is Unique:**
   ```bash
   # In MongoDB
   db.users.findOne({ email: "test@example.com" })
   ```

4. **Check Network Request:**
   - Open DevTools → Network tab
   - Look at the request payload
   - Verify all required fields are being sent

### Common Issues:

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read property 'name' of undefined` | Request body is empty | Send valid JSON body |
| `User with this email already exists` | Email already registered | Use different email |
| `E11000 duplicate key error` | MongoDB index conflict | Delete old user or use different email |
| `Cast to String failed for value "undefined"` | Missing required field | Provide name, email, password |

## Next Steps

1. ✅ Test signup with various inputs
2. ✅ Check console logs for any issues
3. ✅ Verify users are created in database
4. ✅ Test subsequent login with created account
5. ✅ Deploy to production

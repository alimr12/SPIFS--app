# Backend Prediction API

Real estate price prediction REST API using Express.js and Python machine learning service.

## Setup

### Prerequisites
- Node.js 14+
- Python 3.8+
- pip

### Installation

1. Install Node dependencies:
```bash
npm install
```

2. Install Python dependencies:
```bash
pip install pandas scikit-learn numpy
```

The model will automatically train on first run using `Cleaned_data_for_model.csv`.

### Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Or production mode:
```bash
npm start
```

Server runs on `http://localhost:5000`

## Authentication

The API supports both traditional email/password authentication and OAuth with Google and Facebook.

### Traditional Authentication

#### POST /signup
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### POST /login
Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### OAuth Authentication

#### Google Login
- **GET** `/auth/google` - Initiate Google OAuth login
- **GET** `/auth/google/callback` - Google OAuth callback (handled automatically)

#### Facebook Login
- **GET** `/auth/facebook` - Initiate Facebook OAuth login
- **GET** `/auth/facebook/callback` - Facebook OAuth callback (handled automatically)

### OAuth Setup

1. Create a `.env` file based on `.env.example`
2. For Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Set authorized redirect URI to: `http://localhost:5000/auth/google/callback`

3. For Facebook OAuth:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Add Facebook Login product
   - Set Valid OAuth Redirect URIs to: `http://localhost:5000/auth/facebook/callback`

4. Add the credentials to your `.env` file:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### Authentication Response

All authentication methods return a JWT token:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## API Endpoints

### POST /api/predict
Make a price prediction request.

**Request Body:**
```json
{
  "city": "Islamabad",
  "location_type": "Residential",
  "society": "DHA Islamabad",
  "block_sector": "Phase 2",
  "size": "5 Marla",
  "investment_period": "12 Months",
  "current_price": 2800000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prediction": 3150000,
    "current_predicted_price": 2950000,
    "appreciation_rate": 8.0,
    "holding_period_months": 12
  }
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

## How It Works

1. Frontend sends POST request with property details to `/api/predict`
2. Express controller validates the request
3. Request is passed to Python prediction service via `child_process.spawn`
4. Python script:
   - Loads training data from `Cleaned_data_for_model.csv`
   - Trains/loads ML model (Gradient Boosting Regressor)
   - Maps frontend fields to model features
   - Returns JSON prediction
5. Backend returns JSON response to frontend

## Model Features

The prediction model uses:
- **Area_in_Marla**: Property size in Marla units
- **bedrooms**: Number of bedrooms (inferred from size)
- **baths**: Number of bathrooms (inferred from size)
- **city**: City name
- **property_type**: Residential/Commercial/Industrial/Agricultural
- **location**: Society + Block/Sector combined

## Appreciation Rates

Annual appreciation rates by property type:
- Residential: 8%
- Commercial: 6%
- Agricultural: 4%
- Industrial: 5%

## Error Handling

Errors are returned as JSON:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Files

- `server.js` - Express server setup
- `routes/predictionRoutes.js` - Route definitions
- `controllers/predictionController.js` - Request handler & Python integration
- `mlservice/prediction.py` - ML model & prediction logic
- `mlservice/Cleaned_data_for_model.csv` - Training data

## Frontend Integration

The frontend should:
1. POST to `http://localhost:5000/api/predict`
2. Include all required fields in JSON body
3. Parse the response:
   - `data.prediction` - future price prediction
   - `data.current_predicted_price` - model's prediction at current state
   - `data.appreciation_rate` - annual appreciation percentage
   - `data.holding_period_months` - investment period in months

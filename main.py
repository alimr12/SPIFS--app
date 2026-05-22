from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import uvicorn

# Import the trained model and appreciation logic from app.py
from app import (
    best_model, scaler_X, le_city, le_status, le_society,
    get_appreciation_rate
)

# Initialize FastAPI app
app = FastAPI(title="Price Prediction API")

# Enable CORS so the frontend can communicate with the API
app.add_middleware(
    CORSMiddleware,
    # Update allow_origins with your frontend URL in production (e.g., ["http://localhost:3000"])
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the input data structure using Pydantic
# Update these fields to match the exact features your model expects
class PricePredictionRequest(BaseModel):
    city: str = "Islamabad"
    location_type: str = "Residential"
    society: str = "DHA"
    block_sector: str = "Phase 2"
    size: str = "5 Marla"
    investment_period: str = "12 Months"
    current_price: float = 2800000.0

class PricePredictionResponse(BaseModel):
    predicted_price: float
    prediction: float
    success: bool = True
    data: dict = {}
    error: str = None
    current_price: float = 0.0
    estimated_return: float = 0.0
    return_percentage: float = 0.0
    lower_bound: float = 0.0
    upper_bound: float = 0.0

@app.get("/")
def read_root():
    return {"message": "Price Prediction API is running!"}

@app.post("/predict", response_model=PricePredictionResponse)
def predict(request: PricePredictionRequest):
    try:
        if best_model is None:
            raise Exception("Model is not loaded. Please ensure 'best_model_xgboost.pkl' is in the directory.")

        # 1. Extract numerical size
        size_str = str(request.size).split()[0]
        size_numeric = float(size_str)

        # 2. Extract investment period in months
        period_map = {f"{i} Months": i for i in range(2, 37)}
        investment_months = period_map.get(request.investment_period, 12)

        # 3. Safely encode categorical variables (Fallback defaults used if exact match isn't found)
        try: city_encoded = int(le_city.transform([request.city])[0])
        except: city_encoded = 0
            
        try: status_encoded = int(le_status.transform(['Mostly Developed'])[0])
        except: status_encoded = 1
            
        try: society_encoded = int(le_society.transform([request.society])[0])
        except: society_encoded = 0

        # 4. Calculate Appreciation and Lags natively in the backend
        appreciation_rate = get_appreciation_rate(request.city, request.society, request.location_type, size_numeric)
        quarters_back = investment_months / 3
        price_lag1 = float(request.current_price / (1 + appreciation_rate) ** 1)
        price_lag2 = float(request.current_price / (1 + appreciation_rate) ** 2)
        price_lag3 = float(request.current_price / (1 + appreciation_rate) ** 3)
        price_ma2 = float((price_lag1 + price_lag2) / 2)
        price_ma3 = float((price_lag1 + price_lag2 + price_lag3) / 3)
        price_change = float((appreciation_rate * 100) * quarters_back)
        
        # 5. Global fixed economic markers to keep the prediction standardized
        policy_rate = 10.5
        inflation = 5.8
        gdp_growth = 3.5
        construction_cost = 450
        exchange_rate = 513
        unemployment = 4.2
        
        real_rate = float(policy_rate - inflation)
        economic_stress = float(1.0 - gdp_growth)
        
        # 6. Build the feature array in the exact order the XGBoost model expects
        features = np.array([
            float(policy_rate), float(inflation), float(gdp_growth),
            float(construction_cost), float(exchange_rate), float(unemployment),
            price_lag1, price_lag2, price_lag3, price_ma2, price_ma3,
            price_change, real_rate, economic_stress,
            float(city_encoded), float(status_encoded), float(society_encoded), float(size_numeric)
        ]).reshape(1, -1)
        
        # 7. Scale and predict
        features_scaled = scaler_X.transform(features)
        prediction = float(best_model.predict(features_scaled)[0])

        return {
            "predicted_price": prediction,
            "prediction": prediction,
            "success": True,
            "current_price": request.current_price,
            "lower_bound": float(prediction * 0.90),
            "upper_bound": float(prediction * 1.10),
            "estimated_return": float(prediction - request.current_price),
            "return_percentage": float(((prediction - request.current_price) / request.current_price) * 100),
            "data": {
                "prediction": prediction,
                "current_predicted_price": request.current_price,                "appreciation_rate": float(appreciation_rate * 100),
                "holding_period_months": int(investment_months)
            }
        }
    except Exception as e:
        return {"success": False, "prediction": 0.0, "predicted_price": 0.0, "error": str(e), "data": {}}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
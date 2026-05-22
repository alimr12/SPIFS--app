import pickle
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Initialize FastAPI app
app = FastAPI(title="Property Price Prediction API")

# Enable CORS so your frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change to your specific frontend URL in production)
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model and artifacts on startup
best_model = None
scaler_X = None
le_city = None
le_status = None
le_society = None

try:
    with open('best_model_xgboost.pkl', 'rb') as f:
        model_data = pickle.load(f)
        
    best_model = model_data['model']
    scaler_X = model_data['scaler_X']
    le_city = model_data['le_city']
    le_status = model_data['le_status']
    le_society = model_data['le_society']
    
    print(f"✓ Model loaded: {model_data.get('training_date', 'Unknown')}")
except Exception as e:
    print(f"Error loading model: {e}. Please ensure 'best_model_xgboost.pkl' exists.")
    print("⚠ Model not found. Using dummy data for API demonstration.")

# ============================================================================
# APPRECIATION RATES DATASET
# ============================================================================
APPRECIATION_RATES = {
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 4.0): 0.013282,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 5.0): 0.015901,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 6.0): 0.013507,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 7.0): 0.013484,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 8.0): 0.014990,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 9.0): 0.013552,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 10.0): 0.014954,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 12.0): 0.014417,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 13.0): 0.013446,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 14.0): 0.014709,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 15.0): 0.013380,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 16.0): 0.014208,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 17.0): 0.013080,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 18.0): 0.016506,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 19.0): 0.015301,
    ('Islamabad', 'Bahria Town Islamabad', 'Commercial', 20.0): 0.011579,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 4.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 5.0): 0.027176,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 6.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 7.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 8.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 9.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 11.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 12.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 13.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 14.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 15.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 16.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 17.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 18.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 19.0): 0.055484,
    ('Islamabad', 'Bahria Town Islamabad', 'Residential', 20.0): 0.055484,
    ('Islamabad', 'Capital Smart City', 'Commercial', 4.0): 0.015627,
    ('Islamabad', 'Capital Smart City', 'Commercial', 5.0): 0.014284,
    ('Islamabad', 'Capital Smart City', 'Commercial', 6.0): 0.014383,
    ('Islamabad', 'Capital Smart City', 'Commercial', 7.0): 0.013253,
    ('Islamabad', 'Capital Smart City', 'Commercial', 8.0): 0.014567,
    ('Islamabad', 'Capital Smart City', 'Commercial', 9.0): 0.015328,
    ('Islamabad', 'Capital Smart City', 'Commercial', 10.0): 0.015841,
    ('Islamabad', 'Capital Smart City', 'Commercial', 12.0): 0.014932,
    ('Islamabad', 'Capital Smart City', 'Commercial', 13.0): 0.016603,
    ('Islamabad', 'Capital Smart City', 'Commercial', 14.0): 0.013012,
    ('Islamabad', 'Capital Smart City', 'Commercial', 15.0): 0.012633,
    ('Islamabad', 'Capital Smart City', 'Commercial', 16.0): 0.014455,
    ('Islamabad', 'Capital Smart City', 'Commercial', 17.0): 0.016727,
    ('Islamabad', 'Capital Smart City', 'Commercial', 18.0): 0.013015,
    ('Islamabad', 'Capital Smart City', 'Commercial', 19.0): 0.015766,
    ('Islamabad', 'Capital Smart City', 'Commercial', 20.0): 0.014698,
    ('Islamabad', 'Capital Smart City', 'Residential', 4.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 5.0): 0.015723,
    ('Islamabad', 'Capital Smart City', 'Residential', 6.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 7.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 8.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 9.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 11.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 12.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 13.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 14.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 15.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 16.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 17.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 18.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 19.0): 0.032101,
    ('Islamabad', 'Capital Smart City', 'Residential', 20.0): 0.032101,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 4.0): 0.014232,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 5.0): 0.012254,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 6.0): 0.014398,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 7.0): 0.013708,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 8.0): 0.014072,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 9.0): 0.014649,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 10.0): 0.015107,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 12.0): 0.016184,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 13.0): 0.014635,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 14.0): 0.014947,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 15.0): 0.014121,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 16.0): 0.014456,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 17.0): 0.015349,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 18.0): 0.013286,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 19.0): 0.012670,
    ('Islamabad', 'DHA Islamabad', 'Commercial', 20.0): 0.014884,
    ('Islamabad', 'DHA Islamabad', 'Residential', 4.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 5.0): 0.022227,
    ('Islamabad', 'DHA Islamabad', 'Residential', 6.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 7.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 8.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 9.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 10.0): 0.027397,
    ('Islamabad', 'DHA Islamabad', 'Residential', 11.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 12.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 13.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 14.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 15.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 16.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 17.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 18.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 19.0): 0.025730,
    ('Islamabad', 'DHA Islamabad', 'Residential', 20.0): 0.025730,
    ('Islamabad', 'Faisal Town', 'Commercial', 4.0): 0.015705,
    ('Islamabad', 'Faisal Town', 'Commercial', 5.0): 0.017099,
    ('Islamabad', 'Faisal Town', 'Commercial', 6.0): 0.013779,
    ('Islamabad', 'Faisal Town', 'Commercial', 7.0): 0.014241,
    ('Islamabad', 'Faisal Town', 'Commercial', 8.0): 0.013530,
    ('Islamabad', 'Faisal Town', 'Commercial', 9.0): 0.015453,
    ('Islamabad', 'Faisal Town', 'Commercial', 10.0): 0.012681,
    ('Islamabad', 'Faisal Town', 'Commercial', 12.0): 0.014345,
    ('Islamabad', 'Faisal Town', 'Commercial', 13.0): 0.015189,
    ('Islamabad', 'Faisal Town', 'Commercial', 14.0): 0.016558,
    ('Islamabad', 'Faisal Town', 'Commercial', 15.0): 0.013100,
    ('Islamabad', 'Faisal Town', 'Commercial', 16.0): 0.014254,
    ('Islamabad', 'Faisal Town', 'Commercial', 17.0): 0.013622,
    ('Islamabad', 'Faisal Town', 'Commercial', 18.0): 0.016864,
    ('Islamabad', 'Faisal Town', 'Commercial', 19.0): 0.012971,
    ('Islamabad', 'Faisal Town', 'Commercial', 20.0): 0.014196,
    ('Islamabad', 'Faisal Town', 'Residential', 4.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 5.0): 0.023751,
    ('Islamabad', 'Faisal Town', 'Residential', 6.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 7.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 8.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 9.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 10.0): 0.026178,
    ('Islamabad', 'Faisal Town', 'Residential', 11.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 12.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 13.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 14.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 15.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 16.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 17.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 18.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 19.0): 0.029640,
    ('Islamabad', 'Faisal Town', 'Residential', 20.0): 0.029640,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 4.0): 0.014936,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 5.0): 0.014893,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 6.0): 0.012379,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 7.0): 0.015311,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 8.0): 0.012622,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 9.0): 0.014891,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 10.0): 0.014057,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 12.0): 0.014653,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 13.0): 0.014480,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 14.0): 0.014008,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 15.0): 0.014953,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 16.0): 0.012722,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 17.0): 0.014982,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 18.0): 0.016293,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 19.0): 0.013055,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Commercial', 20.0): 0.013803,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 4.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 5.0): 0.021512,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 6.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 7.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 8.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 9.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 11.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 12.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 13.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 14.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 15.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 16.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 17.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 18.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 19.0): 0.043920,
    ('Rawalpindi', 'Bahria Town Rawalpindi', 'Residential', 20.0): 0.043920,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 4.0): 0.015386,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 5.0): 0.015213,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 6.0): 0.013784,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 7.0): 0.013291,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 8.0): 0.016157,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 9.0): 0.013169,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 10.0): 0.015458,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 12.0): 0.013157,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 13.0): 0.015987,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 14.0): 0.013104,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 15.0): 0.016765,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 16.0): 0.013049,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 17.0): 0.015957,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 18.0): 0.013031,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 19.0): 0.014620,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Commercial', 20.0): 0.016013,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 4.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 5.0): 0.026558,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 6.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 7.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 8.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 9.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 11.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 12.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 13.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 14.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 15.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 16.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 17.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 18.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential',19.0): 0.054223,
    ('Rawalpindi', 'DHA Islamabad-Rawalpindi', 'Residential', 20.0): 0.054223,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 4.0): 0.012788,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 5.0): 0.017440,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 6.0): 0.015141,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 7.0): 0.014170,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 8.0): 0.015415,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 9.0): 0.012031,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 10.0): 0.014996,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 12.0): 0.013473,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 13.0): 0.013630,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 14.0): 0.014989,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 15.0): 0.014276,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 16.0): 0.015817,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 17.0): 0.014137,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 18.0): 0.014048,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 19.0): 0.014165,
    ('Rawalpindi', 'Faisal Hills', 'Commercial', 20.0): 0.015417,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 4.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 5.0): 0.029075,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 6.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 7.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 8.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 9.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 10.0): 0.026138,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 11.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 12.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 13.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 14.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 15.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 16.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 17.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 18.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 19.0): 0.052709,
    ('Rawalpindi', 'Faisal Hills', 'Residential', 20.0): 0.052709,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 4.0): 0.014563,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 5.0): 0.015155,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 6.0): 0.015794,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 7.0): 0.015711,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 8.0): 0.014908,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 9.0): 0.014505,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 10.0): 0.014763,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 12.0): 0.013007,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 13.0): 0.015668,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 14.0): 0.013249,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 15.0): 0.013277,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 16.0): 0.015537,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 17.0): 0.013789,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 18.0): 0.015414,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 19.0): 0.016260,
    ('Rawalpindi', 'Grace Valley', 'Commercial', 20.0): 0.014601,
    ('Rawalpindi', 'Grace Valley', 'Residential', 4.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 5.0): 0.025142,
    ('Rawalpindi', 'Grace Valley', 'Residential', 6.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 7.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 8.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 9.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 10.0): 0.025194,
    ('Rawalpindi', 'Grace Valley', 'Residential', 11.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 12.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 13.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 14.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 15.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 16.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 17.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 18.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 19.0): 0.029176,
    ('Rawalpindi', 'Grace Valley', 'Residential', 20.0): 0.029176
}

# ============================================================================
# DATA PREPARATION (Societies & Sectors)
# ============================================================================
unique_societies = sorted(list({key[1] for key in APPRECIATION_RATES.keys()}))
societies_data = {}
for city in ['Islamabad', 'Rawalpindi']:
    societies_in_city = sorted(list({k[1] for k in APPRECIATION_RATES.keys() if k[0] == city}))
    societies_data[city] = societies_in_city

sectors_data = {
    'DHA Islamabad': ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5'],
    'Bahria Town Islamabad': ['Block A', 'Block B', 'Commoners', 'Block D', 'Overseas Block'],
    'Capital Smart City': ['Overseas Block', 'Block A', 'Square One', 'Executive Block'],
    'Faisal Town': ['F-1', 'F-2', 'F-3', 'Main Boulevard', 'G-1', 'G-2'],
    'Bahria Town Rawalpindi': ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Sector Market', 'Overseas'],
    'DHA Islamabad-Rawalpindi': ['Sector Z', 'Saddar', 'Main Commercial', 'Silver Plaza'],
    'Faisal Hills': ['Commercial Zone A', 'High Rise Plaza', 'Sector C'],
    'Grace Valley': ['Main Boulevard', 'Central Commercial', 'Sector 3'],
}
sectors_data = {k: v for k, v in sectors_data.items() if k in unique_societies}

def get_appreciation_rate(city, society, location_type, size_numeric):
    key = (city, society, location_type, size_numeric)
    if key in APPRECIATION_RATES:
        return APPRECIATION_RATES[key]

    # Fallback 1: Try ignoring Size
    for (c, s, l, sz), rate in APPRECIATION_RATES.items():
        if c == city and s == society and l == location_type:
            return rate
    # Fallback 2: Try ignoring Location Type
    for (c, s, l, sz), rate in APPRECIATION_RATES.items():
        if c == city and s == society:
            return rate
    # Fallback 3: City average
    city_rates = [r for (c, s, l, sz), r in APPRECIATION_RATES.items() if c == city]
    if city_rates:
        return sum(city_rates) / len(city_rates)
    return 0.01

# Define the exact data structure expected from the frontend
class PropertyInput(BaseModel):
    city: str
    location_type: str
    society: str
    block_sector: str
    size: str
    investment_period: str
    current_price: float

@app.get("/")
def read_root():
    return {"message": "Welcome to the Property Price Prediction API! Go to /docs to test the API."}

@app.get("/metadata")
def get_metadata():
    """Endpoint to provide dropdown options for frontends."""
    return {
        "societies_data": societies_data,
        "sectors_data": sectors_data
    }

@app.post("/predict")
def predict_price(data: PropertyInput):
    try:
        if best_model is None:
             # Mock prediction for UI testing if model is missing
            current_price = float(data.current_price)
            return {
                'success': True,
                'current_price': current_price,
                'predicted_price': current_price * 1.15,
                'prediction': current_price * 1.15,
                'lower_bound': current_price * 1.10,
                'upper_bound': current_price * 1.20,
                'estimated_return': current_price * 0.15,
                'return_percentage': 15.0,
                'investment_period': data.investment_period,
                'confidence': 85,
                'property_details': data.model_dump(),
                'data': {
                    'prediction': current_price * 1.15,
                    'current_predicted_price': current_price,
                    'appreciation_rate': 15.0,
                    'holding_period_months': 12
                }
            }

        # Extract numerical size
        size_str = str(data.size).split()[0]
        size_numeric = float(size_str)

        # Extract investment period in months
        period_map = {f"{i} Months": i for i in range(2, 37)}
        investment_months = period_map.get(data.investment_period, 12)

        # Safely encode categorical variables (Fallback defaults used if an exact match isn't found)
        try: 
            city_encoded = int(le_city.transform([data.city])[0])
        except: 
            city_encoded = 0
            
        try: 
            status_encoded = int(le_status.transform(['Mostly Developed'])[0])
        except: 
            status_encoded = 1
            
        try: 
            society_encoded = int(le_society.transform([data.society])[0])
        except: 
            society_encoded = 0
        
        # Calculate Appreciation and Lags natively in the backend
        appreciation_rate = get_appreciation_rate(data.city, data.society, data.location_type, size_numeric)
        quarters_back = investment_months / 3
        price_lag1 = float(data.current_price / (1 + appreciation_rate) ** 1)
        price_lag2 = float(data.current_price / (1 + appreciation_rate) ** 2)
        price_lag3 = float(data.current_price / (1 + appreciation_rate) ** 3)
        price_ma2 = float((price_lag1 + price_lag2) / 2)
        price_ma3 = float((price_lag1 + price_lag2 + price_lag3) / 3)
        price_change = float((appreciation_rate * 100) * quarters_back)
        
        # Global fixed economic markers to keep the prediction standardized
        policy_rate = 10.5
        inflation = 5.8
        gdp_growth = 3.5
        construction_cost = 450
        exchange_rate = 513
        unemployment = 4.2
        
        real_rate = float(policy_rate - inflation)
        economic_stress = float(1.0 - gdp_growth)
        
        features = np.array([
            float(policy_rate), float(inflation), float(gdp_growth),
            float(construction_cost), float(exchange_rate), float(unemployment),
            price_lag1, price_lag2, price_lag3, price_ma2, price_ma3,
            price_change, real_rate, economic_stress,
            float(city_encoded), float(status_encoded), float(society_encoded), float(size_numeric)
        ]).reshape(1, -1)
        
        features_scaled = scaler_X.transform(features)
        prediction = best_model.predict(features_scaled)[0]
        
        return {
            "success": True,
            "current_price": float(data.current_price),
            "predicted_price": float(prediction),
            "prediction": float(prediction),
            "lower_bound": float(prediction * 0.90),
            "upper_bound": float(prediction * 1.10),
            "estimated_return": float(prediction - data.current_price),
            "return_percentage": float(((prediction - data.current_price) / data.current_price) * 100),
            "investment_period": data.investment_period,
            "confidence": 90,
            "property_details": data.model_dump(),
            "data": {
                "prediction": float(prediction),
                "current_predicted_price": float(data.current_price),
                "appreciation_rate": float(appreciation_rate * 100),
                "holding_period_months": int(investment_months)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
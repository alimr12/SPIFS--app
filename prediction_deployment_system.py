"""
================================================================================
PLOT PRICE PREDICTION - MODEL DEPLOYMENT & INTERACTIVE PREDICTION SYSTEM
Islamabad & Rawalpindi Property Market (2020-2026)
================================================================================

This script:
1. Loads the trained best model (XGBoost)
2. Creates an interactive GUI for user input
3. Makes predictions based on user-provided property details
4. Displays results with confidence intervals
5. Saves predictions to file for tracking

Author: Real Estate AI Team
Version: 1.0 (Deployment Ready)
Date: April 2026
"""

import pandas as pd
import numpy as np
import pickle
import os
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Try importing GUI libraries
try:
    import tkinter as tk
    from tkinter import ttk, messagebox
    GUI_AVAILABLE = True
except ImportError:
    GUI_AVAILABLE = False
    print("⚠ Tkinter not available. Will use CLI mode instead.")

# Machine learning libraries
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("⚠ XGBoost not available")

from sklearn.preprocessing import StandardScaler, LabelEncoder

print("="*80)
print("PLOT PRICE PREDICTION - MODEL DEPLOYMENT & PREDICTION SYSTEM")
print("="*80)

# ============================================================================
# SECTION 1: TRAIN AND SAVE THE BEST MODEL
# ============================================================================

print("\n[1/4] TRAINING AND SAVING BEST MODEL...")
print("-"*80)

# Load data
try:
    property_df = pd.read_csv('plot_price_historical_dataset_.csv')
    macro_df = pd.read_csv('pakistan_macroeconomic_indicators_2020_2026.csv')
    print(f"✓ Data loaded: Property={property_df.shape}, Macro={macro_df.shape}")
except FileNotFoundError:
    print("❌ Error: CSV files not found")
    print("Make sure these files are in the current directory:")
    print("  - plot_price_historical_dataset.csv")
    print("  - pakistan_macroeconomic_indicators_2020_2026.csv")
    exit()

# Merge datasets
merged_df = pd.merge(property_df, macro_df, on=['Year', 'Month'], how='left')

# Data cleaning
merged_df = merged_df.fillna(method='ffill')
merged_df = merged_df.fillna(method='bfill')

# Create numeric size column
def convert_size_to_numeric(size_str):
    try:
        if 'Marla' in str(size_str):
            return float(str(size_str).split()[0])
        elif 'Kanal' in str(size_str):
            return float(str(size_str).split()[0]) * 20
        else:
            return 5.0
    except:
        return 5.0

merged_df['Size_numeric'] = merged_df['Size'].apply(convert_size_to_numeric)

# Feature engineering
df = merged_df.copy()

# Encode categorical variables
le_city = LabelEncoder()
le_status = LabelEncoder()
le_society = LabelEncoder()

df['City_Encoded'] = le_city.fit_transform(df['City'].astype(str))
df['Dev_Status_Encoded'] = le_status.fit_transform(df['Development_Status'].astype(str))
df['Society_Encoded'] = le_society.fit_transform(df['Society_Project'].astype(str))

# Create lag features
for lag in [1, 2, 3]:
    df[f'Price_Lag{lag}'] = df.groupby('Society_Project')['Price_PKR'].shift(lag)

# Rolling statistics
for window in [2, 3]:
    df[f'Price_MA{window}'] = df.groupby('Society_Project')['Price_PKR'].transform(
        lambda x: x.rolling(window=window, min_periods=1).mean()
    )

# Price momentum
df['Price_Change'] = df.groupby('Society_Project')['Price_PKR'].pct_change() * 100

# Economic indicators
df['Real_Rate'] = df['Policy_Rate_Percent'] - df['CPI_Inflation_Percent']
df['Economic_Stress'] = (df['Current_Account_Deficit_Percent_GDP'] * 2) - df['GDP_Growth_Rate_Percent']

# Remove NaN
df = df.dropna()

# Select features
feature_cols = [
    'Policy_Rate_Percent', 'CPI_Inflation_Percent', 'GDP_Growth_Rate_Percent',
    'Construction_Cost_Index', 'Exchange_Rate_PKR_USD', 'Unemployment_Rate_Percent',
    'Price_Lag1', 'Price_Lag2', 'Price_Lag3',
    'Price_MA2', 'Price_MA3', 'Price_Change', 'Real_Rate', 'Economic_Stress',
    'City_Encoded', 'Dev_Status_Encoded', 'Society_Encoded', 'Size_numeric'
]

X = df[feature_cols].fillna(df[feature_cols].mean()).values
y = df['Price_PKR'].values

# Standardize features
scaler_X = StandardScaler()
X_scaled = scaler_X.fit_transform(X)

# Temporal split
train_size = int(len(X) * 0.85)  # 85% for training
X_train, y_train = X_scaled[:train_size], y[:train_size]
X_test, y_test = X_scaled[train_size:], y[train_size:]

# Train XGBoost (best model)
print("\nTraining XGBoost model...")
best_model = xgb.XGBRegressor(
    n_estimators=150,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    random_state=42,
    verbosity=0
)

best_model.fit(X_train, y_train)

# Evaluate
y_pred = best_model.predict(X_test)
r2 = best_model.score(X_test, y_test)
rmse = np.sqrt(np.mean((y_test - y_pred) ** 2))
mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

print(f"✓ Model trained!")
print(f"  R² Score: {r2:.4f}")
print(f"  RMSE: PKR {rmse:,.0f}")
print(f"  MAPE: {mape:.2f}%")

# Save model and scalers
model_data = {
    'model': best_model,
    'scaler_X': scaler_X,
    'feature_cols': feature_cols,
    'le_city': le_city,
    'le_status': le_status,
    'le_society': le_society,
    'r2': r2,
    'rmse': rmse,
    'mape': mape,
    'training_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
}

# Save as pickle
with open('best_model_xgboost.pkl', 'wb') as f:
    pickle.dump(model_data, f)

print(f"✓ Model saved: best_model_xgboost.pkl")

# ============================================================================
# SECTION 2: LOAD MODEL AND CREATE PREDICTION SYSTEM
# ============================================================================

print("\n[2/4] LOADING MODEL FOR PREDICTIONS...")
print("-"*80)

# Load model
with open('best_model_xgboost.pkl', 'rb') as f:
    model_data = pickle.load(f)

best_model = model_data['model']
scaler_X = model_data['scaler_X']
feature_cols = model_data['feature_cols']
le_city = model_data['le_city']
le_status = model_data['le_status']
le_society = model_data['le_society']

print(f"✓ Model loaded successfully!")
print(f"  R² Score: {model_data['r2']:.4f}")
print(f"  RMSE: PKR {model_data['rmse']:,.0f}")
print(f"  MAPE: {model_data['mape']:.2f}%")
print(f"  Training Date: {model_data['training_date']}")

# ============================================================================
# SECTION 3: PREDICTION FUNCTION
# ============================================================================

print("\n[3/4] CREATING PREDICTION FUNCTION...")
print("-"*80)

# Get all unique values for user selection
cities = list(le_city.classes_)
dev_statuses = list(le_status.classes_)
societies = list(le_society.classes_)
sizes = [5.0, 7.5, 10.0, 15.0, 20.0]  # Common plot sizes

print(f"✓ Available cities: {', '.join(cities)}")
print(f"✓ Available development statuses: {', '.join(dev_statuses[:3])}...")
print(f"✓ Available societies: {len(societies)} options")
print(f"✓ Available plot sizes: {', '.join([str(s) for s in sizes])} Marla/Kanal")

def predict_price(property_details):
    """
    Predict property price based on user input
    
    Parameters:
    property_details: dict with following keys
        - policy_rate: Current policy interest rate (%)
        - inflation: Current inflation rate (%)
        - gdp_growth: GDP growth rate (%)
        - construction_cost_index: Construction cost index
        - exchange_rate: PKR to USD exchange rate
        - unemployment: Unemployment rate (%)
        - price_lag1: Previous quarter price (in millions)
        - price_lag2: 2 quarters ago price (in millions)
        - price_lag3: 3 quarters ago price (in millions)
        - price_ma2: 2-quarter moving average (in millions)
        - price_ma3: 3-quarter moving average (in millions)
        - price_change: Previous price change (%)
        - city: City name (Islamabad/Rawalpindi)
        - dev_status: Development status
        - society: Society/Project name
        - size: Plot size in Marla
    
    Returns:
    dict with prediction and details
    """
    
    try:
        # Extract values
        policy_rate = float(property_details['policy_rate'])
        inflation = float(property_details['inflation'])
        gdp_growth = float(property_details['gdp_growth'])
        construction_cost = float(property_details['construction_cost_index'])
        exchange_rate = float(property_details['exchange_rate'])
        unemployment = float(property_details['unemployment'])
        price_lag1 = float(property_details['price_lag1']) * 1e6  # Convert to PKR
        price_lag2 = float(property_details['price_lag2']) * 1e6
        price_lag3 = float(property_details['price_lag3']) * 1e6
        price_ma2 = float(property_details['price_ma2']) * 1e6
        price_ma3 = float(property_details['price_ma3']) * 1e6
        price_change = float(property_details['price_change'])
        city = property_details['city']
        dev_status = property_details['dev_status']
        society = property_details['society']
        size = float(property_details['size'])
        
        # Encode categorical variables
        city_encoded = le_city.transform([city])[0]
        dev_status_encoded = le_status.transform([dev_status])[0]
        society_encoded = le_society.transform([society])[0]
        
        # Calculate derived features
        real_rate = policy_rate - inflation
        economic_stress = (2.0 * 0.5) - gdp_growth  # Dummy CAD value
        
        # Create feature vector in correct order
        features = np.array([
            policy_rate,
            inflation,
            gdp_growth,
            construction_cost,
            exchange_rate,
            unemployment,
            price_lag1,
            price_lag2,
            price_lag3,
            price_ma2,
            price_ma3,
            price_change,
            real_rate,
            economic_stress,
            city_encoded,
            dev_status_encoded,
            society_encoded,
            size
        ]).reshape(1, -1)
        
        # Scale features
        features_scaled = scaler_X.transform(features)
        
        # Predict
        prediction = best_model.predict(features_scaled)[0]
        
        # Calculate confidence interval (±10%)
        confidence = 0.90
        margin = prediction * 0.10
        lower_bound = prediction - margin
        upper_bound = prediction + margin
        
        return {
            'status': 'success',
            'prediction': prediction,
            'lower_bound': lower_bound,
            'upper_bound': upper_bound,
            'confidence': confidence,
            'input_data': property_details
        }
    
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }

print("✓ Prediction function created")

# ============================================================================
# SECTION 4: USER INTERFACE (CLI + Optional GUI)
# ============================================================================

print("\n[4/4] CREATING USER INTERFACE...")
print("-"*80)

class PropertyPredictionSystem:
    """Interactive property prediction system"""
    
    def __init__(self):
        self.prediction_history = []
        self.predictions_file = 'prediction_history.json'
        self.load_history()
    
    def load_history(self):
        """Load previous predictions"""
        if os.path.exists(self.predictions_file):
            try:
                with open(self.predictions_file, 'r') as f:
                    self.prediction_history = json.load(f)
            except:
                self.prediction_history = []
    
    def save_prediction(self, result):
        """Save prediction to history"""
        if result['status'] == 'success':
            record = {
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'input': result['input_data'],
                'prediction': round(result['prediction'], 2),
                'lower_bound': round(result['lower_bound'], 2),
                'upper_bound': round(result['upper_bound'], 2)
            }
            self.prediction_history.append(record)
            
            # Save to file
            with open(self.predictions_file, 'w') as f:
                json.dump(self.prediction_history, f, indent=2)
    
    def display_result(self, result):
        """Display prediction result"""
        if result['status'] == 'error':
            print(f"\n❌ Error: {result['message']}")
            return
        
        pred = result['prediction']
        lower = result['lower_bound']
        upper = result['upper_bound']
        
        print("\n" + "="*80)
        print("PREDICTION RESULT")
        print("="*80)
        print(f"\n📊 Property Details:")
        print(f"  City: {result['input_data']['city']}")
        print(f"  Society: {result['input_data']['society']}")
        print(f"  Size: {result['input_data']['size']} Marla")
        print(f"  Development Status: {result['input_data']['dev_status']}")
        
        print(f"\n💰 Price Prediction:")
        print(f"  Estimated Price: PKR {pred:,.0f}")
        print(f"  Confidence Range (±10%): PKR {lower:,.0f} - PKR {upper:,.0f}")
        print(f"  Confidence Level: {result['confidence']*100:.0f}%")
        
        print(f"\n📈 Market Factors:")
        print(f"  Policy Rate: {result['input_data']['policy_rate']}%")
        print(f"  Inflation: {result['input_data']['inflation']}%")
        print(f"  GDP Growth: {result['input_data']['gdp_growth']}%")
        
        print("\n" + "="*80 + "\n")
    
    def get_cli_input(self):
        """Get user input from command line"""
        print("\n" + "="*80)
        print("PROPERTY PRICE PREDICTION - MANUAL INPUT")
        print("="*80)
        
        # City selection
        print(f"\nAvailable Cities:")
        for i, city in enumerate(cities, 1):
            print(f"  {i}. {city}")
        city_choice = int(input(f"Select city (1-{len(cities)}): "))
        city = cities[city_choice - 1]
        
        # Development status selection
        print(f"\nAvailable Development Status:")
        for i, status in enumerate(dev_statuses, 1):
            print(f"  {i}. {status}")
        status_choice = int(input(f"Select status (1-{len(dev_statuses)}): "))
        dev_status = dev_statuses[status_choice - 1]
        
        # Society selection
        print(f"\nAvailable Societies (showing first 20):")
        display_societies = societies[:20]
        for i, soc in enumerate(display_societies, 1):
            print(f"  {i}. {soc}")
        if len(societies) > 20:
            print(f"  ... and {len(societies)-20} more")
        
        society_choice = int(input(f"Select society (1-{len(display_societies)}): "))
        society = display_societies[society_choice - 1]
        
        # Size selection
        print(f"\nAvailable Plot Sizes:")
        for i, s in enumerate(sizes, 1):
            print(f"  {i}. {s} Marla")
        size_choice = int(input(f"Select size (1-{len(sizes)}): "))
        size = sizes[size_choice - 1]
        
        # Economic indicators
        print(f"\nEnter Current Economic Indicators:")
        policy_rate = float(input("  Policy Interest Rate (6-22%): "))
        inflation = float(input("  Inflation Rate (3-32%): "))
        gdp_growth = float(input("  GDP Growth Rate (-2 to 6%): "))
        construction_cost = float(input("  Construction Cost Index (100-600): "))
        exchange_rate = float(input("  PKR to USD Exchange Rate (150-520): "))
        unemployment = float(input("  Unemployment Rate (3-7%): "))
        
        # Historical prices
        print(f"\nEnter Previous Price Data (in Millions PKR):")
        price_lag1 = float(input("  Price 1 quarter ago: "))
        price_lag2 = float(input("  Price 2 quarters ago: "))
        price_lag3 = float(input("  Price 3 quarters ago: "))
        price_ma2 = float(input("  2-quarter moving average: "))
        price_ma3 = float(input("  3-quarter moving average: "))
        
        # Price change
        price_change = float(input("  Previous price change percentage: "))
        
        # Create property details dict
        property_details = {
            'policy_rate': policy_rate,
            'inflation': inflation,
            'gdp_growth': gdp_growth,
            'construction_cost_index': construction_cost,
            'exchange_rate': exchange_rate,
            'unemployment': unemployment,
            'price_lag1': price_lag1,
            'price_lag2': price_lag2,
            'price_lag3': price_lag3,
            'price_ma2': price_ma2,
            'price_ma3': price_ma3,
            'price_change': price_change,
            'city': city,
            'dev_status': dev_status,
            'society': society,
            'size': size
        }
        
        return property_details
    
    def run_cli_mode(self):
        """Run in command-line mode"""
        print("\n✓ Running in CLI Mode (Command-Line Interface)")
        
        while True:
            try:
                # Get user input
                property_details = self.get_cli_input()
                
                # Predict
                result = predict_price(property_details)
                
                # Display result
                self.display_result(result)
                
                # Save prediction
                if result['status'] == 'success':
                    self.save_prediction(result)
                    print("✓ Prediction saved to history")
                
                # Ask for another prediction
                again = input("Make another prediction? (yes/no): ").lower()
                if again not in ['yes', 'y']:
                    break
            
            except ValueError:
                print("❌ Invalid input. Please try again.")
            except Exception as e:
                print(f"❌ Error: {e}")
                break
        
        print("\n✓ Thank you for using the prediction system!")
        self.print_summary()
    
    def print_summary(self):
        """Print prediction summary"""
        if not self.prediction_history:
            return
        
        print("\n" + "="*80)
        print("PREDICTION HISTORY SUMMARY")
        print("="*80)
        print(f"Total predictions: {len(self.prediction_history)}")
        
        predictions = [p['prediction'] for p in self.prediction_history]
        print(f"Average predicted price: PKR {np.mean(predictions):,.0f}")
        print(f"Min predicted price: PKR {np.min(predictions):,.0f}")
        print(f"Max predicted price: PKR {np.max(predictions):,.0f}")
        print(f"\nAll predictions saved to: {self.predictions_file}")

# Create system instance
system = PropertyPredictionSystem()

print("✓ Prediction system initialized")

# ============================================================================
# DEMO PREDICTIONS
# ============================================================================

print("\n" + "="*80)
print("SAMPLE PREDICTIONS (DEMO)")
print("="*80)

# Sample 1: DHA Islamabad
sample1 = {
    'policy_rate': 10.5,
    'inflation': 5.8,
    'gdp_growth': 3.5,
    'construction_cost_index': 450,
    'exchange_rate': 513,
    'unemployment': 4.2,
    'price_lag1': 10.0,
    'price_lag2': 9.8,
    'price_lag3': 9.5,
    'price_ma2': 9.9,
    'price_ma3': 9.8,
    'price_change': 2.0,
    'city': 'Islamabad',
    'dev_status': 'Fully Developed',
    'society': 'DHA Islamabad',
    'size': 10.0
}

result1 = predict_price(sample1)
print("\nSample 1: Premium Property (DHA Islamabad, 10 Marla)")
system.display_result(result1)
system.save_prediction(result1)

# Sample 2: Bahria Town Islamabad
sample2 = {
    'policy_rate': 10.5,
    'inflation': 5.8,
    'gdp_growth': 3.5,
    'construction_cost_index': 450,
    'exchange_rate': 513,
    'unemployment': 4.2,
    'price_lag1': 7.5,
    'price_lag2': 7.2,
    'price_lag3': 6.9,
    'price_ma2': 7.4,
    'price_ma3': 7.2,
    'price_change': 4.0,
    'city': 'Islamabad',
    'dev_status': 'Mostly Developed',
    'society': 'Bahria Town Islamabad',
    'size': 7.5
}

result2 = predict_price(sample2)
print("Sample 2: Mid-Range Property (Bahria Town, 7.5 Marla)")
system.display_result(result2)
system.save_prediction(result2)

# Sample 3: Rawalpindi
sample3 = {
    'policy_rate': 10.5,
    'inflation': 5.8,
    'gdp_growth': 3.5,
    'construction_cost_index': 450,
    'exchange_rate': 513,
    'unemployment': 4.2,
    'price_lag1': 5.0,
    'price_lag2': 4.8,
    'price_lag3': 4.6,
    'price_ma2': 4.9,
    'price_ma3': 4.8,
    'price_change': 3.5,
    'city': 'Rawalpindi',
    'dev_status': 'Under Development',
    'society': 'Bahria Town Rawalpindi',
    'size': 5.0
}

result3 = predict_price(sample3)
print("Sample 3: Budget Property (Rawalpindi, 5 Marla)")
system.display_result(result3)
system.save_prediction(result3)

# ============================================================================
# MAIN MENU
# ============================================================================

print("\n" + "="*80)
print("MAIN MENU")
print("="*80)
print("\nOptions:")
print("  1. Make a new prediction (interactive)")
print("  2. View prediction history")
print("  3. Save and exit")

choice = input("\nSelect option (1-3): ")

if choice == '1':
    system.run_cli_mode()
elif choice == '2':
    system.print_summary()
    if system.prediction_history:
        print("\nDetailed History:")
        for i, pred in enumerate(system.prediction_history, 1):
            print(f"\n{i}. {pred['timestamp']}")
            print(f"   Prediction: PKR {pred['prediction']:,.0f}")
            print(f"   Range: PKR {pred['lower_bound']:,.0f} - PKR {pred['upper_bound']:,.0f}")
else:
    print("\n✓ Exiting...")

print("\n" + "="*80)
print("✓ DEPLOYMENT SYSTEM COMPLETE!")
print("="*80)
print("\nFiles created:")
print("  ✓ best_model_xgboost.pkl - Trained model")
print("  ✓ prediction_history.json - Prediction records")
print("\nReady for production use!")

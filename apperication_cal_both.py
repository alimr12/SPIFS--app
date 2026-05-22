import pandas as pd
import numpy as np

print("="*80)
print("APPRECIATION RATE CALCULATOR (Commercial + Residential, 74-Month Trend)")
print("="*80)

# ============================================================================
# 1. LOAD DATASETS
# ============================================================================

try:
    property_df = pd.read_csv('plot_price_historical_dataset_.csv')
    macro_df = pd.read_csv('pakistan_macroeconomic_indicators_2020_2026.csv')
    print(f"✓ Property data loaded: {property_df.shape}")
    print(f"✓ Macro data loaded: {macro_df.shape}")
    
except FileNotFoundError as e:
    print(f"❌ Error: {e}")
    exit()

# ============================================================================
# 2. DATA CLEANING
# ============================================================================

# Convert Date
property_df['Date'] = pd.to_datetime(property_df['Date'])

# Convert Size to Numeric
def get_numeric_size(size_str):
    try:
        if 'Marla' in str(size_str):
            return float(str(size_str).split()[0])
        elif 'Kanal' in str(size_str):
            return float(str(size_str).split()[0]) * 20
        else:
            return np.nan
    except:
        return np.nan

property_df['Size_Num'] = property_df['Size'].apply(get_numeric_size)

# Clean data
property_df = property_df.dropna(subset=['Size_Num', 'Price_PKR', 'Location_Type'])
property_df = property_df.sort_values('Date')

# ============================================================================
# 3. CALCULATE APPRECIATION RATES (UPDATED LOGIC)
# ============================================================================

print("\n[1/2] Calculating appreciation rates (Residential & Commercial)...")
print(f"Using Trend Period: Last 74 months")

# Group by City, Society, Location Type, and Size
# This ensures we get rates for "Residential" AND "Commercial" separately
groups = property_df.groupby(['City', 'Society_Project', 'Location_Type', 'Size_Num'])

appreciation_dict = {}
results_list = []

# Set Trend Period to 74 (as requested)
TREND_PERIOD = 74 

for name, group in groups:
    city, society, loc_type, size = name
    
    # Calculate monthly percentage change
    group = group.copy()
    group['Monthly_Growth'] = group['Price_PKR'].pct_change()
    
    # Filter to the last 74 months of data (most recent trend)
    recent_growth = group['Monthly_Growth'].tail(TREND_PERIOD)
    
    if not recent_growth.empty and not recent_growth.isna().all():
        avg_rate = recent_growth.mean()
        
        # Store in dictionary
        key = (city, society, loc_type, size)
        appreciation_dict[key] = avg_rate
        
        # Store for display
        annualized = ( (1+avg_rate)**12 - 1 )*100
        
        results_list.append({
            'City': city,
            'Society': society,
            'Location Type': loc_type,
            'Size (Marla)': size,
            'Avg Monthly Growth': f"{avg_rate*100:.4f}%",
            'Annualized': f"{annualized:.2f}%",
            'Data Points': len(recent_growth)
        })

# Create a DataFrame for viewing
results_df = pd.DataFrame(results_list)

# Sort to show Commercial clearly if available
results_df = results_df.sort_values(['Location Type', 'City', 'Society'])

print(f"\n✓ Calculated rates based on the last {TREND_PERIOD} months of data.")
print("-"*80)
print(results_df.to_string(index=False))
print("-"*80)

# ============================================================================
# 4. GENERATE HARDCODED PYTHON CODE
# ============================================================================

print("\n[2/2] Generating Python Code for Hardcoding...")
print("-"*80)

print("COPY THE CODE BELOW AND PASTE IT INTO YOUR PREDICTION SCRIPT:\n")

print("APPRECIATION_RATES = {")

# Generate the dictionary entries
entries = []
for key, rate in appreciation_dict.items():
    city, society, loc_type, size = key
    # Create a string like: ('Islamabad', 'DHA Islamabad', 'Commercial', 10.0): 0.018,
    entry_str = f"    ({repr(city)}, {repr(society)}, {repr(loc_type)}, {size}): {rate:.6f},"
    entries.append(entry_str)

# Print the dictionary
if entries:
    print("\n".join(entries)[:-1].replace("}", "")) # remove last comma
else:
    print("    # No data found to calculate rates.")
    
print("}")

print("-"*80)

# Provide a helper function code snippet
print("\nALSO PASTE THIS HELPER FUNCTION INTO YOUR SCRIPT:\n")
print("""
def get_appreciation_rate(city, society, loc_type, size):
    # Fallback logic: Try exact match first
    key = (city, society, loc_type, size)
    
    if key in APPRECIATION_RATES:
        return APPRECIATION_RATES[key]
    
    # Fallback 1: Try ignoring Size (but keeping Loc Type)
    for (c, s, l, sz), rate in APPRECIATION_RATES.items():
        if c == city and s == society and l == loc_type:
            return rate
            
    # Fallback 2: Try ignoring Location Type
    for (c, s, l, sz), rate in APPRECIATION_RATES.items():
        if c == city and s == society and sz == size:
            return rate

    # Fallback 3: Try just Society (General average)
    for (c, s, l, sz), rate in APPRECIATION_RATES.items():
        if c == city and s == society:
            return rate

    # Fallback 4: Global default (1% monthly approx)
    return 0.01
""")

print("\n" + "="*80)
print("✓ ANALYSIS COMPLETE")
print("="*80)
print(f"1. Table above shows rates for both Commercial and Residential.")
print(f"2. Trend Period: {TREND_PERIOD} months.")
print(f"3. Paste the dictionary code into your main script.")
print("="*80)
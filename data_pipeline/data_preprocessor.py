import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

np.random.seed(42)

# Load the data
df = pd.read_csv('farm_thingy_data.csv')

# Stimulating hardware failures
brokenSensorChance = 0.05 # 5% chance of a sensor reading being broken
random_mask = np.random.rand(len(df)) < brokenSensorChance
df.loc[random_mask, 'Temperature_Cel'] = np.nan

missingCount = df['Temperature_Cel'].isna().sum()
print(f"Introduced {missingCount} missing values in 'Temperature_Cel' column.")

# Data cleaning
df['Temperature_Cel'] = df['Temperature_Cel'].interpolate()

# Normalize the data
scaler = MinMaxScaler()
columns_to_scale = ['Soil_Moisture_Pct', 'Temperature_Cel', 'Humidity_Pct', 'Light_Intensity_Lux', 'NPK_Levels']
df[columns_to_scale] = scaler.fit_transform(df[columns_to_scale])  

df.to_csv('ai_ready_farm_data.csv', index=False)

import numpy as np;
import pandas as pd

np.random.seed(42)

def generate_scenario_data(start_date, scenario_name, m_loc, m_scale, t_loc, t_scale, h_loc, h_scale, l_loc, l_scale, n_loc, n_scale, rows=720):
    total_rows = rows

    # Time stamps
    timeStamps = pd.date_range(start=start_date, periods=total_rows, freq='h')

    # Sensor data
    soil_moisture = np.random.normal(loc=m_loc, scale=m_scale, size=total_rows)
    temperature = np.random.normal(loc=t_loc, scale=t_scale, size=total_rows)
    humidity = np.random.normal(loc=h_loc, scale=h_scale, size=total_rows)
    light_intensity = np.random.normal(loc=l_loc, scale=l_scale, size=total_rows)
    npk_levels = np.random.normal(loc=n_loc, scale=n_scale, size=total_rows)

    soil_moisture = np.clip(soil_moisture, 0, 100)
    temperature = np.clip(temperature, 0, 50)
    humidity = np.clip(humidity, 0, 100)
    light_intensity = np.clip(light_intensity, 0, 100)
    npk_levels = np.clip(npk_levels, 0, 100)

    hour_of_day = np.array([t.hour for t in timeStamps])
    light = np.where((hour_of_day >= 6) & (hour_of_day <= 18),
            np.random.normal(80, 5, total_rows),   # daytime
            np.random.normal(5, 2, total_rows))    # nighttime
    light = np.clip(light, 0, 100)          


    # Data Frame
    return pd.DataFrame({
        'Timestamp': timeStamps,
        'Soil_Moisture_Pct': np.round(soil_moisture, 2),
        'Temperature_Cel': np.round(temperature, 2),
        'Humidity_Pct': np.round(humidity, 2),
        'Light_Intensity_Lux': np.round(light_intensity, 2),
        'NPK_Levels': np.round(npk_levels, 2),
        'Scenario': scenario_name
    })

    # Data Frame Creation
df_optimal = generate_scenario_data(
    '2026-05-01', 'Optimal', 
    m_loc=60.0, m_scale=2.0, t_loc=22.0, t_scale=1.0, 
    h_loc=65.0, h_scale=3.0, l_loc=80.0, l_scale=5.0, n_loc=50.0, n_scale=1.5)    

df_drought = generate_scenario_data(
    '2026-06-01', 'Under-watered', 
    m_loc=20.0, m_scale=3.0, t_loc=25.0, t_scale=1.5, 
    h_loc=55.0, h_scale=4.0, l_loc=80.0, l_scale=5.0, n_loc=50.0, n_scale=1.5)

df_flood = generate_scenario_data(
    '2026-08-01', 'Over-irrigation', 
    m_loc=96.0, m_scale=1.0, t_loc=21.0, t_scale=1.0, 
    h_loc=70.0, h_scale=2.0, l_loc=80.0, l_scale=5.0, n_loc=45.0, n_scale=2.0)

df_toxic = generate_scenario_data(
    '2026-07-01', 'Over-fertilized', 
    m_loc=60.0, m_scale=2.0, t_loc=22.0, t_scale=1.0, 
    h_loc=65.0, h_scale=3.0, l_loc=80.0, l_scale=5.0, n_loc=90.0, n_scale=5.0)

    # Save to CSV
    
master_df = pd.concat([df_optimal, df_drought, df_flood, df_toxic])
master_df.to_csv('farm_thingy_data.csv', index=False)

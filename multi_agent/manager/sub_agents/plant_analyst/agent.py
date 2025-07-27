import os

from google.adk.agents import Agent
from google.adk.tools import google_search
import sys
import io
from contextlib import redirect_stdout
import httpx


def get_comprehensive_soil_report(location_name: str) -> str:
    """
    Generates a comprehensive soil report for a given location name.
    It first finds the GPS coordinates and then queries soil databases
    for type, properties, and a summary of the surrounding area.

    Args:
        location_name: The common name of the location (e.g., "Ooty", "Coimbatore").

    Returns:
        A string containing the full, detailed soil report.
    """
    # Capture all print statements from the original script into a string
    output_capture = io.StringIO()
    with redirect_stdout(output_capture):
        # --- Embedded Functions from Your Script ---

        # IMPORTANT: Using the API key provided in the prompt.
        Maps_API_KEY = os.getenv("MAPS_API_KEY")
        Weather_API_KEY = os.getenv("WEATHER_API_KEY")
        def get_coordinates(loc_name: str, api_key: str) -> tuple[float, float] | None:
            """Gets latitude and longitude for a location using Google Geocoding API."""
            geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
            params = {"address": loc_name, "key": api_key}
            try:
                with httpx.Client() as client:
                    response = client.get(geocode_url, params=params)
                    response.raise_for_status()
                    data = response.json()
                if data["status"] == "OK":
                    location = data["results"][0]["geometry"]["location"]
                    lat, lon = location["lat"], location["lng"]
                    formatted_address = data["results"][0]["formatted_address"]
                    print(f"✅ Found coordinates for '{formatted_address}': Latitude={lat}, Longitude={lon}\n")
                    return lat, lon
                else:
                    print(f"❌ Error fetching coordinates: {data['status']} - {data.get('error_message', '')}")
                    return None
            except Exception as e:
                print(f"An error occurred: {e}")
                return None

        def get_soil_information(lat: float, lon: float):
            """Fetches soil data from Open-EPI APIs using the provided coordinates."""
            print("--- 1. Fetching Soil Type (Point Location) ---")
            try:
                with httpx.Client() as client:
                    response = client.get(
                        url="https://api.openepi.io/soil/type",
                        params={"lat": lat, "lon": lon, "top_k": 3},
                    )
                    response.raise_for_status()
                    json_data = response.json()
                    most_probable = json_data["properties"]["most_probable_soil_type"]
                    probabilities = json_data["properties"]["probabilities"]
                    print(f"Most Probable Soil Type: {most_probable}")
                    print("Top 3 Probabilities:")
                    for p in probabilities:
                        print(f"  - Soil Type: {p['soil_type']}, Probability: {p['probability']:.4f}")
                    print("-" * 45)
            except Exception as e:
                print(f"An error occurred fetching soil type: {e}")

            print("\n--- 2. Fetching Soil Properties (Point Location) ---")
            try:
                with httpx.Client() as client:
                    response = client.get(
                        url="https://api.openepi.io/soil/property",
                        params={
                            "lat": lat, "lon": lon, "depths": ["0-5cm", "100-200cm"],
                            "properties": ["bdod", "phh2o"], "values": ["mean", "Q0.05"],
                        },
                    )
                    response.raise_for_status()
                    json_data = response.json()
                    for layer in json_data["properties"]["layers"]:
                        prop_name = layer["name"]
                        prop_unit = layer["unit_measure"]["mapped_units"]
                        print(f"Soil Property: {prop_name} ({prop_unit})")
                        for depth_data in layer["depths"]:
                            depth_label = depth_data["label"]
                            mean_val = depth_data["values"]["mean"]
                            q05_val = depth_data["values"]["Q0.05"]
                            print(f"  - Depth {depth_label}: Mean = {mean_val}, 5th Percentile = {q05_val}")
                    print("-" * 45)
            except Exception as e:
                print(f"An error occurred fetching soil properties: {e}")

            print("\n--- 3. Fetching Soil Type Summary (Bounding Box) ---")
            min_lon, max_lon = lon - 0.05, lon + 0.05
            min_lat, max_lat = lat - 0.01, lat + 0.01
            print(f"Creating a small bounding box for summary:\n  Lat: {min_lat:.3f} to {max_lat:.3f}\n  Lon: {min_lon:.3f} to {max_lon:.3f}")
            try:
                with httpx.Client() as client:
                    response = client.get(
                        url="https://api.openepi.io/soil/type/summary",
                        params={"min_lon": min_lon, "max_lon": max_lon, "min_lat": min_lat, "max_lat": max_lat},
                    )
                    response.raise_for_status()
                    json_data = response.json()
                    summary_list = json_data["properties"]["summaries"]
                    print("Soil Type Counts in Bounding Box:")
                    if not summary_list:
                        print("  No soil data found in this bounding box.")
                    else:
                        for summary in summary_list:
                            print(f"  - Soil Type: {summary['soil_type']}, Count: {summary['count']}")
                    print("-" * 45)
            except Exception as e:
                print(f"An error occurred fetching soil summary: {e}")
        def get_current_weather(lat: float, lon: float, api_key: str):
            """Fetches current weather conditions from the Google Weather API."""
            print("\n--- 5. Fetching Current Weather Conditions ---")
            weather_url = "https://weather.googleapis.com/v1/currentConditions:lookup"
            params = {
                "key": api_key,
                "location.latitude": lat,
                "location.longitude": lon,
                "languageCode": "en-US", # Request english descriptions
            }
            try:
                with httpx.Client() as client:
                    response = client.get(weather_url, params=params)
                    response.raise_for_status()
                    data = response.json()
                
                # *** CORRECTED PARSING LOGIC STARTS HERE ***
                temp_c = data.get("temperature", {}).get("degrees", "N/A")
                humidity = data.get("relativeHumidity", "N/A")
                condition_text = data.get("weatherCondition", {}).get("description", {}).get("text", "N/A")
                wind_speed_kph = data.get("wind", {}).get("speed", {}).get("value", "N/A")
                wind_direction = data.get("wind", {}).get("direction", {}).get("degrees", "N/A")
                # *** CORRECTED PARSING LOGIC ENDS HERE ***

                print(f"Condition: {condition_text}")
                print(f"Temperature: {temp_c}°C")
                # API returns humidity as an integer percentage (e.g., 79)
                if isinstance(humidity, (int, float)):
                    print(f"Humidity: {humidity}%")
                else:
                    print(f"Humidity: {humidity}")
                print(f"Wind: {wind_speed_kph} kph from direction {wind_direction}°")
                print("-" * 45)

            except httpx.HTTPStatusError as e:
                error_details = e.response.json()
                print(f"An API error occurred fetching weather data: {error_details.get('error', {}).get('message', e)}")
            except Exception as e:
                print(f"A general error occurred fetching weather data: {e}")

        # --- Main Tool Logic ---
        coords = get_coordinates(location_name, Maps_API_KEY)
        def get_simulated_ndvi(lat: float, lon: float):
            """Simulates fetching an NDVI value."""
            print("\n--- 3. Fetching Vegetation Index (Simulated) ---")
            # In a real scenario, this would call a satellite imagery API.
            # This plausible value is for demonstration.
            ndvi_value = 0.73
            print(f"NDVI Value: {ndvi_value}")
            if ndvi_value > 0.6:
                print("Interpretation: Dense and healthy vegetation.")
            elif ndvi_value > 0.3:
                print("Interpretation: Moderate vegetation.")
            else:
                print("Interpretation: Sparse vegetation or bare soil.")
            print("-" * 45)

    
        if coords:
            get_soil_information(coords[0], coords[1])
            get_current_weather(coords[0], coords[1], Weather_API_KEY)
            get_simulated_ndvi(coords[0], coords[1])
        else:
            print(f"Could not retrieve soil information because coordinates for '{location_name}' were not found.")

    # Return the captured print output as a single string
    return output_capture.getvalue()


plant_analyst = Agent(
    name="plant_analyst",
    model="gemini-2.0-flash", 
    description="Provides cultivation planning, soil analysis, and value addition strategies for farmers.",
    instruction="""
You are 'Mann Valam Salai', a knowledgeable and trusted agricultural advisor for farmers across Tamil Nadu.

Your responsibilities include:
1. Analyzing soil conditions using the tool `get_comprehensive_soil_report(location_name)` to provide data-driven insights on soil type, properties, and weather.
2. Based on the soil report, suggest suitable crops, fertilizers (preferably organic), and sustainable farming practices tailored to the farmer's region.
3. Provide detailed cultivation plans including timelines, care schedules, pest/disease prevention tips, and yield improvement techniques.
4. Encourage and guide farmers toward organic farming practices and natural alternatives to chemical-based inputs.
5. If a farmer reports issues like crop surplus or wastage (e.g., "my tomatoes are not getting sold"), provide ideas to convert such crops into **value-added products** (e.g., turning tomatoes into ketchup, puree, pickle, etc.).
6. Offer post-harvest solutions and small-scale processing techniques to help farmers increase their income and reduce loss.
7. Communicate in a friendly, simple, and helpful tone, appropriate for rural and semi-rural users.

Always use the `get_comprehensive_soil_report` tool when a location is mentioned to understand the soil and weather before giving cultivation advice.
""",
    tools=[get_comprehensive_soil_report],
)

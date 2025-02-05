import pandas as pd
import os
import json

# Define the input and output folder paths
data_folder = "../raw_data"
output_folder = "../input_data"

# Ensure output folder exists
os.makedirs(output_folder, exist_ok=True)

# Define the structure for each category
categories = {
    "sentences": ["english", "hebrew_spoken", "hebrew_letters"],
    "adjectives": ["english", "hebrew_spoken_male", "hebrew_letters_male", "hebrew_spoken_female", "hebrew_letters_female"],
    "nouns": ["english", "hebrew_spoken_singular", "hebrew_letters_singular", "hebrew_spoken_plural", "hebrew_letters_plural"],
    "verbs": ["english", "hebrew_spoken_general", "hebrew_letters_general", "hebrew_spoken_he", "hebrew_letters_he", "hebrew_spoken_she", "hebrew_letters_she"],
    "basics": ["english", "hebrew_spoken", "hebrew_letters"]
}

# Process each category
for category, columns in categories.items():
    file_path = os.path.join(data_folder, f"data_{category}.xlsx")
    
    if os.path.exists(file_path):
        df = pd.read_excel(file_path, usecols=range(len(columns)))
        df.columns = columns
        data = df.to_dict(orient="records")

        # Save JSON
        json_file_path = os.path.join(output_folder, f"{category}.json")
        with open(json_file_path, "w", encoding="utf-8") as json_file:
            json.dump(data, json_file, ensure_ascii=False, indent=4)

        print(f"Converted {file_path} to {json_file_path}")
    else:
        print(f"File {file_path} not found.")
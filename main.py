import os
import sys
from populationVulnerability import get_data
from cleanVulnerabilityData import clean_data
# from watsonx import scoring_function
# from equity_scoring_function import score_location
import subprocess
import pandas as pd

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Enter a valid state abbreviation")
        sys.exit(1)

    state = sys.argv[1].upper()
    folder = "census_results"
    os.makedirs(folder, exist_ok=True)

    # generate census data
    census_df = get_data(state)
    census_path = f"{folder}/Population_Vulnerability_{state}.csv"
    census_df.to_csv(census_path, index=False)
    print(f"Saved {census_path}")

    # clean data
    cleanresults_folder = "cleaned_results"
    os.makedirs(f"census_results/{cleanresults_folder}", exist_ok=True)
    clean_df = clean_data(census_path)
    clean_path = f"{folder}/{cleanresults_folder}/Population_Vulnerability_{state}_clean.csv"
    clean_df.to_csv(clean_path, index=False)
    print(f"Saved cleaned data to {clean_path}")

'''
    # load accessscanner data
    scanner_path = f"../accessscanner/results/accessscanner_data_{state}.csv" # update based on ishitas file structure
    if not os.path.exists(scanner_path):
        print(f"AccessScanner file not found for {state}: {scanner_path}")
        sys.exit(1)
    scanner_df = pd.read_csv(scanner_path)

    # merge data and generate state-specific scoring function
    scoring_function(state)

    # run generated scoring function
    subprocess.run(["python", f"Scoring_function_{state}.py"])

'''
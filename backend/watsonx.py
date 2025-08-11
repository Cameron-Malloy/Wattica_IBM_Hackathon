import pandas as pd
import os
from dotenv import load_dotenv
from ibm_watsonx_ai.foundation_models import Model
from ibm_watsonx_ai.auth import IAMTokenManager
from ibm_watsonx_ai import Credentials
import re

load_dotenv()

api_key = os.getenv("WATSONX_API_KEY")
project_id = os.getenv("WATSONX_PROJECT_ID")
region = os.getenv("WATSONX_REGION")

creds = Credentials(api_key=api_key, region=region)
token_manager = IAMTokenManager(api_key=api_key, url=creds.get_token_endpoint())

model = Model(
    model_id="granite-13b-chat",
    credentials=creds,
    project_id=project_id
)

# need to edit merging process based on formatting of access scanner data 
def scoring_function(state):
    equity_df = pd.read_csv(f"results/Population_Vulnerability_{state}_clean.csv")
    scanner_df = pd.read_csv(f"../accessscanner/results/accessscanner_data_{state}.csv")

    merged_df = pd.merge(equity_df, scanner_df, on=["state", "place"], how="left")
    merged_df["location"] = merged_df["state"] + "-" + merged_df["place"]

    sample = merged_df[["location", "percent_over_65", "percent_disabled", "median_income", "issue_type", "severity"]].head(10)
    sample_csv = sample.to_csv(index=False)

    prompt = f"""
    You are EquityAgent, designed to score and prioritize U.S. locations for accessibility upgrades based on vulnerability and access issues.

    Each location has the following data:
    - location (e.g. "CA-San Francisco")
    - percent_over_65
    - percent_disabled
    - median_income
    - issue_type (e.g. "curb ramp", "sidewalk", etc.)
    - severity (1 to 5)

    Higher vulnerability areas (older, more disabled, lower income) and more severe issues should result in higher priority scores (closer to 100).

    Here is a CSV sample of the data: {sample_csv}

    Please write a Python function called `score_location(df)` that:
    - Takes a pandas DataFrame with the above columns.
    - Calculates a `priority_score` from 1 to 100 for each row.
    - Identifies the `top_issue` per location (based on severity).
    - Aggregates the highest severity issue per location.
    - Returns a new DataFrame with columns: `location`, `priority_score`, `top_issue`.
    - Sorts the rows by `priority_score` (highest first).
    - Saves the DataFrame as a CSV file to this path: `../final_results/priority_issues_{state}.csv`.
    - If the folder `final_results` doesn't exist, it should create it.

    Only return the full Python script. No explanation or comments.
    """

    response = model.generate(prompt=prompt)
    output_text = response.generated_text

    output_path = f"Scoring_function_{state}.py"
    with open(output_path, "w") as f:
        f.write(output_text)

    print(f"Saved results to: {output_path}")
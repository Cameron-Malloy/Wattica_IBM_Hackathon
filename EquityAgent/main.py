import os
import sys
from populationVulnerability import get_data

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Enter a valid state abbreviation")
    else:
        state = sys.argv[1].upper()
        df = get_data(state)

        folder = "results"
        os.makedirs(folder, exist_ok=True)

        filename = f"{folder}/Population_Vulnerability_{state}.csv"
        df.to_csv(filename, index=False)

        print(f"Saved {filename}")

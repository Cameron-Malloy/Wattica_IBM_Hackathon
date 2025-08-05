import os
import sys
from populationVulnerability import get_place_data

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Enter a valid state abbreviation")
    else:
        state = sys.argv[1].upper()
        df = get_place_data(state)

        folder = "results"
        os.makedirs(folder, exist_ok=True)

        filename = f"{folder}/{state.lower()}_place_population_{state}.csv"
        df.to_csv(filename, index=False)

        print(f"Saved {filename}")

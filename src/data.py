from pathlib import Path

import pandas as pd


RAW_PATH = Path("data/raw/train.csv")
OUTPUT_PATH = Path("artifacts/weekly.parquet")


def load_raw_data() -> pd.DataFrame:
    """Load and validate the raw Kaggle demand dataset."""

    df = pd.read_csv(RAW_PATH)

    expected_columns = {"date", "store", "item", "sales"}

    if set(df.columns) != expected_columns:
        raise ValueError(
            f"Unexpected columns: {df.columns.tolist()}"
        )

    df["date"] = pd.to_datetime(df["date"])

    return df


def prepare_weekly_demand(df: pd.DataFrame) -> pd.DataFrame:
    """
    Keep items 1–20, aggregate across stores,
    then convert daily demand into weekly demand.
    """

    # Keep the 20 products used in our production-planning system.
    df = df[df["item"].between(1, 20)].copy()

    # Aggregate all stores into total product-level demand.
    daily = (
        df.groupby(["date", "item"], as_index=False)["sales"]
        .sum()
        .rename(columns={"sales": "demand"})
    )

    # Aggregate daily demand into Sunday-ending weeks.
    weekly = (
        daily.set_index("date")
        .groupby("item")["demand"]
        .resample("W-SUN")
        .sum()
        .reset_index()
    )

    # Remove the first partial week.
    first_week = weekly["date"].min()
    weekly = weekly[weekly["date"] > first_week].copy()

    weekly = weekly.sort_values(["item", "date"]).reset_index(drop=True)

    return weekly


def main() -> None:
    df = load_raw_data()

    print("Raw shape:", df.shape)
    print("Date range:", df["date"].min(), "to", df["date"].max())
    print("Stores:", df["store"].nunique())
    print("Items:", df["item"].nunique())

    weekly = prepare_weekly_demand(df)

    print("\nWeekly shape:", weekly.shape)
    print("Weekly date range:", weekly["date"].min(), "to", weekly["date"].max())
    print("Products:", weekly["item"].nunique())

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    weekly.to_parquet(OUTPUT_PATH, index=False)

    print(f"\nSaved: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
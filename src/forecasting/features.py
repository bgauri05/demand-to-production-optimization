import pandas as pd


def create_features(df):
    df = df.copy()

    df = df.sort_values(["item", "date"])

    # Lag features
    for lag in [1, 2, 4, 8, 13, 26, 52]:
        df[f"lag_{lag}"] = (
            df.groupby("item")["demand"]
            .shift(lag)
        )

    # Rolling features
    for window in [4, 8, 13]:

        df[f"rolling_mean_{window}"] = (
            df.groupby("item")["demand"]
            .transform(
                lambda x: x.shift(1).rolling(window).mean()
            )
        )

        df[f"rolling_std_{window}"] = (
            df.groupby("item")["demand"]
            .transform(
                lambda x: x.shift(1).rolling(window).std()
            )
        )

    # Calendar features
    df["week_of_year"] = (
        df["date"].dt.isocalendar().week.astype(int)
    )

    df["month"] = df["date"].dt.month
    df["quarter"] = df["date"].dt.quarter
    df["year"] = df["date"].dt.year

    return df
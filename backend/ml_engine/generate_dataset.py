
import numpy as np
import pandas as pd
from pathlib import Path

np.random.seed(42)

TOTAL_RECORDS = 2000
records = []

for i in range(TOTAL_RECORDS):

    topic_accuracy = np.random.uniform(10, 100)
    total_attempts = np.random.randint(1, 31)

    average_difficulty = np.random.uniform(1, 3)

    recent_accuracy = np.clip(
        topic_accuracy + np.random.normal(0, 15),
        0,
        100
    )

    mastery_score = (
        0.45 * (topic_accuracy / 100)
        + 0.20 * min(total_attempts / 30, 1)
        + 0.15 * (1 - (average_difficulty - 1) / 2)
        + 0.20 * (recent_accuracy / 100)
        + np.random.normal(0, 0.06)
    )

    if mastery_score < 0.45:
        mastery_level = "Low"
    elif mastery_score < 0.70:
        mastery_level = "Medium"
    else:
        mastery_level = "High"

    records.append({
        "topic_accuracy_pct": round(topic_accuracy, 2),
        "total_attempts": total_attempts,
        "average_difficulty_score": round(average_difficulty, 2),
        "recent_accuracy_pct": round(recent_accuracy, 2),
        "mastery_level": mastery_level
    })


df = pd.DataFrame(records)

output_dir = Path(__file__).parent / "datasets"
output_dir.mkdir(parents=True, exist_ok=True)

output_path = output_dir / "student_topic_performance.csv"

df.to_csv(output_path, index=False)

print("New dataset generated!")
print("Total records:", len(df))
print("\nMastery distribution:")
print(df["mastery_level"].value_counts())
print("\nMissing values:")
print(df.isnull().sum())
print("\nSaved at:", output_path)

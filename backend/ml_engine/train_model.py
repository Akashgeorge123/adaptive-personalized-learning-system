
import pandas as pd
import joblib

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

print("Starting ML model training...")

BASE_DIR = Path(__file__).parent

dataset_path = BASE_DIR / "datasets" / "student_topic_performance.csv"

df = pd.read_csv(dataset_path)

print("Dataset loaded:", len(df), "records")

# Input features
X = df[
    [
        "topic_accuracy_pct",
        "total_attempts",
        "average_difficulty_score",
        "recent_accuracy_pct"
    ]
]

# Target variable
y = df["mastery_level"]

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training records:", len(X_train))
print("Testing records:", len(X_test))

# Create model
model = RandomForestClassifier(
    n_estimators=150,
    max_depth=10,
    random_state=42,
    class_weight="balanced"
)

# Train
model.fit(X_train, y_train)

print("\nModel training completed!")

# Evaluate
y_pred = model.predict(X_test)

print("\nAccuracy:")
print(accuracy_score(y_test, y_pred))

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Feature importance
print("\nFeature Importance:")

importance = pd.DataFrame({
    "Feature": X.columns,
    "Importance": model.feature_importances_
})

importance = importance.sort_values(
    by="Importance",
    ascending=False
)

print(importance.to_string(index=False))

# Save model
model_path = BASE_DIR / "student_mastery_model.joblib"

joblib.dump(
    {
        "model": model,
        "features": X.columns.tolist()
    },
    model_path
)

print("\nModel saved successfully!")
print("Location:", model_path)

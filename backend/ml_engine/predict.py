
import joblib
import pandas as pd

from pathlib import Path

BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "student_mastery_model.joblib"

saved_data = joblib.load(MODEL_PATH)

model = saved_data["model"]
features = saved_data["features"]


def predict_mastery(
    topic_accuracy_pct,
    total_attempts,
    average_difficulty_score,
    recent_accuracy_pct
):

    input_data = pd.DataFrame([{
        "topic_accuracy_pct": topic_accuracy_pct,
        "total_attempts": total_attempts,
        "average_difficulty_score": average_difficulty_score,
        "recent_accuracy_pct": recent_accuracy_pct
    }])

    input_data = input_data.reindex(
        columns=features
    )

    prediction = model.predict(input_data)[0]

    probabilities = model.predict_proba(input_data)[0]

    confidence = max(probabilities) * 100

    return {
        "mastery_level": prediction,
        "confidence": round(float(confidence), 2)
    }


from predict import predict_mastery

result = predict_mastery(
    topic_accuracy_pct=35,
    total_attempts=5,
    average_difficulty_score=2.5,
    recent_accuracy_pct=30
)

print("Prediction:", result)


from collections import defaultdict

from assessments.models import StudentAnswer
from ml_engine.predict import predict_mastery


DIFFICULTY_SCORES = {
    "easy": 1,
    "medium": 2,
    "hard": 3
}


def get_topic_mastery_predictions(student):

    answers = StudentAnswer.objects.filter(
        result__student=student
    ).select_related(
        "question__topic",
        "question__assessment__course",
        "result"
    ).order_by(
        "result__attempted_at",
        "student_answer_id"
    )

    topic_answers = defaultdict(list)

    for answer in answers:
        topic_answers[answer.question.topic_id].append(answer)

    predictions = []

    for topic_id, topic_records in topic_answers.items():

        total_attempts = len(topic_records)

        correct_answers = sum(
            1 for answer in topic_records if answer.is_correct
        )

        topic_accuracy = (
            correct_answers / total_attempts
        ) * 100

        difficulty_values = [
            DIFFICULTY_SCORES.get(
                answer.question.difficulty.lower(),
                2
            )
            for answer in topic_records
        ]

        average_difficulty = (
            sum(difficulty_values) / len(difficulty_values)
        )

        # Use the five most recent answers
        recent_answers = topic_records[-5:]

        recent_correct = sum(
            1 for answer in recent_answers if answer.is_correct
        )

        recent_accuracy = (
            recent_correct / len(recent_answers)
        ) * 100

        result = predict_mastery(
            topic_accuracy_pct=topic_accuracy,
            total_attempts=total_attempts,
            average_difficulty_score=average_difficulty,
            recent_accuracy_pct=recent_accuracy
        )

        predictions.append({
            "topic_id": topic_id,
            "topic_name": str(topic_records[-1].question.topic),
            "course_id": topic_records[-1].question.assessment.course_id,
            "total_attempts": total_attempts,
            "topic_accuracy_pct": round(topic_accuracy, 2),
            "recent_accuracy_pct": round(recent_accuracy, 2),
            "average_difficulty_score": round(average_difficulty, 2),
            "mastery_level": result["mastery_level"],
            "confidence": result["confidence"]
        })

    return predictions


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import api from "../services/api";

function AssessmentAttempt() {
  const { courseId, assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAssessment() {
      try {
        const [
          assessmentRes,
          questionRes,
          optionRes
        ] = await Promise.all([
          api.get("assessments/"),
          api.get("questions/"),
          api.get("answer-options/")
        ]);

        const selected = assessmentRes.data.find(
          (item) =>
            Number(item.assessment_id) === Number(assessmentId) &&
            Number(item.course) === Number(courseId)
        );

        if (!selected) {
          setError("Assessment not found for this course.");
          return;
        }

        setAssessment(selected);

        const assessmentQuestions = questionRes.data.filter(
          (question) =>
            Number(question.assessment) === Number(assessmentId)
        );

        setQuestions(assessmentQuestions);
        setOptions(optionRes.data);

      } catch (err) {
        console.error("Unable to load assessment:", err);
        setError("Unable to load assessment. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [courseId, assessmentId]);

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers((previous) => ({
      ...previous,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length !== questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post("assessments/submit/", {
        assessment: assessment.assessment_id,
        answers: Object.values(selectedAnswers)
      });

      setResult(response.data);

    } catch (err) {
      console.error("Assessment submission failed:", err);

      setError(
        err.response?.data?.error ||
        "Unable to submit assessment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading assessment...
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <p className="text-red-400">{error}</p>

        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mt-5 text-indigo-400"
        >
          Back to Course
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8"
        >
          <ArrowLeft size={18} />
          Back to Course
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">

          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-lg">
              <ClipboardCheck size={24} />
            </div>

            <span className="text-indigo-400 text-sm font-semibold uppercase">
              {assessment.type}
            </span>
          </div>

          <h1 className="text-3xl font-bold">
            {assessment.title}
          </h1>

          <div className="flex flex-wrap gap-5 text-sm text-slate-400 mt-4">
            <span>Total Marks: {assessment.total_marks}</span>
            <span>Questions: {questions.length}</span>
            <span>
              Answered: {answeredCount}/{questions.length}
            </span>
          </div>

        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 text-red-400 flex gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {questions.length === 0 ? (
          <p className="text-slate-400 bg-slate-900 p-6 rounded-xl">
            No questions are available for this assessment.
          </p>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

            {questions.map((question, index) => {
              const questionOptions = options.filter(
                (option) =>
                  Number(option.question) === Number(question.question_id)
              );

              return (
                <div
                  key={question.question_id}
                  className="border-b border-slate-800 py-6 last:border-0"
                >

                  <div className="flex justify-between gap-4 mb-4">
                    <h3 className="font-semibold">
                      {index + 1}. {question.question_text}
                    </h3>

                    <span className="text-sm text-slate-400 whitespace-nowrap">
                      {question.marks} marks
                    </span>
                  </div>

                  <div className="space-y-3">
                    {questionOptions.map((option) => (
                      <label
                        key={option.option_id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          Number(selectedAnswers[question.question_id]) ===
                          Number(option.option_id)
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.question_id}`}
                          value={option.option_id}
                          checked={
                            Number(selectedAnswers[question.question_id]) ===
                            Number(option.option_id)
                          }
                          onChange={() =>
                            handleAnswerSelect(
                              question.question_id,
                              option.option_id
                            )
                          }
                          disabled={!!result || submitting}
                          className="accent-indigo-500"
                        />

                        <span>{option.option_text}</span>
                      </label>
                    ))}
                  </div>

                </div>
              );
            })}

            {!result ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || answeredCount !== questions.length}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 py-3 rounded-lg font-semibold"
              >
                {submitting ? "Submitting..." : "Submit Assessment"}
              </button>
            ) : (
              <div className="mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">

                <div className="flex items-center gap-3 text-emerald-400 mb-4">
                  <CheckCircle size={24} />
                  <h2 className="text-xl font-bold">
                    Assessment Submitted!
                  </h2>
                </div>

                <p className="text-slate-300">
                  Your score:{" "}
                  <span className="font-bold text-white">
                    {result.score} / {assessment.total_marks}
                  </span>
                </p>

                <p className="text-slate-400 text-sm mt-2">
                  Result ID: {result.result_id}
                </p>

                <button
                  onClick={() => navigate("/assessments")}
                  className="mt-5 bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg"
                >
                  View Assessment History
                </button>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default AssessmentAttempt;

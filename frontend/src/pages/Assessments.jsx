
import { useEffect, useState } from "react";
import { ClipboardCheck, CheckCircle, AlertCircle } from "lucide-react";
import api from "../services/api";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";

function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          assessmentRes, 
          questionRes, 
          optionRes,
          resultRes,
          courseRes
        ] = await Promise.all([
            api.get("assessments/"),
            api.get("questions/"),
            api.get("answer-options/"),
            api.get("results/"),
            api.get("courses/")
          ]);

        setAssessments(assessmentRes.data);
        setQuestions(questionRes.data);
        setOptions(optionRes.data);
        setResults(resultRes.data);
        setCourses(courseRes.data);
      } catch (err) {
        setError("Unable to load assessments. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentQuestions = selectedAssessment
    ? questions.filter(
        (question) =>
          Number(question.assessment) ===
          Number(selectedAssessment.assessment_id)
      )
    : [];

  const handleSelectAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setSelectedAnswers({});
    setResult(null);
    setReview(null);
    setError("");
};

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers((previous) => ({
      ...previous,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length !== currentQuestions.length) {
      setError("Please answer every question before submitting.");
      return;
    }

    const answers = Object.values(selectedAnswers);

    

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post("assessments/submit/", {
        assessment: selectedAssessment.assessment_id,
        answers: answers
      });

      setResult(response.data);

      const updatedResults = await api.get("results/");
      setResults(updatedResults.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to submit assessment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

const handleReview = async (resultId) => {
    try {
        setReviewLoading(true);
        setReview(null);
        setError("");

        const response = await api.get(
            `results/${resultId}/review/`
        );

        setReview(response.data);

    } catch (error) {
        console.error("Error fetching assessment review:", error);

        setError(
            error.response?.data?.error ||
            "Unable to load assessment review."
        );

    } finally {
        setReviewLoading(false);
    }
};

  const getPercentage = (result) => {
    const assessment = assessments.find(
        (item) =>
            Number(item.assessment_id) ===
            Number(result.assessment)
    );

    if (!assessment || Number(assessment.total_marks) === 0) {
        return 0;
    }

    return (
        (Number(result.score) /
            Number(assessment.total_marks)) * 100
    );
};

const averageScore = results.length
    ? results.reduce(
        (total, item) => total + getPercentage(item),
        0
    ) / results.length
    : 0;

const highestScore = results.length
    ? Math.max(...results.map(getPercentage))
    : 0;
const coursePerformance = courses.map((course) => {

    const courseAssessments = assessments.filter(
        (assessment) =>
            Number(assessment.course) === Number(course.course_id)
    );

    const courseResults = results.filter((result) =>
        courseAssessments.some(
            (assessment) =>
                Number(assessment.assessment_id) ===
                Number(result.assessment)
        )
    );

    const percentages = courseResults.map(getPercentage);

    const average = percentages.length
        ? percentages.reduce((total, value) => total + value, 0) /
          percentages.length
        : 0;

    const highest = percentages.length
        ? Math.max(...percentages)
        : 0;

    return {
        ...course,
        attempts: courseResults.length,
        average,
        highest
    };
});

console.log("Course Performance:", coursePerformance);


  if (loading) {
    return (
      <div className="p-8 text-slate-300">
        Loading assessments...
      </div>
    );
  }

  return (
    <div className="p-8 text-white max-w-6xl mx-auto">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Assessments</h1>
        <p className="text-slate-400 mt-2">
          Test your knowledge and track your performance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p className="text-slate-400 text-sm">
            Total Attempts
        </p>
        <h2 className="text-3xl font-bold mt-2">
            {results.length}
        </h2>
    </div>

    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p className="text-slate-400 text-sm">
            Average Score
        </p>
        <h2 className="text-3xl font-bold mt-2 text-indigo-400">
            {averageScore.toFixed(1)}%
        </h2>
    </div>

    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p className="text-slate-400 text-sm">
            Highest Score
        </p>
        <h2 className="text-3xl font-bold mt-2 text-emerald-400 ">
            {highestScore.toFixed(1)}%
        </h2>
    </div>

</div>

<div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">

    <h2 className="text-xl font-semibold mb-6">
        Course-wise Performance
    </h2>

    <div className="space-y-6">

        {coursePerformance.map((course) => (

            <div key={course.course_id}>

                <div className="flex justify-between items-center gap-4 mb-2">

                    <div>
                        <h3 className="font-medium">
                            {course.title}
                            {course.title === "Python Programming" &&
                                ` (#${course.course_id})`}
                        </h3>

                        <p className="text-sm text-slate-400">
                            {course.attempts} attempts
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="font-semibold">
                            {course.average.toFixed(1)}%
                        </p>

                        <p className="text-xs text-slate-400">
                            Highest: {course.highest.toFixed(1)}%
                        </p>
                    </div>

                </div>

                <div className="w-full bg-slate-800 rounded-full h-2.5">

                    <div
                        className={`h-2.5 rounded-full ${
                            course.average >= 70
                                ? "bg-emerald-500"
                                : course.average >= 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}
                        style={{
                            width: `${Math.min(100, Math.max(0, course.average))}%`
                        }}
                    />

                </div>

                {course.attempts === 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                        No assessment attempts yet.
                    </p>
                )}

            </div>

        ))}

    </div>

</div>

<div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">

    <h2 className="text-xl font-semibold mb-6">
        Performance Analytics
    </h2>

    <h3 className="text-sm text-slate-400 mb-4">
        Assessment Attempts by Course
    </h3>

    <div className="w-full h-80">

        <ResponsiveContainer width="100%" height="100%">

            <PieChart>

                <Pie
                    data={coursePerformance.filter(course => course.attempts > 0)}
                    dataKey="attempts"
                    nameKey="title"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                >

                    {coursePerformance
                        .filter(course => course.attempts > 0)
                        .map((course, index) => (
                            <Cell
                                key={course.course_id}
                                fill={["#38bdf8", "#a78bfa", "#34d399", "#fbbf24"][index % 4]}
                            />
                        ))}

                </Pie>

                <Tooltip />

                <Legend />

            </PieChart>

        </ResponsiveContainer>

    </div>

</div>


<div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">

    <h2 className="text-xl font-semibold mb-5">
        Assessment History
    </h2>

    {results.length === 0 ? (
        <p className="text-slate-400">
            No assessment attempts yet.
        </p>
    ) : (
        <div className="space-y-4">

            {[...results]
                .sort(
                    (a, b) =>
                        new Date(b.attempted_at) -
                        new Date(a.attempted_at)
                )
                .map((item) => {
                    const assessment = assessments.find(
                        (a) =>
                            Number(a.assessment_id) ===
                            Number(item.assessment)
                    );

                    const percentage = getPercentage(item);

                    return (
                        <div
                            key={item.result_id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 last:border-0"
                        >
                            <div>
                                <h3 className="font-medium">
                                    {assessment?.title || "Assessment"}
                                </h3>

                                <p className="text-sm text-slate-400 mt-1">
                                    {item.attempted_at
                                        ? new Date(item.attempted_at).toLocaleString()
                                        : "Date unavailable"}
                                </p>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-5">

                                <div className="sm:text-right">
                                    <p className="font-semibold">
                                        {item.score} / {assessment?.total_marks || "?"}
                                    </p>

                                    <p className={`text-sm ${
                                        percentage >= 70
                                            ? "text-emerald-400"
                                            : percentage >= 40
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                    }`}>
                                        {percentage.toFixed(1)}%
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleReview(item.result_id)}
                                    disabled={reviewLoading}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium"
                                >
                                    {reviewLoading ? "Loading..." : "Review Attempt"}
                                </button>

                            </div>
                        </div>
                    );
                })}

        </div>
    )}

</div>

{reviewLoading && (
    <div className="text-center text-slate-400 py-6">
        Loading assessment review...
    </div>
)}

{review && (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">

        <div className="flex justify-between items-start gap-4 mb-6">

            <div>
                <h2 className="text-xl font-semibold">
                    {review.assessment}
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                    Assessment Review
                </p>
            </div>

            <button
                onClick={() => setReview(null)}
                className="text-slate-400 hover:text-white"
            >
                Close
            </button>

        </div>

        <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <p className="text-slate-400 text-sm">
                Your Score
            </p>

            <p className="text-2xl font-bold mt-1">
                {review.score} / {review.total_marks}
            </p>
        </div>

        <div className="space-y-5">

            {review.answers.map((answer, index) => (

                <div
                    key={answer.question_id}
                    className={`border rounded-xl p-4 ${
                        answer.is_correct
                            ? "border-emerald-500/40 bg-emerald-500/5"
                            : "border-red-500/40 bg-red-500/5"
                    }`}
                >

                    <div className="flex justify-between gap-3 mb-3">

                        <h3 className="font-medium">
                            {index + 1}. {answer.question_text}
                        </h3>

                        <span className={`text-sm font-semibold shrink-0 ${
                            answer.is_correct
                                ? "text-emerald-400"
                                : "text-red-400"
                        }`}>
                            {answer.is_correct ? "Correct" : "Incorrect"}
                        </span>

                    </div>

                    <p className="text-sm text-slate-400">
                        Your answer:
                    </p>

                    <p className="text-sm mb-3">
                        {answer.selected_option}
                    </p>

                    {!answer.is_correct && (
                        <>
                            <p className="text-sm text-slate-400">
                                Correct answer:
                            </p>

                            <p className="text-sm text-emerald-400">
                                {answer.correct_option || "Not available"}
                            </p>
                        </>
                    )}

                    <p className="text-xs text-slate-500 mt-3">
                        Marks: {answer.marks}
                    </p>

                </div>

            ))}

        </div>

    </div>
)}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 text-red-400 flex gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {!selectedAssessment ? (
        <div>
          <h2 className="text-xl font-semibold mb-5">
            Available Assessments
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {assessments.map((assessment) => (
              <div
                key={assessment.assessment_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-500/10 p-3 rounded-lg">
                    <ClipboardCheck className="text-indigo-400" />
                  </div>

                  <span className="text-sm text-indigo-400 uppercase">
                    {assessment.type}
                  </span>
                </div>

                <h3 className="text-lg font-semibold">
                  {assessment.title}
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  Total marks: {assessment.total_marks}
                </p>

                <button
                  onClick={() => handleSelectAssessment(assessment)}
                  className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-lg font-medium"
                >
                  Start Assessment
                </button>
              </div>
            ))}
          </div>

          {assessments.length === 0 && (
            <p className="text-slate-400">
              No assessments are currently available.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

          <button
            onClick={() => handleSelectAssessment(null)}
            className="text-indigo-400 hover:text-indigo-300 mb-6"
          >
            ← Back to assessments
          </button>

          <h2 className="text-2xl font-bold">
            {selectedAssessment.title}
          </h2>

          <p className="text-slate-400 mt-2 mb-8">
            Total marks: {selectedAssessment.total_marks}
            {" "} | {" "}
            Questions: {currentQuestions.length}
          </p>

          {currentQuestions.map((question, index) => {
            const questionOptions = options.filter(
              (option) =>
                Number(option.question) ===
                Number(question.question_id)
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
                        selectedAnswers[question.question_id] === option.option_id
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.question_id}`}
                        value={option.option_id}
                        checked={
                          selectedAnswers[question.question_id] ===
                          option.option_id
                        }
                        onChange={() =>
                          handleAnswerSelect(
                            question.question_id,
                            option.option_id
                          )
                        }
                        disabled={!!result}
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
              disabled={submitting || currentQuestions.length === 0}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 py-3 rounded-lg font-semibold"
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          ) : (
            <div className="mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 text-emerald-400 mb-3">
                <CheckCircle size={24} />
                <h3 className="text-xl font-bold">
                  Assessment Submitted!
                </h3>
              </div>

              <p className="text-slate-300">
                Your score:{" "}
                <span className="font-bold text-white">
                  {result.score} / {selectedAssessment.total_marks}
                </span>
              </p>

              <p className="text-slate-400 text-sm mt-2">
                Result ID: {result.result_id}
              </p>

              <button
                onClick={() => handleSelectAssessment(null)}
                className="mt-5 bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg"
              >
                Back to Assessments
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Assessments;

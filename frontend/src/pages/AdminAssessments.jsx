
import { useEffect, useRef, useState } from "react";
import {
    Plus, Search, Pencil, Trash2, ClipboardList, X,
    BookOpen, FileQuestion, CheckCircle2
} from "lucide-react";
import adminApi from "../services/adminApi";

function AdminAssessments() {
    const [assessments, setAssessments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [assessmentToDelete, setAssessmentToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [topics, setTopics] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [questionLoading, setQuestionLoading] = useState(false);
    const [questionError, setQuestionError] = useState("");
    const [questionSuccess, setQuestionSuccess] = useState("");
    const [savingQuestion, setSavingQuestion] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState(null);

    const [questionData, setQuestionData] = useState({
        topic: "",
        question_text: "",
        marks: "1",
        difficulty: "easy"
    });

    const [options, setOptions] = useState([
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false }
    ]);

    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        type: "practice",
        total_marks: "",
        course: ""
    });

    async function fetchData() {
        try {
            const [assessmentResponse, courseResponse] =
                await Promise.all([
                    adminApi.get("admin/assessments/"),
                    adminApi.get("admin/courses/")
                ]);

            setAssessments(assessmentResponse.data);
            setCourses(courseResponse.data);
        } catch (err) {
            setError("Failed to load assessments or courses.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    function openAddForm() {
        setEditingId(null);

        setFormData({
            title: "",
            type: "practice",
            total_marks: "",
            course: courses[0]?.course_id || ""
        });

        setShowForm(true);
        setError("");
        setSuccess("");
    }

    function openEditForm(assessment) {
        setEditingId(assessment.assessment_id);

        setFormData({
            title: assessment.title,
            type: assessment.type,
            total_marks: assessment.total_marks,
            course: assessment.course
        });

        setShowForm(true);
        setError("");
        setSuccess("");

        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 150);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        const data = {
            ...formData,
            total_marks: Number(formData.total_marks),
            course: Number(formData.course)
        };

        try {
            if (editingId) {
                await adminApi.patch(
                    `admin/assessments/${editingId}/`,
                    data
                );

                setSuccess("Assessment updated successfully.");
            } else {
                await adminApi.post(
                    "assessments/create/",
                    data
                );

                setSuccess("Assessment created successfully.");
            }

            setShowForm(false);
            setEditingId(null);

            await fetchData();
        } catch (err) {
            setError(
                err.response?.data
                    ? JSON.stringify(err.response.data)
                    : "Something went wrong."
            );
        }
    }

    async function handleDelete() {
        if (!assessmentToDelete) return;

        setDeleting(true);
        setError("");
        setSuccess("");

        try {
            await adminApi.delete(
                `admin/assessments/${assessmentToDelete.assessment_id}/`
            );

            setSuccess("Assessment deleted successfully.");
            setAssessmentToDelete(null);

            await fetchData();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Failed to delete assessment."
            );
        } finally {
            setDeleting(false);
        }
    }

    async function openQuestionManager(assessment) {
    setSelectedAssessment(assessment);
    setQuestionError("");
    setQuestionSuccess("");
    setShowForm(false);
    setShowQuestionForm(false);
    setQuestionLoading(true);

    try {
        const [questionResponse, topicResponse] = await Promise.all([
            adminApi.get(
                `admin/assessments/${assessment.assessment_id}/questions/`
            ),
            adminApi.get("admin/topics/")
        ]);

        setQuestions(questionResponse.data);
        setTopics(topicResponse.data);
    } catch (err) {
        setQuestionError("Failed to load questions or topics.");
    } finally {
        setQuestionLoading(false);
    }
}

function openQuestionForm() {
    setEditingQuestionId(null);
    setQuestionData({
        topic: "",
        question_text: "",
        marks: "1",
        difficulty: "easy"
    });

    setOptions([
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false }
    ]);

    setQuestionError("");
    setQuestionSuccess("");
    setShowQuestionForm(true);
}

function handleQuestionChange(e) {
    setQuestionData({
        ...questionData,
        [e.target.name]: e.target.value
    });
}

function handleOptionChange(index, value) {
    setOptions(previous =>
        previous.map((option, i) =>
            i === index
                ? { ...option, option_text: value }
                : option
        )
    );
}

function selectCorrectOption(index) {
    setOptions(previous =>
        previous.map((option, i) => ({
            ...option,
            is_correct: i === index
        }))
    );
}

async function handleEditQuestion(question) {
    setQuestionError("");
    setQuestionSuccess("");

    try {
        const response = await adminApi.get(
            `admin/questions/${question.question_id}/options/`
        );

        setQuestionData({
            topic: String(question.topic),
            question_text: question.question_text,
            marks: String(question.marks),
            difficulty: question.difficulty
        });

        setOptions(
            response.data.map(option => ({
                option_text: option.option_text,
                is_correct: option.is_correct
            }))
        );

        setEditingQuestionId(question.question_id);
        setShowQuestionForm(true);

    } catch (err) {
        setQuestionError("Failed to load question details.");
    }
}

async function handleDeleteQuestion(question) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    setQuestionError("");
    setQuestionSuccess("");

    try {
        await adminApi.delete(
            `admin/questions/${question.question_id}/delete/`
        );

        setQuestionSuccess("Question deleted successfully.");

        const response = await adminApi.get(
            `admin/assessments/${selectedAssessment.assessment_id}/questions/`
        );

        setQuestions(response.data);

    } catch (err) {
        setQuestionError(
            err.response?.data?.error ||
            "Failed to delete question."
        );
    }
}


async function handleQuestionSubmit(e) {
    e.preventDefault();

    setQuestionError("");
    setQuestionSuccess("");

    if (!questionData.topic) {
        setQuestionError("Please select a topic.");
        return;
    }

    if (!questionData.question_text.trim()) {
        setQuestionError("Please enter a question.");
        return;
    }

    const marks = Number(questionData.marks);

    if (!Number.isFinite(marks) || marks <= 0) {
        setQuestionError("Marks must be greater than zero.");
        return;
    }

    if (options.some(option => !option.option_text.trim())) {
        setQuestionError("Fill in all four answer options.");
        return;
    }

    const optionTexts = options.map(option =>
        option.option_text.trim().toLowerCase()
    );

    if (new Set(optionTexts).size !== 4) {
        setQuestionError("Answer options must be different.");
        return;
    }

    if (options.filter(option => option.is_correct).length !== 1) {
        setQuestionError("Select exactly one correct answer.");
        return;
    }

    try {
        setSavingQuestion(true);

        const payload = {
            assessment: selectedAssessment.assessment_id,
            topic: Number(questionData.topic),
            question_text: questionData.question_text.trim(),
            marks: marks,
            difficulty: questionData.difficulty,
            options: options.map(option => ({
                option_text: option.option_text.trim(),
                is_correct: option.is_correct
            }))
        };

        if (editingQuestionId) {
            await adminApi.put(
                `admin/questions/${editingQuestionId}/update/`,
                payload
            );

            setQuestionSuccess("Question updated successfully.");
        } else {
            await adminApi.post(
                "admin/questions/create/",
                payload
            );

            setQuestionSuccess("Question created successfully.");
        }

        setShowQuestionForm(false);
        setEditingQuestionId(null);

        const questionResponse = await adminApi.get(
            `admin/assessments/${selectedAssessment.assessment_id}/questions/`
        );

        setQuestions(questionResponse.data);

    } catch (err) {
        setQuestionError(
            err.response?.data?.error ||
            "Failed to save question."
        );
    } finally {
        setSavingQuestion(false);
    }
}




    const filteredAssessments = assessments.filter(assessment => {
        const course = courses.find(
            c => c.course_id === assessment.course
        );

        const query = search.toLowerCase();

        return (
            assessment.title.toLowerCase().includes(query) ||
            assessment.type.toLowerCase().includes(query) ||
            course?.title.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Assessment Management
                    </h1>

                    <p className="text-slate-400 mt-1">
                        Create and manage assessments across your courses.
                    </p>
                </div>

                <button
                    onClick={openAddForm}
                    disabled={courses.length === 0}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    <Plus size={18} />
                    Add Assessment
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg p-3">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg p-3">
                    {success}
                </div>
            )}

            {/* Search */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-3 text-slate-500"
                    />

                    <input
                        type="text"
                        placeholder="Search assessments or courses..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg pl-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Add / Edit Form */}
            {showForm && (
                <div
                    ref={formRef}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-6 scroll-mt-6"
                >
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-semibold text-white">
                            {editingId ? "Edit Assessment" : "Create Assessment"}
                        </h2>

                        <button
                            onClick={() => setShowForm(false)}
                            className="text-slate-500 hover:text-slate-200"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                                Assessment Title
                            </label>

                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                maxLength={50}
                                placeholder="Enter assessment title"
                                className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                                Assessment Type
                            </label>

                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="practice">Practice</option>
                                <option value="quiz">Quiz</option>
                                <option value="test">Test</option>
                                <option value="exam">Exam</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                                Total Marks
                            </label>

                            <input
                                type="number"
                                name="total_marks"
                                value={formData.total_marks}
                                onChange={handleChange}
                                min="0.01"
                                step="0.01"
                                required
                                placeholder="Enter total marks"
                                className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                                Course
                            </label>

                            <select
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select a course</option>

                                {courses.map(course => (
                                    <option
                                        key={course.course_id}
                                        value={course.course_id}
                                    >
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700"
                            >
                                {editingId ? "Save Changes" : "Create Assessment"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="border border-slate-700 px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Assessment List */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">

                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="font-semibold text-white">
                        All Assessments
                    </h2>

                    <span className="text-sm text-slate-400">
                        {filteredAssessments.length} assessments
                    </span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        Loading assessments...
                    </div>
                ) : filteredAssessments.length === 0 ? (
                    <div className="p-10 text-center">
                        <ClipboardList
                            className="mx-auto text-slate-500 mb-3"
                            size={36}
                        />

                        <p className="text-slate-400">
                            No assessments found.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">

                        {filteredAssessments.map(assessment => {
                            const course = courses.find(
                                c => c.course_id === assessment.course
                            );

                            return (
                                <div
                                    key={assessment.assessment_id}
                                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800"
                                >
                                    <div>
                                        <h3 className="font-semibold text-white">
                                            {assessment.title}
                                        </h3>

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full">
                                                {course?.title || "Unknown course"}
                                            </span>

                                            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                                                {assessment.type}
                                            </span>

                                            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                                                {assessment.total_marks} marks
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => openEditForm(assessment)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400"
                                        >
                                            <Pencil size={15} />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => openQuestionManager(assessment)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400"
                                        >
                                            <FileQuestion size={15} />
                                            Manage Questions
                                        </button>

                                        <button
                                            onClick={() => setAssessmentToDelete(assessment)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete assessment"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {selectedAssessment && (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

            <div>
                <h2 className="text-xl font-bold text-white">
                    Manage Questions
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                    {selectedAssessment.title}
                </p>
            </div>

            <div className="flex gap-2">

                <button
                    onClick={openQuestionForm}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                    <Plus size={17} />
                    Add Question
                </button>

                <button
                    onClick={() => {
                        setSelectedAssessment(null);
                        setShowQuestionForm(false);
                    }}
                    className="p-2 text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>

            </div>
        </div>

        {questionError && (
            <div className="mb-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg p-3">
                {questionError}
            </div>
        )}

        {questionSuccess && (
            <div className="mb-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg p-3">
                {questionSuccess}
            </div>
        )}

        {showQuestionForm && (
            <form
                onSubmit={handleQuestionSubmit}
                className="mb-6 p-5 bg-slate-950 border border-slate-700 rounded-xl space-y-4"
            >

                <h3 className="text-lg font-semibold text-white">
                    {editingQuestionId ? "Edit Question" : "Create New Question"}
                </h3>

                <div>
                    <label className="block text-sm text-slate-300 mb-1">
                        Topic
                    </label>

                    <select
                        name="topic"
                        value={questionData.topic}
                        onChange={handleQuestionChange}
                        required
                        className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2.5"
                    >
                        <option value="">Select topic</option>

                        {topics
                            .filter(topic =>
                                Number(topic.course) === Number(selectedAssessment.course)
                            )
                            .map(topic => (
                                <option
                                    key={topic.topic_id}
                                    value={topic.topic_id}
                                >
                                    {topic.title}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-slate-300 mb-1">
                        Question
                    </label>

                    <textarea
                        name="question_text"
                        value={questionData.question_text}
                        onChange={handleQuestionChange}
                        required
                        rows={3}
                        placeholder="Enter your question..."
                        className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2.5"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                        <label className="block text-sm text-slate-300 mb-1">
                            Marks
                        </label>

                        <input
                            type="number"
                            name="marks"
                            value={questionData.marks}
                            onChange={handleQuestionChange}
                            min="0.01"
                            step="0.01"
                            required
                            className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2.5"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-300 mb-1">
                            Difficulty
                        </label>

                        <select
                            name="difficulty"
                            value={questionData.difficulty}
                            onChange={handleQuestionChange}
                            className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2.5"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                </div>

                <div>
                    <label className="block text-sm text-slate-300 mb-3">
                        Answer Options
                    </label>

                    <p className="text-xs text-slate-500 mb-3">
                        Enter four options and select the correct answer.
                    </p>

                    <div className="space-y-3">

                        {options.map((option, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                            >

                                <input
                                    type="radio"
                                    name="correctOption"
                                    checked={option.is_correct}
                                    onChange={() => selectCorrectOption(index)}
                                    className="accent-emerald-500"
                                    title="Mark as correct"
                                />

                                <input
                                    type="text"
                                    value={option.option_text}
                                    onChange={e =>
                                        handleOptionChange(index, e.target.value)
                                    }
                                    required
                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                    className="flex-1 bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2.5"
                                />

                                {option.is_correct && (
                                    <CheckCircle2
                                        size={18}
                                        className="text-emerald-400"
                                    />
                                )}

                            </div>
                        ))}

                    </div>
                </div>

                <div className="flex gap-3">

                    <button
                        type="submit"
                        disabled={savingQuestion}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                       {savingQuestion
                                ? "Saving..."
                                : editingQuestionId
                                    ? "Update Question"
                                    : "Save Question"}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                                    setShowQuestionForm(false);
                                    setEditingQuestionId(null);
                                }}
                        className="border border-slate-700 text-slate-300 px-5 py-2.5 rounded-lg"
                    >
                        Cancel
                    </button>

                </div>

            </form>
        )}

        {questionLoading ? (
            <p className="text-center text-slate-400 py-8">
                Loading questions...
            </p>
        ) : questions.length === 0 ? (
            <div className="text-center py-10">
                <BookOpen
                    size={36}
                    className="mx-auto text-slate-500 mb-3"
                />

                <p className="text-slate-400">
                    No questions added yet.
                </p>
            </div>
        ) : (
            <div className="space-y-4">

                {questions.map((question, index) => (
                    <QuestionCard
                        key={question.question_id}
                        question={question}
                        index={index}
                        onEdit={handleEditQuestion}
                        onDelete={handleDeleteQuestion}
                    />
                ))}

            </div>
        )}

    </div>
)}
            </div>

            {/* Delete Confirmation Modal */}
            {assessmentToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                            <Trash2 className="text-red-400" size={24} />
                        </div>

                        <h2 className="text-xl font-semibold text-white">
                            Delete Assessment?
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Are you sure you want to delete
                            <span className="font-semibold text-white">
                                {" "}{assessmentToDelete.title}
                            </span>?
                            This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setAssessmentToDelete(null)}
                                disabled={deleting}
                                className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500 disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete Assessment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

function QuestionCard({ question, index, onEdit, onDelete  }) {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOptions() {
            try {
                const response = await adminApi.get(
                    `admin/questions/${question.question_id}/options/`
                );

                setOptions(response.data);
            } catch (err) {
                console.error("Failed to load options:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchOptions();
    }, [question.question_id]);

    return (
        <div className="border border-slate-700 rounded-xl p-5">

            <div className="flex justify-between gap-3 mb-3">

    <h3 className="font-semibold text-white">
        Q{index + 1}. {question.question_text}
    </h3>

    <div className="flex items-center gap-3 shrink-0">

                    <span className="text-xs text-indigo-300">
                        {question.marks} marks
                    </span>

                    <button
                        onClick={() => onEdit(question)}
                        className="text-indigo-400 hover:text-indigo-300"
                        title="Edit question"
                    >
                        <Pencil size={17} />
                    </button>

                    <button
                        onClick={() => onDelete(question)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete question"
                    >
                        <Trash2 size={17} />
                    </button>

                </div>

            </div>

            <div className="flex gap-2 flex-wrap mb-4">
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                    {question.difficulty}
                </span>

                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                    Topic ID: {question.topic}
                </span>
            </div>

            {loading ? (
                <p className="text-sm text-slate-500">
                    Loading options...
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                    {options.map((option, i) => (
                        <div
                            key={option.option_id}
                            className={`text-sm rounded-lg px-3 py-2 border ${
                                option.is_correct
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                    : "border-slate-700 text-slate-400"
                            }`}
                        >
                            {String.fromCharCode(65 + i)}. {option.option_text}

                            {option.is_correct && (
                                <span className="ml-2 text-xs">
                                    (Correct)
                                </span>
                            )}
                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default AdminAssessments;

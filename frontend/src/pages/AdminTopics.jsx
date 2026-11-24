
import { useEffect, useState, useRef } from "react";
import {
    Plus, Search, Pencil, Trash2, BookOpen, X
} from "lucide-react";
import adminApi from "../services/adminApi";

function AdminTopics() {
    const [topics, setTopics] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [topicToDelete, setTopicToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        sequence_number: 1,
        course: ""
    });

    async function fetchData() {
        try {
            const [topicResponse, courseResponse] = await Promise.all([
                adminApi.get("admin/topics/"),
                adminApi.get("admin/courses/")
            ]);

            setTopics(topicResponse.data);
            setCourses(courseResponse.data);
        } catch (err) {
            setError("Failed to load topics or courses.");
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
            description: "",
            sequence_number: 1,
            course: courses[0]?.course_id || ""
        });
        setShowForm(true);
        setError("");
        setSuccess("");
    }

    function openEditForm(topic) {
        setEditingId(topic.topic_id);
        setFormData({
            title: topic.title,
            description: topic.description || "",
            sequence_number: topic.sequence_number,
            course: topic.course
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
            sequence_number: Number(formData.sequence_number),
            course: Number(formData.course)
        };

        try {
            if (editingId) {
                await adminApi.patch(
                    `admin/topics/${editingId}/`,
                    data
                );
                setSuccess("Topic updated successfully.");
            } else {
                await adminApi.post("topics/create/", data);
                setSuccess("Topic created successfully.");
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
        if (!topicToDelete) return;

        setDeleting(true);
        setError("");
        setSuccess("");

        try {
            await adminApi.delete(
                `admin/topics/${topicToDelete.topic_id}/`
            );

            setSuccess("Topic deleted successfully.");
            setTopicToDelete(null);
            await fetchData();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Failed to delete topic."
            );
        } finally {
            setDeleting(false);
        }
    }

    const filteredTopics = topics.filter(topic => {
        const course = courses.find(
            c => c.course_id === topic.course
        );

        return (
            topic.title.toLowerCase().includes(search.toLowerCase()) ||
            course?.title.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Topic Management
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Create and manage topics across your courses.
                    </p>
                </div>

                <button
                    onClick={openAddForm}
                    disabled={courses.length === 0}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    <Plus size={18} />
                    Add Topic
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
                        placeholder="Search topics or courses..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg pl-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Add / Edit Form */}
            {showForm && (
                <div 
                    ref = {formRef}
                    className="bg-slate-900 rounded-xl border border-slate-800 p-6 scroll-mt-6">

                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-semibold text-white">
                            {editingId ? "Edit Topic" : "Create Topic"}
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
                                Topic Title
                            </label>

                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                maxLength={150}
                                placeholder="Enter topic title"
                                className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Describe this topic..."
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

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                                Sequence Number
                            </label>

                            <input
                                type="number"
                                name="sequence_number"
                                value={formData.sequence_number}
                                onChange={handleChange}
                                min="1"
                                required
                                className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700"
                            >
                                {editingId ? "Save Changes" : "Create Topic"}
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

            {/* Topics List */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">

                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="font-semibold text-white">
                        All Topics
                    </h2>

                    <span className="text-sm text-slate-400">
                        {filteredTopics.length} topics
                    </span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        Loading topics...
                    </div>
                ) : filteredTopics.length === 0 ? (
                    <div className="p-10 text-center">
                        <BookOpen
                            className="mx-auto text-slate-500 mb-3"
                            size={36}
                        />
                        <p className="text-slate-400">
                            No topics found.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">

                        {filteredTopics.map(topic => {
                            const course = courses.find(
                                c => c.course_id === topic.course
                            );

                            return (
                                <div
                                    key={topic.topic_id}
                                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800"
                                >
                                    <div>
                                        <h3 className="font-semibold text-white">
                                            {topic.title}
                                        </h3>

                                        <p className="text-sm text-slate-400 mt-1">
                                            {topic.description || "No description"}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full">
                                                {course?.title || "Unknown course"}
                                            </span>

                                            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                                                Sequence: {topic.sequence_number}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditForm(topic)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400"
                                        >
                                            <Pencil size={15} />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => setTopicToDelete(topic)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete topic"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {topicToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

                    <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                            <Trash2 className="text-red-400" size={24} />
                        </div>

                        <h2 className="text-xl font-semibold text-white">
                            Delete Topic?
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Are you sure you want to delete
                            <span className="font-semibold text-white">
                                {" "}{topicToDelete.title}
                            </span>?
                            This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                onClick={() => setTopicToDelete(null)}
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
                                {deleting ? "Deleting..." : "Delete Topic"}
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminTopics;

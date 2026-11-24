
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, BookOpen, X } from "lucide-react";
import adminApi from "../services/adminApi";

function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        level: "Beginner"
    });

    async function fetchCourses() {
        try {
            const response = await adminApi.get("admin/courses/");
            setCourses(response.data);
        } catch (err) {
            setError("Failed to load courses.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCourses();
    }, []);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    function openAddForm() {
        setEditingId(null);
        setFormData({ title: "", description: "", level: "Beginner" });
        setShowForm(true);
        setError("");
        setSuccess("");
    }

    function openEditForm(course) {
        setEditingId(course.course_id);
        setFormData({
            title: course.title,
            description: course.description || "",
            level: course.level
        });
        setShowForm(true);
        setError("");
        setSuccess("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            if (editingId) {
                await adminApi.patch(`admin/courses/${editingId}/`, formData);
                setSuccess("Course updated successfully.");
            } else {
                await adminApi.post("courses/create/", formData);
                setSuccess("Course created successfully.");
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({ title: "", description: "", level: "Beginner" });
            await fetchCourses();
        } catch (err) {
            setError(
                err.response?.data
                    ? JSON.stringify(err.response.data)
                    : "Something went wrong."
            );
        }
    }

    async function handleDelete() {
        if (!courseToDelete) return;

        setDeleting(true);
        setError("");
        setSuccess("");

        try {
            await adminApi.delete(
            `admin/courses/${courseToDelete.course_id}/`
            );

            setSuccess("Course deleted successfully.");
            setCourseToDelete(null);
            await fetchCourses();
        } catch (err) {
            setError(
            err.response?.data?.error || "Failed to delete course."
            );
        } finally {
            setDeleting(false);
        }
        }

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Course Management
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Create and manage your learning courses.
                    </p>
                </div>

                <button
                    onClick={openAddForm}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700"
                >
                    <Plus size={18} />
                    Add Course
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 text-red-400 border border-red-500/20">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {success}
                </div>
            )}

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-3 text-slate-500"
                    />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg pl-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                    />
                </div>
            </div>

            {showForm && (
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-semibold text-white">
                            {editingId ? "Edit Course" : "Create Course"}
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
                                Course Title
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                maxLength={150}
                                className="w-full border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter course title"
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
                                rows={4}
                                className="w-full border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describe this course..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                                Difficulty Level
                            </label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                required
                                className="w-full border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700"
                            >
                                {editingId ? "Save Changes" : "Create Course"}
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

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="font-semibold text-white">
                        All Courses
                    </h2>
                    <span className="text-sm text-slate-400">
                        {filteredCourses.length} courses
                    </span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        Loading courses...
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="p-10 text-center">
                        <BookOpen className="mx-auto text-gray-300 mb-3" size={36} />
                        <p className="text-slate-400">No courses found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredCourses.map(course => (
                            <div
                                key={course.course_id}
                                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800"
                            >
                                <div>
                                    <h3 className="font-semibold text-white">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {course.description || "No description"}
                                    </p>
                                    <span className="inline-block mt-2 text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full">
                                        {course.level}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditForm(course)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-indigo-50 hover:text-slate-800"
                                    >
                                        <Pencil size={15} />
                                        Edit
                                    </button>
                                    <button
                                    onClick={() => setCourseToDelete(course)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete course"
                                    >
                                    <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {courseToDelete && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

    <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
        <Trash2 className="text-red-400" size={24} />
      </div>

      <h2 className="text-xl font-semibold text-white">
        Delete Course?
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Are you sure you want to delete
        <span className="font-semibold text-white">
          {" "}{courseToDelete.title}
        </span>?
        This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={() => setCourseToDelete(null)}
          disabled={deleting}
          className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {deleting ? "Deleting..." : "Delete Course"}
        </button>

      </div>
    </div>
  </div>
)}
        </div>
        
    );
}

export default AdminCourses;

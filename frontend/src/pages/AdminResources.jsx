
import { useEffect, useRef, useState } from "react";
import {
    Plus, Search, Pencil, Trash2, BookOpen, X,
    Video, FileText, Link as LinkIcon
} from "lucide-react";
import adminApi from "../services/adminApi";

function AdminResources() {
    const [resources, setResources] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        resource_type: "video",
        url: "",
        topic: ""
    });

    async function fetchData() {
        try {
            const [resourceResponse, topicResponse] = await Promise.all([
                adminApi.get("admin/resources/"),
                adminApi.get("admin/topics/")
            ]);

            setResources(resourceResponse.data);
            setTopics(topicResponse.data);
        } catch (err) {
            setError("Failed to load resources or topics.");
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
            resource_type: "video",
            url: "",
            topic: topics[0]?.topic_id || ""
        });

        setShowForm(true);
        setError("");
        setSuccess("");
    }

    function openEditForm(resource) {
        setEditingId(resource.resource_id);
        setFormData({
            title: resource.title,
            resource_type: resource.resource_type,
            url: resource.url,
            topic: resource.topic
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
            topic: Number(formData.topic)
        };

        try {
            if (editingId) {
                await adminApi.patch(
                    `admin/resources/${editingId}/`,
                    data
                );
                setSuccess("Resource updated successfully.");
            } else {
                await adminApi.post("resources/create/", data);
                setSuccess("Resource created successfully.");
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
        if (!resourceToDelete) return;

        setDeleting(true);
        setError("");
        setSuccess("");

        try {
            await adminApi.delete(
                `admin/resources/${resourceToDelete.resource_id}/`
            );

            setSuccess("Resource deleted successfully.");
            setResourceToDelete(null);
            await fetchData();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Failed to delete resource."
            );
        } finally {
            setDeleting(false);
        }
    }

    const filteredResources = resources.filter(resource => {
        const topic = topics.find(
            t => t.topic_id === resource.topic
        );

        return (
            resource.title.toLowerCase().includes(search.toLowerCase()) ||
            topic?.title.toLowerCase().includes(search.toLowerCase()) ||
            resource.resource_type.toLowerCase().includes(search.toLowerCase())
        );
    });

    function getResourceIcon(type) {
        if (type === "video") return <Video size={18} />;
        if (type === "pdf") return <FileText size={18} />;
        return <LinkIcon size={18} />;
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Resource Management
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Manage videos, articles and learning materials.
                    </p>
                </div>

                <button
                    onClick={openAddForm}
                    disabled={topics.length === 0}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    <Plus size={18} />
                    Add Resource
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
                        placeholder="Search resources, topics or types..."
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
                            {editingId ? "Edit Resource" : "Create Resource"}
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
                                Resource Title
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                maxLength={200}
                                placeholder="Enter resource title"
                                className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                                Resource Type
                            </label>
                            <select
                                name="resource_type"
                                value={formData.resource_type}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="video">Video</option>
                                <option value="article">Article</option>
                                <option value="pdf">PDF</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                                Resource URL
                            </label>
                            <input
                                type="url"
                                name="url"
                                value={formData.url}
                                onChange={handleChange}
                                required
                                placeholder="https://example.com/resource"
                                className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1">
                                Topic
                            </label>
                            <select
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select a topic</option>

                                {topics.map(topic => (
                                    <option
                                        key={topic.topic_id}
                                        value={topic.topic_id}
                                    >
                                        {topic.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700"
                            >
                                {editingId ? "Save Changes" : "Create Resource"}
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

            {/* Resources List */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">

                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="font-semibold text-white">
                        All Resources
                    </h2>

                    <span className="text-sm text-slate-400">
                        {filteredResources.length} resources
                    </span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        Loading resources...
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="p-10 text-center">
                        <BookOpen
                            className="mx-auto text-slate-500 mb-3"
                            size={36}
                        />
                        <p className="text-slate-400">
                            No resources found.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">

                        {filteredResources.map(resource => {
                            const topic = topics.find(
                                t => t.topic_id === resource.topic
                            );

                            return (
                                <div
                                    key={resource.resource_id}
                                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800"
                                >
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-white">
                                            {resource.title}
                                        </h3>

                                        <p className="text-sm text-slate-400 mt-1 break-all">
                                            {resource.url}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="flex items-center gap-1 text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full">
                                                {getResourceIcon(resource.resource_type)}
                                                {resource.resource_type}
                                            </span>

                                            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                                                {topic?.title || "Unknown topic"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => openEditForm(resource)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400"
                                        >
                                            <Pencil size={15} />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => setResourceToDelete(resource)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete resource"
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
            {resourceToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                            <Trash2 className="text-red-400" size={24} />
                        </div>

                        <h2 className="text-xl font-semibold text-white">
                            Delete Resource?
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Are you sure you want to delete
                            <span className="font-semibold text-white">
                                {" "}{resourceToDelete.title}
                            </span>?
                            This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setResourceToDelete(null)}
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
                                {deleting ? "Deleting..." : "Delete Resource"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminResources;

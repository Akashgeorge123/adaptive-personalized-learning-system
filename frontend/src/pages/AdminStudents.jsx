
import { useEffect, useMemo, useState } from "react";
import {
    Users,
    Search,
    RefreshCw,
    Mail,
    GraduationCap,
    UserRound,
    Trash2,
    X
} from "lucide-react";

import adminApi from "../services/adminApi";

function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [deletingStudent, setDeletingStudent] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await adminApi.get("admin/students/");

            setStudents(response.data);
        } catch (err) {
            console.error("Failed to fetch students:", err);

            setError(
                err.response?.data?.error ||
                "Unable to load students. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async () => {
    if (!deletingStudent) return;

    try {
        setDeleteLoading(true);
        setDeleteError("");

        await adminApi.delete(
            `admin/students/${deletingStudent.student_id}/delete/`
        );

        setStudents((prev) =>
            prev.filter(
                (student) =>
                    student.student_id !== deletingStudent.student_id
            )
        );

        setDeletingStudent(null);

        } catch (err) {
            setDeleteError(
                err.response?.data?.error ||
                "Failed to delete student."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const query = search.toLowerCase();

            return (
                student.name?.toLowerCase().includes(query) ||
                student.email?.toLowerCase().includes(query) ||
                String(student.student_id).includes(query)
            );
        });
    }, [students, search]);

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                        Administration
                    </p>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Students
                </h1>

                <p className="text-slate-400 mt-2">
                    View and manage registered students on your platform.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-5">
                        <p className="text-sm text-slate-400 font-medium">
                            Total Students
                        </p>

                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <Users size={22} />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white">
                        {loading ? "..." : students.length}
                    </h2>

                    <p className="text-xs text-slate-500 mt-2">
                        Registered accounts
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-5">
                        <p className="text-sm text-slate-400 font-medium">
                            Matching Students
                        </p>

                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <GraduationCap size={22} />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white">
                        {loading ? "..." : filteredStudents.length}
                    </h2>

                    <p className="text-xs text-slate-500 mt-2">
                        Based on current search
                    </p>
                </div>

            </div>

            {/* Student Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                {/* Table Header */}
                <div className="p-5 md:p-6 border-b border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Registered Students
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Browse student accounts
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">

                            <div className="relative">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full sm:w-64 bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <button
                                onClick={fetchStudents}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
                            >
                                <RefreshCw
                                    size={16}
                                    className={loading ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>

                        </div>
                    </div>
                </div>

                {/* Table Content */}
                {error ? (
                    <div className="p-10 text-center">
                        <p className="text-red-400 mb-4">{error}</p>

                        <button
                            onClick={fetchStudents}
                            className="text-sm text-indigo-400 hover:text-indigo-300"
                        >
                            Try again
                        </button>
                    </div>
                ) : loading ? (
                    <div className="p-12 text-center text-slate-400">
                        Loading students...
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="p-12 text-center">
                        <UserRound
                            size={36}
                            className="mx-auto text-slate-600 mb-3"
                        />

                        <h3 className="text-white font-medium">
                            No students found
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                            {search
                                ? "Try a different search term."
                                : "No students have registered yet."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">

                            <thead>
                                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                                    <th className="px-6 py-4 font-semibold">
                                        Student
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Student ID
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Email Address
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr
                                        key={student.student_id}
                                        className="border-b border-slate-800/70 hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">

                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-semibold">
                                                    {student.name?.charAt(0)?.toUpperCase() || "S"}
                                                </div>

                                                <span className="text-sm font-medium text-white">
                                                    {student.name}
                                                </span>

                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-400">
                                                #{student.student_id}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <Mail size={15} className="text-slate-500" />
                                                {student.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    setDeletingStudent(student);
                                                    setDeleteError("");
                                                }}
                                                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

                {/* Footer */}
                {!loading && !error && (
                    <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
                        Showing {filteredStudents.length} of {students.length} students
                    </div>
                )}

            </div>
            {deletingStudent && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">

            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-white">
                    Delete Student
                </h2>

                <button
                    onClick={() => setDeletingStudent(null)}
                    disabled={deleteLoading}
                    className="text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            <p className="text-slate-400 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="text-white font-semibold">
                    {deletingStudent.name}
                </span>
                's account? This action cannot be undone.
            </p>

            <p className="text-sm text-slate-500 mt-3">
                Their learning progress and recommendations will also be deleted.
                Students with assessment results cannot be deleted.
            </p>

            {deleteError && (
                <p className="text-sm text-red-400 mt-4">
                    {deleteError}
                </p>
            )}

            <div className="flex justify-end gap-3 mt-7">

                <button
                    onClick={() => setDeletingStudent(null)}
                    disabled={deleteLoading}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                    Cancel
                </button>

                <button
                    onClick={handleDeleteStudent}
                    disabled={deleteLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                >
                    <Trash2 size={16} />
                    {deleteLoading ? "Deleting..." : "Delete Student"}
                </button>

            </div>

        </div>
    </div>
)}

        </div>
    );
}

export default AdminStudents;

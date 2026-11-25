
import { useEffect, useState } from "react";
import {
    Users,
    BookOpen,
    Layers,
    Video,
    ClipboardList
} from "lucide-react";
import adminApi from "../services/adminApi";

function AdminDashboard() {
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        topics: 0,
        resources: 0,
        assessments: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            const endpoints = [
                "admin/students/",
                "admin/courses/",
                "admin/topics/",
                "admin/resources/",
                "admin/assessments/"
            ];

            const results = await Promise.allSettled(
                endpoints.map(endpoint => adminApi.get(endpoint))
            );

            function getCount(result) {
                if (result.status !== "fulfilled") return 0;

                const data = result.value.data;

                if (Array.isArray(data)) return data.length;
                if (Array.isArray(data.results)) return data.results.length;

                return 0;
            }

            setStats({
                students: getCount(results[0]),
                courses: getCount(results[1]),
                topics: getCount(results[2]),
                resources: getCount(results[3]),
                assessments: getCount(results[4])
            });

            setLoading(false);
        }

        fetchStats();
    }, []);

    const cards = [
        { title: "Total Students", value: stats.students, icon: Users },
        { title: "Total Courses", value: stats.courses, icon: BookOpen },
        { title: "Total Topics", value: stats.topics, icon: Layers },
        { title: "Learning Resources", value: stats.resources, icon: Video },
        { title: "Assessments", value: stats.assessments, icon: ClipboardList }
    ];

    return (
        
<div className="space-y-8">

    {/* Header */}
    <div>
        <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Administration
            </p>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Admin Dashboard
        </h1>

        <p className="text-slate-400 mt-2">
            Manage and monitor your personalized learning platform.
        </p>
    </div>

    {/* Welcome Section */}
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/50 rounded-2xl p-7 md:p-9">
        <div className="absolute -right-12 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-medium mb-5">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                Control Center
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
                Welcome to the Administration Panel
            </h2>

            <p className="text-slate-400 leading-relaxed">
                Manage courses, organize topics, publish learning resources,
                create assessments and monitor registered students from one place.
            </p>
        </div>
    </div>

    {/* Statistics */}
    <div>
        <div className="flex items-center justify-between mb-5">
            <div>
                <h2 className="text-xl font-semibold text-white">
                    Platform Overview
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    A snapshot of your learning platform
                </p>
            </div>

            <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                Live Statistics
            </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.title}
                        className="group bg-slate-900/80 border border-slate-800 p-6 rounded-2xl transition-all duration-300 hover:border-indigo-500/40 hover:bg-slate-900 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/20"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-sm font-medium text-slate-400">
                                {card.title}
                            </p>

                            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                <Icon size={22} />
                            </div>
                        </div>

                        <h3 className="text-3xl font-bold tracking-tight text-white">
                            {loading ? (
                                <span className="text-slate-600 animate-pulse">---</span>
                            ) : (
                                card.value
                            )}
                        </h3>

                        <div className="mt-5 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 opacity-70"></div>
                        </div>
                    </div>
                );
            })}

        </div>
    </div>

</div>

    );
}

export default AdminDashboard;


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
                "courses/",
                "topics/",
                "resources/",
                "assessments/"
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
        <div>
            <h1 className="text-3xl font-bold mb-2">
                Admin Dashboard
            </h1>

            <p className="text-slate-400 mb-8">
                Manage your personalized learning platform.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="bg-slate-900 border border-slate-800 p-6 rounded-xl"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <p className="text-slate-400">
                                    {card.title}
                                </p>

                                <Icon size={23} className="text-indigo-400" />
                            </div>

                            <h2 className="text-3xl font-bold">
                                {loading ? "..." : card.value}
                            </h2>
                        </div>
                    );
                })}

            </div>

            <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-3">
                    Welcome to the Administration Panel
                </h2>

                <p className="text-slate-400 leading-relaxed">
                    Use the sidebar to manage courses, topics, learning
                    resources, assessments and registered students.
                </p>
            </div>
        </div>
    );
}

export default AdminDashboard;

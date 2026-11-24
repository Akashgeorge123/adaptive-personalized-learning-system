
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    Layers,
    Video,
    ClipboardList,
    Users,
    LogOut
} from "lucide-react";

function AdminLayout() {
    const navigate = useNavigate();

    const adminName = localStorage.getItem("admin_name") || "Administrator";

    const navigation = [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Courses", path: "/admin/courses", icon: BookOpen },
        { name: "Topics", path: "/admin/topics", icon: Layers },
        { name: "Resources", path: "/admin/resources", icon: Video },
        { name: "Assessments", path: "/admin/assessments", icon: ClipboardList },
        { name: "Students", path: "/admin/students", icon: Users },
    ];

    function handleLogout() {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_id");
        localStorage.removeItem("admin_name");
        localStorage.removeItem("admin_email");

        navigate("/admin/login");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col">

                <h1 className="text-xl font-bold mb-2">
                    Learning Admin
                </h1>

                <p className="text-xs text-slate-400 mb-8">
                    Management Panel
                </p>

                <nav className="space-y-2 flex-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end
                                className={({ isActive }) =>
                                    `flex items-center gap-3 p-3 rounded-lg transition ${
                                        isActive
                                            ? "bg-indigo-600 text-white"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={19} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-800 pt-4">
                    <p className="text-sm text-white font-medium mb-1">
                        {adminName}
                    </p>

                    <p className="text-xs text-slate-400 mb-4">
                        Administrator
                    </p>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-red-400 hover:text-red-300 p-2 w-full"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 p-8">
                <Outlet />
            </main>

        </div>
    );
}

export default AdminLayout;

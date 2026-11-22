
import { NavLink } from "react-router-dom";
import {
  House,
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Brain,
  Route,
  X,
} from "lucide-react";

const navigation = [
  {
    name: "Home",
    path: "/home",
    icon: House,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Courses",
    path: "/courses",
    icon: BookOpen,
  },
  {
    name: "Assessments",
    path: "/assessments",
    icon: ClipboardCheck,
  },
  {
    name: "Recommendations",
    path: "/recommendations",
    icon: Brain,
  },
  {
    name: "Learning Paths",
    path: "/learning-paths",
    icon: Route,
  },
];

function Sidebar({ closeSidebar }) {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 p-5 flex flex-col">

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold text-indigo-400">
          LearnSmart
        </h1>

        {closeSidebar && (
          <button onClick={closeSidebar} className="text-slate-400">
            <X size={20} />
          </button>
        )}
      </div>

      <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">
        Main Menu
      </p>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <p className="text-xs text-slate-500">
          LearnSmart
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Personalized Learning Platform
        </p>
      </div>

    </aside>
  );
}

export default Sidebar;

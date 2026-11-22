
import { LogOut, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const studentName =
    localStorage.getItem("student_name") || "Student";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("student_id");
    localStorage.removeItem("student_name");
    localStorage.removeItem("student_email");

    navigate("/login");
  }

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400">
          Welcome back
        </p>
        <h2 className="font-semibold text-white">
          {studentName}
        </h2>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-slate-300">
          <UserCircle size={22} />
          <span className="text-sm">{studentName}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;


import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function StudentLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;

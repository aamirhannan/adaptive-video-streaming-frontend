import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Menu, Upload, Users, X } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import { useUI } from "../contexts/UIContext.js";
import { Button } from "../components/ui/button.js";
import { cn } from "../lib/utils.js";

const navIconClass = "h-4 w-4 shrink-0";

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUI();
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Library", icon: LayoutDashboard, allow: true },
    {
      to: "/upload",
      label: "Upload",
      icon: Upload,
      allow: user?.role === "editor" || user?.role === "admin",
    },
    {
      to: "/admin/users",
      label: "Users",
      icon: Users,
      allow: user?.role === "admin",
    },
  ].filter((item) => item.allow);

  const sidebar = (
    <div className="flex h-full flex-col rounded-r-3xl border-r border-white/10 bg-slate-950/70 px-3 pb-4 pt-5 backdrop-blur-2xl">
      <div className="mb-6 px-2">
        <h1 className="text-lg font-semibold tracking-tight">Adaptive Video</h1>
        <p className="text-xs text-slate-400">Streaming workspace</p>
      </div>
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300 transition-all",
                  "hover:bg-white/10 hover:text-white",
                  isActive &&
                    "bg-gradient-to-r from-violet-500/90 to-indigo-500/90 text-white shadow-[0_16px_28px_-18px_rgba(99,102,241,1)]",
                )
              }
            >
              <Icon className={navIconClass} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-slate-300">
        Role: <span className="font-medium text-slate-100">{user?.role}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-slate-950/55 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 lg:hidden"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="text-sm font-semibold text-slate-100">Dashboard</div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-slate-400 sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </div>

      <div className="flex pt-16">
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-64 lg:block">
          {sidebar}
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/55 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="h-full w-72"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute right-3 top-3 z-10">
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-slate-900/80 text-slate-200"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {sidebar}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

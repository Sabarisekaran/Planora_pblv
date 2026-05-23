import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  QrCode,
  Award,
  Image,
  FileText,
  FolderOpen,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  FormInput,
} from "lucide-react";
import { useState, useMemo } from "react";

const allMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Programs", path: "/programs" },
  { icon: QrCode, label: "QR Codes", path: "/qr-codes" },
  { icon: FormInput, label: "Forms", path: "/forms" },
  { icon: Award, label: "Certificates", path: "/certificates" },
  { icon: Image, label: "Poster Designer", path: "/poster" },
  { icon: FileText, label: "Proposals", path: "/proposals" },
  { icon: FolderOpen, label: "File Manager", path: "/files" },
  { icon: BarChart3, label: "Analytics", path: "/analytics", restrictedTo: ["admin"] },
  { icon: Settings, label: "Settings", path: "/settings", restrictedTo: ["admin"] },
];

// Items to hide from sidebar
const hiddenMenuItems = ["Poster Designer", "Proposals", "File Manager", "Analytics"];

const AppSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  // Get user role from localStorage
  const userRole = useMemo(() => localStorage.getItem("userRole") || "admin", []);
  
  // Filter menu items: hide specified items and filter by user role
  const menuItems = useMemo(
    () => allMenuItems.filter(
      item => 
        !hiddenMenuItems.includes(item.label) && 
        (!item.restrictedTo || item.restrictedTo.includes(userRole))
    ),
    [userRole]
  );

  return (
    <aside
      className={`hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-foreground tracking-tight">
            Planora
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft
            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className={`flex items-center gap-2 px-4 py-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">EF</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@planora.io</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;

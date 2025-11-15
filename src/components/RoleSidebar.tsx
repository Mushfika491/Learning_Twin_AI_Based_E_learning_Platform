import { Home, Users, BookOpen, TrendingUp, Brain, Code, FileText, BarChart3, Upload, AlertTriangle, Database, Activity, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

interface SidebarItem {
  title: string;
  href: string;
  icon: any;
}

const roleMenuItems: Record<string, SidebarItem[]> = {
  student: [
    { title: "Dashboard", href: "/student/dashboard", icon: Home },
  ],
  instructor: [
    { title: "Dashboard", href: "/instructor/dashboard", icon: Home },
  ],
  admin: [
    { title: "Dashboard", href: "/admin/dashboard", icon: Home },
  ],
  advisor: [
    { title: "Dashboard", href: "/advisor/dashboard", icon: Home },
  ],
  data_scientist: [
    { title: "Dashboard", href: "/data-scientist/dashboard", icon: Home },
  ],
  dev_team: [
    { title: "Dashboard", href: "/dev/dashboard", icon: Home },
  ],
};

interface RoleSidebarProps {
  role: string;
  className?: string;
}

export function RoleSidebar({ role, className }: RoleSidebarProps) {
  const menuItems = roleMenuItems[role] || roleMenuItems.student;

  return (
    <aside className={cn("w-64 border-r bg-card h-screen sticky top-0 overflow-y-auto", className)}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6 text-foreground">
          {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')} Menu
        </h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              activeClassName="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

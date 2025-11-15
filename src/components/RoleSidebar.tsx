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
    { title: "My Courses", href: "/student/courses", icon: BookOpen },
    { title: "Progress", href: "/student/progress", icon: TrendingUp },
  ],
  instructor: [
    { title: "Dashboard", href: "/instructor/dashboard", icon: Home },
    { title: "My Courses", href: "/instructor/courses", icon: BookOpen },
    { title: "Students", href: "/instructor/students", icon: Users },
    { title: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
    { title: "Content", href: "/instructor/content", icon: Upload },
  ],
  admin: [
    { title: "Dashboard", href: "/admin/dashboard", icon: Home },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Courses", href: "/admin/courses", icon: BookOpen },
    { title: "Reports", href: "/admin/reports", icon: FileText },
    { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ],
  advisor: [
    { title: "Dashboard", href: "/advisor/dashboard", icon: Home },
    { title: "Students", href: "/advisor/students", icon: Users },
    { title: "At-Risk", href: "/advisor/at-risk", icon: AlertTriangle },
    { title: "Interventions", href: "/advisor/interventions", icon: FileText },
    { title: "Analytics", href: "/advisor/analytics", icon: BarChart3 },
  ],
  data_scientist: [
    { title: "Dashboard", href: "/data-scientist/dashboard", icon: Home },
    { title: "Models", href: "/data-scientist/models", icon: Brain },
    { title: "Datasets", href: "/data-scientist/datasets", icon: Database },
    { title: "Experiments", href: "/data-scientist/experiments", icon: Activity },
    { title: "Analytics", href: "/data-scientist/analytics", icon: BarChart3 },
  ],
  dev_team: [
    { title: "Dashboard", href: "/dev/dashboard", icon: Home },
    { title: "System Health", href: "/dev/health", icon: Activity },
    { title: "Logs", href: "/dev/logs", icon: FileText },
    { title: "Performance", href: "/dev/performance", icon: TrendingUp },
    { title: "Deployments", href: "/dev/deployments", icon: Code },
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

import { Home, Users, BookOpen, TrendingUp, Brain, Code, FileText, BarChart3, Upload, AlertTriangle, Database, Activity, Settings, MessageSquare, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

interface SidebarItem {
  title: string;
  href: string;
  icon: any;
}

const roleMenuItems: Record<string, SidebarItem[]> = {
  student: [
    { title: "Student Dashboard", href: "/student/dashboard", icon: Home },
  ],
  instructor: [
    { title: "Dashboard", href: "/instructor/dashboard", icon: Home },
    { title: "My Courses", href: "/instructor/dashboard?tab=courses", icon: BookOpen },
    { title: "Content & Materials", href: "/instructor/dashboard?tab=content", icon: FileText },
    { title: "Students & Performance", href: "/instructor/dashboard?tab=students", icon: Users },
    { title: "Discussions", href: "/instructor/dashboard?tab=discussions", icon: MessageSquare },
    { title: "Profile & Expertise", href: "/instructor/dashboard?tab=profile", icon: User },
  ],
  admin: [
    { title: "Dashboard", href: "/admin/dashboard", icon: Home },
    { title: "User Management", href: "/admin/dashboard?tab=users", icon: Users },
    { title: "Reports", href: "/admin/dashboard?tab=reports", icon: FileText },
    { title: "System Settings", href: "/admin/dashboard?tab=settings", icon: Settings },
    { title: "My Profile", href: "/admin/dashboard?tab=profile", icon: User },
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
    <aside className={cn("w-64 bg-card h-screen sticky top-0 overflow-y-auto", className)}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6 text-foreground">
          {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')} Menu
        </h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors outline-none focus:outline-none focus-visible:outline-none"
              activeClassName="bg-primary text-primary-foreground"
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

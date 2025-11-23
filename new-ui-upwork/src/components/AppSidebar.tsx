import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, BarChart3, FileText, Users, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser, useAuth } from "@clerk/clerk-react";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useAuth();
  
  const currentPath = location.pathname;

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
    { title: "Jobs", url: "/jobs", icon: FileText },
    { title: "Users", url: "/users", icon: Users },
    { title: "Reports", url: "/reports", icon: BarChart3 },
    { title: "Settings", url: "/settings", icon: Settings },
  ];
  
  const handleLogout = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const userName = user?.fullName || 'Admin User';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'admin@example.com';

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
            <span className="font-bold text-lg">Up Sales</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                        currentPath === item.url
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.url);
                      }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between bg-sidebar-accent/20 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">
                {userName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start mt-2 text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
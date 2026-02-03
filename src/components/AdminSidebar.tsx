import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Menu,
  X,
  Shield,
  UserPlus,
  LogOut,
  Flag,
  ChevronDown,
  ChevronRight,
  Building2,
  UserCircle,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import routePath from '@/routes/routePath';
import config from '@/lib/config';

const mainItems = [
  { title: 'Dashboard', url: routePath.DASHBOARD, icon: BarChart3 },
  { title: 'Users', url: routePath.USER.LIST, icon: Users },
];

const adminItems = [
  { title: 'Role Management', url: routePath.ROLE.LIST, icon: Shield },
  {
    title: 'Members',
    url: routePath.MEMBER.LIST,
    icon: UserPlus,
    subItems: [
      { title: 'Candidates', url: routePath.MEMBER.CANDIDATES, icon: UserCircle },
      { title: 'Employers', url: routePath.MEMBER.EMPLOYERS, icon: Building2 },
    ],
  },
  { title: 'Companies', url: routePath.COMPANY.LIST, icon: Building2 },
  { title: 'Post Moderation', url: routePath.MODERATION.LIST, icon: Flag },
];

// const settingsItems = [
//   { title: "Settings", url: "/settings", icon: Settings },
// ];

export function AdminSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';
  const { logout, user } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Members']);

  const isActive = (path: string) => {
    if (path === routePath.DASHBOARD) return currentPath === routePath.DASHBOARD;
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-sidebar-accent text-sidebar-primary font-medium'
      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground';

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = (menuTitle: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuTitle) ? prev.filter((item) => item !== menuTitle) : [...prev, menuTitle],
    );
  };

  const isMenuExpanded = (menuTitle: string) => expandedMenus.includes(menuTitle);

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar" collapsible="icon">
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 flex-1">
            <img src={config.LOGO_URL} alt={config.APP_NAME} className="h-10 w-10 object-contain" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground">{config.APP_NAME}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">Admin Panel</p>
            </div>
          </div>
        ) : (
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-2">
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === routePath.DASHBOARD}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${getNavCls(
                        { isActive: isActive(item.url) },
                      )}`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-2">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems ? (
                    <div>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => toggleMenu(item.title)}
                          className={`w-full flex items-center justify-between space-x-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive(item.url)
                              ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                              : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span className="font-medium">{item.title}</span>}
                          </div>
                          {!isCollapsed &&
                            (isMenuExpanded(item.title) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            ))}
                        </button>
                      </SidebarMenuButton>
                      {!isCollapsed && isMenuExpanded(item.title) && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                          {item.subItems.map((subItem) => (
                            <NavLink
                              key={subItem.title}
                              to={subItem.url}
                              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${getNavCls(
                                { isActive: isActive(subItem.url) },
                              )}`}
                            >
                              <subItem.icon className="h-4 w-4 flex-shrink-0" />
                              <span>{subItem.title}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === routePath.DASHBOARD}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${getNavCls(
                          { isActive: isActive(item.url) },
                        )}`}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings section commented out for now */}
        {/* <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-2">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === routePath.DASHBOARD}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${getNavCls(
                        { isActive: isActive(item.url) }
                      )}`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}

        <div className="mt-auto pt-4 border-t border-sidebar-border space-y-2">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-sidebar-accent/50">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground text-sm font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.email || 'Admin User'}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">Administrator</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

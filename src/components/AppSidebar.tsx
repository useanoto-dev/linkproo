import { Link, Plus, LayoutDashboard, Settings, Zap, LogOut, BarChart3, GraduationCap, HelpCircle, Shield, Users, Sun, Moon, PlayCircle, LifeBuoy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { useUserRole } from "@/hooks/use-user-role";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useOnboardingStore } from "@/stores/onboarding-store";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Meus Links", url: "/links", icon: Link },
  { title: "Criar Link", url: "/links/new", icon: Plus },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const communityItems = [
  { title: "Videoaulas", url: "/videoaulas", icon: GraduationCap },
  { title: "Suporte", url: "/suporte", icon: HelpCircle },
];

const settingsItems = [
  { title: "Configurações", url: "/settings", icon: Settings },
];

const adminItems = [
  { title: "Painel Admin", url: "/admin", icon: Shield },
  { title: "Usuários", url: "/admin/users", icon: Users },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Videoaulas", url: "/admin/videoaulas", icon: PlayCircle },
  { title: "Suporte", url: "/admin/suporte", icon: LifeBuoy },
];

const HIGHLIGHT_MAP: Record<string, string> = {
  '/': 'dashboard',
  '/links': 'meus-links',
  '/links/new': 'criar-link',
  '/analytics': 'analytics',
  '/videoaulas': 'videoaulas',
  '/suporte': 'suporte',
  '/settings': 'configuracoes',
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const highlight = useOnboardingStore((s) => s.currentHighlight());
  const { reset, start } = useOnboardingStore();

  const displayName = profile?.display_name || user?.user_metadata?.display_name || "";
  const avatarUrl = profile?.avatar_url || "";
  const email = user?.email || "";
  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const renderHighlightableGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-widest">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isHighlighted = highlight !== null && HIGHLIGHT_MAP[item.url] === highlight;
            return (
              <SidebarMenuItem key={item.title}>
                <div className="relative">
                  {isHighlighted && (
                    <motion.div
                      layoutId="onboarding-highlight"
                      className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-primary/40"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </div>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  const renderMenuGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-widest">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer"
                  activeClassName="bg-sidebar-accent text-primary font-medium"
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarContent className="bg-sidebar dark:bg-sidebar">
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? "justify-center px-0 py-4" : "gap-2 px-4 py-5"}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-sidebar-accent-foreground">
              LinkPro
            </span>
          )}
        </div>

        {renderHighlightableGroup("Menu", mainItems)}
        {renderHighlightableGroup("Comunidade", communityItems)}
        {renderHighlightableGroup("Sistema", settingsItems)}

        {isAdmin && renderMenuGroup("Administração", adminItems)}
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border">
        {/* Theme toggle */}
        <div className={`flex ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2"}`}>
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer ${
              collapsed
                ? "p-2 hover:bg-sidebar-accent text-sidebar-foreground"
                : "w-full px-3 py-2 text-xs font-medium hover:bg-sidebar-accent text-sidebar-foreground"
            }`}
            title={theme === "dark" ? "Modo Nexus (Claro)" : "Modo Dark"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 shrink-0 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 shrink-0 text-primary" />
            )}
            {!collapsed && (
              <span>{theme === "dark" ? "Modo Nexus" : "Modo Dark"}</span>
            )}
          </button>
        </div>

        {/* Refazer tour button */}
        {!collapsed && (
          <div className="px-3 pb-1">
            <button
              type="button"
              onClick={() => { reset(); start(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Refazer tour
            </button>
          </div>
        )}

        <div className={`flex items-center ${collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2"}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-8 w-8 shrink-0 rounded-full object-cover" style={{ minWidth: 32, minHeight: 32 }} />
          ) : (
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center" style={{ minWidth: 32, minHeight: 32 }}>
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                  {displayName || email}
                </p>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                    Admin
                  </span>
                )}
              </div>
              {displayName && (
                <p className="text-[10px] text-sidebar-foreground truncate">{email}</p>
              )}
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-destructive transition-colors duration-200 cursor-pointer shrink-0"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-destructive transition-colors duration-200 cursor-pointer mx-auto"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

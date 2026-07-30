import {
  createFileRoute,
  Outlet,
  useRouterState,
  redirect,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Activity,
  Search,
  MapPin,
  Sparkles,
  ImageIcon,
  BarChart3,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const DEVELOPER_EMAILS = new Set(["zmmateus2@gmail.com"]);

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};
const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Usuários", icon: Users },
  { to: "/admin/financial", label: "Financeiro", icon: CreditCard },
  { to: "/admin/reports", label: "Relatórios", icon: FileText },
  { to: "/admin/logs", label: "Logs", icon: Activity },
  { to: "/admin/seo", label: "SEO", icon: Search },
  { to: "/admin/geo", label: "GEO", icon: MapPin },
  { to: "/admin/ai", label: "IA", icon: Sparkles },
  { to: "/admin/branding", label: "Branding", icon: ImageIcon },
  { to: "/admin/insights", label: "Insights", icon: BarChart3 },
];

function AdminLayout() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) =>
      setEmail(data.session?.user?.email?.toLowerCase() ?? null),
    );
  }, []);

  if (email === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!email || !DEVELOPER_EMAILS.has(email)) {
    throw redirect({ to: "/dashboard" });
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="px-2 py-1.5 text-sm font-semibold">Admin</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Painel</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.to, item.exact)}
                      >
                        <a href={item.to} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Voltar</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/dashboard" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="flex h-12 items-center gap-2 border-b px-3">
            <SidebarTrigger />
            <div className="text-sm font-medium">Painel administrativo</div>
            <div className="ml-auto text-xs text-muted-foreground">{email}</div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

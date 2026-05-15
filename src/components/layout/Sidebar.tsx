import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileCheck as FileCheck2, FilePlus, ShieldCheck, ListChecks, Database, ChevronRight, Users, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/contexts/AuthContext";
import {
  SidebarProvider,
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const sellerNav: NavItem[] = [
  { label: "Painel", href: ROUTES.seller.dashboard, icon: LayoutDashboard },
  { label: "Validação", href: ROUTES.seller.validation, icon: FileCheck2 },
  { label: "Duplicatas", href: ROUTES.seller.duplicatas.list, icon: Receipt },
  { label: "Nova duplicata", href: ROUTES.seller.duplicatas.new, icon: FilePlus },
];

const analystNav: NavItem[] = [
  { label: "Painel", href: ROUTES.analyst.dashboard, icon: LayoutDashboard },
  { label: "Cedentes", href: ROUTES.analyst.sellers.list, icon: Users },
  { label: "Duplicatas", href: ROUTES.analyst.duplicatas.list, icon: Receipt },
];

const adminNav: NavItem[] = [
  { label: "Painel", href: ROUTES.admin.dashboard, icon: LayoutDashboard },
  { label: "Cedentes (risco)", href: ROUTES.admin.sellers.list, icon: Users },
  { label: "Validações", href: ROUTES.admin.validations, icon: ShieldCheck },
  { label: "Recebíveis", href: ROUTES.admin.receivables, icon: ListChecks },
  { label: "Transações internas", href: ROUTES.admin.transactions, icon: Database },
];

const profileConfig = {
  seller: { nav: sellerNav, label: "Cedente", color: "text-primary" },
  admin: { nav: adminNav, label: "Admin", color: "text-chart-4" },
  riskAnalyst: { nav: analystNav, label: "Analista", color: "text-chart-2" },
};

export function AppSidebar() {
  const { selectedProfile } = useAuth();
  const profile = selectedProfile ?? "seller";
  const config = profileConfig[profile];

  return (
    <ShadcnSidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <img src="/dupply-logo.png" alt="Dupply" className="h-7 w-7 object-contain shrink-0" />
          <span className="font-bold text-sidebar-foreground text-base truncate">Dupply</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(config.color)}>
            {config.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {config.nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <NavLink
                      to={item.href}
                      end
                      className={({ isActive }) =>
                        cn(isActive && "data-[active=true]:bg-sidebar-accent")
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon />
                          <span>{item.label}</span>
                          {isActive && <ChevronRight className="ml-auto size-3 opacity-50" />}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/40 truncate">
          Dupply MVP
        </div>
      </SidebarFooter>
      <SidebarRail />
    </ShadcnSidebar>
  );
}

export { SidebarProvider, SidebarTrigger };

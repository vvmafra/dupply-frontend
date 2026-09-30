import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileCheck as FileCheck2, FilePlus, ShieldCheck, ListChecks, Database, ChevronRight, Users, Receipt, TrendingUp, Briefcase, CircleDollarSign, UserRound, PanelLeft, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileLabel } from "@/domain/auth/auth.helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  useSidebar,
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
  { label: "Prontas para oferta", href: ROUTES.admin.offers.ready, icon: CircleDollarSign },
  { label: "Ofertas", href: ROUTES.admin.offers.list, icon: Briefcase },
  { label: "Investimentos", href: ROUTES.admin.investments, icon: TrendingUp },
  { label: "Validações", href: ROUTES.admin.validations, icon: ShieldCheck },
  { label: "Recebíveis", href: ROUTES.admin.receivables, icon: ListChecks },
  { label: "Transações internas", href: ROUTES.admin.transactions, icon: Database },
];

const investorNav: NavItem[] = [
  { label: "Home", href: ROUTES.investor.home, icon: LayoutDashboard },
  { label: "Oportunidades", href: ROUTES.investor.opportunities, icon: TrendingUp },
  { label: "Meus investimentos", href: ROUTES.investor.investments, icon: Briefcase },
  { label: "Meus dados", href: ROUTES.investor.account, icon: UserRound },
];

const profileConfig = {
  seller: { nav: sellerNav, label: "Cedente", color: "text-primary" },
  admin: { nav: adminNav, label: "Admin", color: "text-chart-4" },
  riskAnalyst: { nav: analystNav, label: "Analista", color: "text-chart-2" },
  investor: { nav: investorNav, label: "Investidor", color: "text-chart-1" },
};

function SidebarToggleItem() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={toggleSidebar}
        tooltip={isCollapsed ? "Expandir menu" : "Recolher menu"}
        className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      >
        <PanelLeft className="size-4 shrink-0" />
        <span className="truncate">{isCollapsed ? "Expandir" : "Recolher menu"}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { user, selectedProfile, logout } = useAuth();
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
              <SidebarToggleItem />
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
        <div className="flex flex-col gap-2 p-2 border-t border-sidebar-border/40">
          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground shrink-0">
                <UserIcon className="size-4 opacity-80" />
              </div>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name || "Usuário"}</span>
                {selectedProfile && (
                  <Badge
                    variant="secondary"
                    className="w-fit text-[10px] py-0 px-1.5 h-4 border-white/15 bg-white/10 text-white font-normal truncate"
                  >
                    {getProfileLabel(selectedProfile)}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7 shrink-0 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
              onClick={() => logout({ reason: "manual" })}
              title="Sair"
            >
              <LogOut className="size-4 shrink-0" />
            </Button>
          </div>
        </div>
        <div className="px-2 py-0.5 text-[10px] text-sidebar-foreground/40 truncate group-data-[collapsible=icon]:hidden">
          Dupply MVP
        </div>
      </SidebarFooter>

      <SidebarRail />
    </ShadcnSidebar>
  );
}

export { SidebarProvider, SidebarTrigger };

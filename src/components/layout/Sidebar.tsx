import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileCheck as FileCheck2, FilePlus, Store, Briefcase, ShieldCheck, ListChecks, FileText, Database, ChevronRight } from "lucide-react";
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
  { label: "Recebíveis", href: ROUTES.seller.receivables.list, icon: FileText },
  { label: "Cadastrar recebível", href: ROUTES.seller.receivables.new, icon: FilePlus },
];

const investorNav: NavItem[] = [
  { label: "Painel", href: ROUTES.investor.dashboard, icon: LayoutDashboard },
  { label: "Marketplace", href: ROUTES.investor.marketplace.list, icon: Store },
  { label: "Minhas posições", href: ROUTES.investor.positions, icon: Briefcase },
];

const adminNav: NavItem[] = [
  { label: "Painel", href: ROUTES.admin.dashboard, icon: LayoutDashboard },
  { label: "Validações", href: ROUTES.admin.validations, icon: ShieldCheck },
  { label: "Recebíveis", href: ROUTES.admin.receivables, icon: ListChecks },
  { label: "Transações internas", href: ROUTES.admin.transactions, icon: Database },
];

const profileConfig = {
  seller: { nav: sellerNav, label: "Cedente", color: "text-primary" },
  investor: { nav: investorNav, label: "Investidor", color: "text-chart-2" },
  admin: { nav: adminNav, label: "Admin", color: "text-chart-4" },
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

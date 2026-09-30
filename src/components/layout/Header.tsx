import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHeader } from "@/contexts/HeaderContext";
import { cn } from "@/lib/utils";
import {
  DUPPLY_TOPBAR_HEADER,
  DUPPLY_TOPBAR_ROW_APP,
  DUPPLY_TOPBAR_SIDEBAR_TRIGGER,
} from "./dupplyTopbar.styles";

export function Header() {
  const { headerContent } = useHeader();

  return (
    <header className={DUPPLY_TOPBAR_HEADER}>
      <div className={DUPPLY_TOPBAR_ROW_APP}>
        <SidebarTrigger className={cn("shrink-0 md:hidden", DUPPLY_TOPBAR_SIDEBAR_TRIGGER)} />
        <div className="min-w-0 flex-1 flex items-center gap-3">
          {headerContent}
        </div>
      </div>
    </header>
  );
}

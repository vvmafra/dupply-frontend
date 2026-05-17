/**
 * Visual único da topbar Dupply (páginas públicas + área autenticada).
 * Usa `--dupply-brand-navy` definido em `index.css` para alinhar com o fundo global no escuro.
 */
export const DUPPLY_TOPBAR_HEADER =
  "sticky top-0 z-40 border-b border-white/10 bg-[color-mix(in_srgb,var(--dupply-brand-navy)_88%,transparent)] text-[#F4F7FB] backdrop-blur-sm supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--dupply-brand-navy)_72%,transparent)]";

export const DUPPLY_TOPBAR_ROW_PUBLIC =
  "container mx-auto flex h-16 w-full max-w-[100vw] items-center justify-between gap-3 px-4 md:px-6";

export const DUPPLY_TOPBAR_ROW_APP =
  "flex h-16 w-full items-center gap-3 px-4 md:px-6";

export const DUPPLY_TOPBAR_LOGO_TEXT =
  "text-xl font-bold tracking-wide uppercase text-white";

export const DUPPLY_TOPBAR_GHOST_LINK =
  "text-[#F4F7FB] hover:bg-white/10 hover:text-white";

export const DUPPLY_TOPBAR_PRIMARY_CTA =
  "border-0 bg-[#2F6BFF] text-white shadow-[0_0_20px_rgba(47,107,255,0.35)] hover:bg-[#2F6BFF]/90";

/** Botão de tema legível sobre o fundo navy */
export const DUPPLY_TOPBAR_MODE_TOGGLE =
  "border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white [&_svg]:text-white";

export const DUPPLY_TOPBAR_SIDEBAR_TRIGGER =
  "text-white hover:bg-white/10 hover:text-white";

/** Shell das páginas públicas: fundo navy + tipografia (header em `PublicShell`). */
export const DUPPLY_PUBLIC_PAGE_ROOT =
  "flex min-h-svh flex-col bg-[var(--dupply-brand-navy)] font-[Inter,system-ui,sans-serif] text-[#F4F7FB] antialiased selection:bg-[#2F6BFF]/40";

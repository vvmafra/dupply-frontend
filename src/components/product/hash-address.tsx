import type { ComponentProps } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type HashAddressProps = Omit<ComponentProps<"span">, "children"> & {
  value: string;
  /** Caracteres mantidos em cada ponta. */
  chars?: number;
  /** Link para explorer. */
  href?: string;
  /** Mostra botão de copiar (padrão: sim). */
  copy?: boolean;
  /** Não abrevia. */
  full?: boolean;
};

function shorten(value: string, chars: number) {
  if (value.length <= chars * 2 + 3) return value;
  return `${value.slice(0, chars)}…${value.slice(-chars)}`;
}

/**
 * Hash, endereço on-chain ou ID técnico: mono, abreviado, com copiar e link.
 *   <HashAddress value={tx.hash} href={`https://stellar.expert/tx/${tx.hash}`} />
 */
export function HashAddress({ value, chars = 6, href, copy = true, full, className, ...props }: HashAddressProps) {
  const [copied, setCopied] = useState(false);
  const text = full ? value : shorten(value, chars);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copiado");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  return (
    <span data-slot="hash-address" className={cn("inline-flex items-center gap-0.5 font-mono text-xs text-foreground", className)} {...props}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate">{text}</span>
          </TooltipTrigger>
          {!full ? <TooltipContent className="font-mono text-xs">{value}</TooltipContent> : null}
        </Tooltip>
      </TooltipProvider>
      {copy ? (
        <Button type="button" variant="ghost" size="icon-xs" className="text-muted-foreground" aria-label="Copiar" onClick={onCopy}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      ) : null}
      {href ? (
        <Button asChild variant="ghost" size="icon-xs" className="text-muted-foreground" aria-label="Abrir no explorador">
          <a href={href} target="_blank" rel="noreferrer">
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      ) : null}
    </span>
  );
}

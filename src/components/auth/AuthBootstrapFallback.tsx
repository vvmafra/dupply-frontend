import { Spinner } from "@/components/ui/spinner";

export function AuthBootstrapFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="size-8 text-muted-foreground" />
    </div>
  );
}

import * as Dialog from "@radix-ui/react-dialog";
import { BadgeCheck, ChevronLeft, Loader2, X } from "lucide-react";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useNavigate } from "react-router";

export function Sheet({
  open, onOpenChange, title, description, children, footer, tall,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; tall?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-[rise_.2s_ease-out]" />
        <Dialog.Content
          className={clsx(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-lg flex-col rounded-t-3xl border border-line bg-surface text-fg shadow-2xl outline-none",
            "data-[state=open]:animate-[rise_.28s_cubic-bezier(.2,.8,.2,1)] md:bottom-6 md:rounded-3xl",
            tall ? "h-[82dvh]" : "max-h-[85dvh]",
          )}
          aria-describedby={description ? undefined : undefined}
        >
          <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line md:hidden" aria-hidden />
          <div className="flex items-start justify-between gap-3 px-5 pt-3 pb-2">
            <div className="min-w-0">
              <Dialog.Title className="font-display text-lg font-bold">{title}</Dialog.Title>
              {description ? <Dialog.Description className="text-sm text-muted">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="-mr-1 rounded-full p-2 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Close">
              <X size={20} />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
          {footer ? <div className="border-t border-line px-4 py-3 pb-safe">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export function Button({
  variant = "primary", size = "md", loading, className, children, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg"; loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-8 px-3.5 text-sm",
        size === "md" && "h-11 px-5 text-[15px]",
        size === "lg" && "h-13 px-6 text-base",
        variant === "primary" && "bg-accent text-accent-ink hover:brightness-105",
        variant === "secondary" && "bg-surface-2 text-fg hover:brightness-110",
        variant === "outline" && "border border-line text-fg hover:bg-surface-2",
        variant === "ghost" && "text-fg hover:bg-surface-2",
        variant === "danger" && "bg-coral text-navy hover:brightness-105",
        className,
      )}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : null}
      {children}
    </button>
  );
}

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return src ? (
    <img src={src} alt="" width={size} height={size} className={clsx("shrink-0 rounded-full object-cover", className)} style={{ width: size, height: size }} />
  ) : (
    <span
      aria-hidden
      className={clsx("inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white", className)}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, hsl(${hue} 55% 45%), hsl(${(hue + 40) % 360} 60% 35%))` }}
    >
      {initials || "?"}
    </span>
  );
}

export function PublisherLogo({ text, color, size = 40, className }: { text: string; color: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx("inline-flex shrink-0 items-center justify-center rounded-xl font-display font-extrabold tracking-tight text-navy", className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: color }}
    >
      {text}
    </span>
  );
}

export function Verified({ className }: { className?: string }) {
  return (
    <BadgeCheck className={clsx("inline shrink-0 text-accent", className)} size={16} aria-label="Verified publisher" role="img" />
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={clsx("inline-flex items-center rounded-md border border-current/30 px-1.5 py-px text-[10px] font-bold tracking-wider uppercase opacity-80", className)}
      title="Fictional demonstration content. Not real news."
    >
      Demo
    </span>
  );
}

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">{label}</span>
        {description ? <span className="block text-sm text-muted">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={clsx("relative h-7 w-12 shrink-0 rounded-full transition", checked ? "bg-accent" : "bg-line")}
      >
        <span className={clsx("absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition", checked && "translate-x-5")} />
      </button>
    </label>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx("animate-spin text-muted", className)} size={24} aria-label="Loading" />;
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon ? <div className="mb-4 rounded-2xl bg-surface-2 p-4 text-accent-text">{icon}</div> : null}
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {body ? <p className="mt-1 max-w-sm text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <EmptyState
      title="Couldn't load this"
      body={error instanceof Error ? error.message : "Something went wrong."}
      action={retry ? <Button variant="secondary" onClick={retry}>Try again</Button> : undefined}
    />
  );
}

export function PageHeader({ title, back = true, right }: { title: ReactNode; back?: boolean; right?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-bg/90 px-2 backdrop-blur">
      {back ? (
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          className="rounded-full p-2 hover:bg-surface-2"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>
      ) : <span className="w-2" />}
      <h1 className="min-w-0 flex-1 truncate font-display text-lg font-bold">{title}</h1>
      {right}
    </header>
  );
}

export function Chip({ active, onClick, children, className }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition",
        active ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-fg hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-coral-text" role="alert">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] text-fg placeholder:text-muted/70 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";

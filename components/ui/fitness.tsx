import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import ProfileMenu from "@/components/profile-menu";

export type ProfileUser = { name: string; email: string };

export function PageHeader({ title, description, eyebrow, user, children }: {
  title: string; description: string; eyebrow: string; user: ProfileUser; children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dfe5da] pb-6">
      <div className="min-w-0 flex-1">
        <p className="eyebrow mb-2.5">FIT-MESS AI <span className="mx-2 text-[#b8c3b2]">/</span> {eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-[-0.045em] sm:text-3xl xl:text-[34px]">{title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#778078]">{description}</p>
      </div>
      <div className="flex items-center gap-3">{children}<ProfileMenu user={user} /></div>
    </header>
  );
}

const accents = {
  green: "bg-[#edf4e1] text-[#638533]", blue: "bg-[#edf4fa] text-[#4d8fb6]",
  orange: "bg-[#fff1e6] text-[#d58a50]", purple: "bg-[#f1edfb] text-[#9180bd]",
};

export function StatCard({ label, value, detail, icon: Icon, tone = "green", progress, children }: {
  label: string; value: ReactNode; detail: string; icon: LucideIcon;
  tone?: keyof typeof accents; progress?: number; children?: ReactNode;
}) {
  return (
    <div className="surface p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-[#778078]">{label}</p><span className={"icon-tile " + accents[tone]}><Icon size={20} strokeWidth={1.7} aria-hidden="true" /></span></div>
      <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-[28px]">{value}</p>
      <p className="mt-1.5 text-xs text-[#8b9389]">{detail}</p>
      {progress !== undefined && <div role="progressbar" aria-label={label} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eef1e9]"><div className="h-full rounded-full bg-[#8db35c] transition-all duration-500" style={{ width: Math.min(100, Math.max(0, progress)) + "%" }} /></div>}
      {children}
    </div>
  );
}

export function SectionHeading({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6"><div><h2 className="text-base font-semibold tracking-tight">{title}</h2>{subtitle && <p className="mt-1 text-xs leading-relaxed text-[#8b9389]">{subtitle}</p>}</div>{children}</div>;
}

export function ProgressRing({ value, label, dark = false }: { value: number; label: string; dark?: boolean }) {
  return <div className="relative h-36 w-36 shrink-0 sm:h-40 sm:w-40" role="img" aria-label={label + ": " + value + "%"}>
    <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true"><circle cx="60" cy="60" r="51" fill="none" stroke={dark ? "#ffffff18" : "#e8eedf"} strokeWidth="7" /><circle cx="60" cy="60" r="51" fill="none" stroke={dark ? "#d0f268" : "#6e9344"} strokeWidth="7" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - value} /></svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-semibold tracking-tight">{value}<span className="text-base opacity-60">%</span></span><span className="mt-1 text-[10px] uppercase tracking-wider opacity-60">{label}</span></div>
  </div>;
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowUpRight, ChartNoAxesCombined, ClipboardList, Dumbbell, LayoutDashboard, Leaf, Sparkles, Utensils } from "lucide-react";

const navigationItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Daily routine", icon: ClipboardList, href: "/Routine" },
  { label: "Workouts", icon: Dumbbell, href: "/workouts" },
  { label: "Nutrition", icon: Utensils, href: "/nutrition" },
];
const upcomingItems = [
  { label: "Progress", icon: ChartNoAxesCombined },
  { label: "AI coach", icon: Sparkles },
];

function Brand() {
  return <Link href="/dashboard" className="flex items-center gap-3">
    <Image src="/fit-mess%20logo.jpeg" width={42} height={42} alt="" className="rounded-xl object-cover" />
    <span className="text-lg font-semibold tracking-tight">Fit-Mess<span className="ml-1 text-[#d0f268]">AI</span><span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.22em] text-[#92ac9c]">Your everyday, upgraded</span></span>
  </Link>;
}

export default function Navigation() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup") return null;

  return <div className="shrink-0 lg:w-60 xl:w-64">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col overflow-y-auto bg-[#112f25] px-5 py-8 text-white lg:flex xl:w-64">
      <div className="px-1"><Brand /></div>
      <p className="mt-12 px-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#71907d]">Your workspace</p>
      <nav className="mt-4 space-y-2" aria-label="Main navigation">
        {navigationItems.map(({ label, icon: Icon, href }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={"flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition " + (pathname === href ? "bg-[#d0f268] text-[#153b2e] shadow-[0_4px_20px_#00000010]" : "text-[#a4b9ab] hover:bg-white/5 hover:text-white")}><Icon size={19} strokeWidth={1.7} />{label}{pathname === href && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#153b2e]" />}</Link>)}
      </nav>
      <div className="mx-4 my-6 h-px bg-white/10" />
      <p className="mb-3 px-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#71907d]">Coming next</p>
      <div className="space-y-1">{upcomingItems.map(({ label, icon: Icon }) => <div key={label} className="flex items-center gap-3 px-4 py-3 text-sm text-[#789782]"><Icon size={18} strokeWidth={1.6} />{label}<span className="ml-auto text-[8px] uppercase tracking-wider text-[#65816f]">Soon</span></div>)}</div>
      <div className="mt-auto pt-12">
        <div className="hero-pattern rounded-2xl border border-white/10 bg-[#1a3d2d] p-4">
          <Leaf size={22} className="text-[#d0f268]" />
          <p className="mt-4 text-sm font-medium leading-relaxed">A little better.<br />Every single day.</p>
          <Link href="/Routine" className="mt-4 flex items-center justify-between text-xs text-[#c1d8a9]">Build your rhythm<ArrowUpRight size={15} /></Link>
        </div>
        <div className="mt-6 flex items-center gap-2 px-2 text-[10px] text-[#789782]"><Activity size={13} /> Made for your momentum.</div>
      </div>
    </aside>
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between bg-[#112f25] px-4 text-white shadow-sm lg:hidden"><Brand /><span className="rounded-full border border-white/15 px-2.5 py-1 text-[9px] uppercase tracking-widest text-[#aac0af]">Wellness space</span></header>
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-[#dfe5da] bg-white/95 px-2 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_24px_#173b2f08] backdrop-blur-lg lg:hidden">
      {navigationItems.map(({ label, icon: Icon, href }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={"flex min-w-20 flex-col items-center gap-1 rounded-xl px-4 py-2 text-[10px] font-semibold " + (pathname === href ? "bg-[#edf4df] text-[#36552b]" : "text-[#8b9389]")}><Icon size={20} strokeWidth={1.8} />{label}</Link>)}
    </nav>
  </div>;
}

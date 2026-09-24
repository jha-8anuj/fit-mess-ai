import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Footprints, Leaf, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export default function AuthShell({ mode, children }: { mode: "login" | "signup"; children: ReactNode }) {
  return <main className="flex min-h-svh w-full items-center justify-center bg-[#f0f2e9] p-3 sm:p-6 lg:p-8">
    <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white bg-[#fffefb] shadow-[0_24px_90px_-30px_#143a2f40] lg:min-h-[760px] lg:grid-cols-2">
      <section className="auth-art relative isolate hidden flex-col overflow-hidden p-12 text-white lg:flex">
        <Image src="/dashboard/mountains.jpg" alt="" fill sizes="50vw" className="-z-20 object-cover opacity-20" />
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#112f25]/80 via-[#112f25]/50 to-[#112f25]" />
        <Link href="/" className="flex w-fit items-center gap-3"><Image src="/fit-mess%20logo.jpeg" width={42} height={42} alt="" className="rounded-xl" /><span className="text-xl font-semibold tracking-tight">Fit-Mess <span className="text-[#d0f268]">AI</span></span></Link>
        <div className="my-auto py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d0f268]/25 bg-[#d0f268]/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-[#d0f268]"><Sparkles size={12} /> A little better, every day</span>
          <h2 className="mt-7 text-[58px] font-medium leading-[1.05] tracking-[-0.055em]">Find your<br />rhythm.<br /><span className="text-[#d0f268]">Feel your best.</span></h2>
          <p className="mt-6 max-w-xs text-sm leading-7 text-[#adc0b3]">Bring movement, mindful habits and a little motivation into your everyday.</p>
          <div className="mt-9 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#d0f268] text-[#173b2f]"><Footprints size={24} /></span>
            <div><p className="text-sm font-medium">Your next step starts here.</p><p className="mt-1 text-xs text-[#adc0b3]">Make room for a stronger you.</p></div><ArrowUpRight className="ml-auto shrink-0 text-[#d0f268]" size={20} />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#adc0b3]">{["Daily routines", "Mindful movement", "Steady progress"].map((label) => <span key={label} className="flex items-center gap-1.5"><Check size={12} className="text-[#d0f268]" />{label}</span>)}</div>
      </section>
      <section className="flex flex-col px-6 py-8 sm:px-12 sm:py-10 lg:px-14">
        <div className="mb-9 flex items-center justify-between lg:justify-end"><Link href="/" className="flex items-center gap-2 font-bold text-[#153b2e] lg:hidden"><Leaf size={21} />Fit-Mess AI</Link><span className="text-[10px] uppercase tracking-widest text-[#a1a797]">Your wellness space</span></div>
        <div className="my-auto w-full pb-6">
          <div className="mb-9 flex rounded-xl bg-[#eff2e9] p-1">{(["login", "signup"] as const).map((tab) => <Link key={tab} href={"/" + tab} aria-current={tab === mode ? "page" : undefined} className={"flex-1 rounded-lg px-3 py-2.5 text-center text-xs font-semibold transition " + (tab === mode ? "bg-white text-[#153b2e] shadow-sm" : "text-[#8b9389] hover:text-[#153b2e]")}>{tab === "login" ? "Log in" : "Sign up"}</Link>)}</div>
          <p className="eyebrow text-[#6c8744]">{mode === "login" ? "WELCOME BACK" : "A FRESH START"}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-[36px]">{mode === "login" ? "Good to see you again." : "Make time for you."}</h1>
          <p className="mb-8 mt-3 text-sm leading-6 text-[#8b9389]">{mode === "login" ? "Log in and pick up your momentum." : "Create your account. Your healthier everyday starts here."}</p>
          {children}
        </div>
        <p className="mt-7 text-center text-[10px] text-[#a1a797]">Move with purpose. Live with balance.</p>
      </section>
    </div>
  </main>;
}

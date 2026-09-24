"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCheck, Droplets, Dumbbell, Flame, Footprints, Leaf, Pause, Play, Sunrise, Utensils } from "lucide-react";
import { useStepCounter } from "@/components/use-step-counter";
import { PageHeader, ProgressRing, SectionHeading, StatCard, type ProfileUser } from "@/components/ui/fitness";
import { routine, routineCompletedKey, routineDateKey } from "@/app/routine-data";

const meals = [
  { name: "Breakfast", time: "7:30 AM", meal: "Oats, banana & nuts", calories: "450 kcal", image: "/dashboard/breakfast.jpg" },
  { name: "Lunch", time: "1:00 PM", meal: "Rice, chicken & vegetables", calories: "550 kcal", image: "/dashboard/lunch.jpg" },
  { name: "Snack", time: "5:00 PM", meal: "Apple & almonds", calories: "200 kcal", image: "/dashboard/snack.jpg" },
  { name: "Dinner", time: "9:00 PM", meal: "Salad & mixed vegetables", calories: "400 kcal", image: "/dashboard/dinner.jpg" },
];

export default function DashboardClient({ user }: { user: ProfileUser }) {
  const [greeting, setGreeting] = useState("Hello");
  const [todayKey, setTodayKey] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [todayLabel, setTodayLabel] = useState("");
  const [completedRoutine, setCompletedRoutine] = useState<boolean[]>(() => routine.map(() => false));
  const [waterCount, setWaterCount] = useState(0);
  const { stepCount, stepProgress, isTracking, toggleTracking } = useStepCounter(selectedDateKey || undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = new Date();
      const hour = now.getHours();
      setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
      const today = now.toLocaleDateString("en-CA");
      setTodayKey(today);
      setSelectedDateKey(today);
      setTodayLabel(now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedDateKey) return;
    const key = selectedDateKey === todayKey ? routineCompletedKey : routineCompletedKey + "-" + selectedDateKey;
    let saved: unknown = null;
    try {
      if (selectedDateKey !== todayKey || localStorage.getItem(routineDateKey) === todayKey) {
        saved = JSON.parse(localStorage.getItem(key) ?? "null");
      }
    } catch { /* Start with an empty day if stored data is invalid. */ }
    const next = Array.isArray(saved) && saved.length === routine.length ? saved.map(Boolean) : routine.map(() => false);
    const timer = window.setTimeout(() => setCompletedRoutine(next), 0);
    return () => window.clearTimeout(timer);
  }, [selectedDateKey, todayKey]);

  useEffect(() => {
    if (!selectedDateKey) return;
    void fetch(`/api/wellness?date=${encodeURIComponent(selectedDateKey)}`).then((response) => response.ok ? response.json() : null).then((data: { current?: { water?: number; routineCompleted?: boolean[] } } | null) => {
      if (!data?.current) return;
      if (typeof data.current.water === "number") setWaterCount(data.current.water);
      if (Array.isArray(data.current.routineCompleted) && data.current.routineCompleted.length === routine.length) setCompletedRoutine(data.current.routineCompleted.map(Boolean));
    }).catch(() => undefined);
  }, [selectedDateKey]);

  function saveProgress(next: { routineCompleted?: boolean[]; water?: number }) {
    if (!selectedDateKey) return;
    void fetch("/api/wellness", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: selectedDateKey, ...next }) }).catch(() => undefined);
  }

  function toggleRoutine(index: number) {
    if (!selectedDateKey) return;
    const next = [...completedRoutine];
    next[index] = !next[index];
    setCompletedRoutine(next);
    const key = selectedDateKey === todayKey ? routineCompletedKey : routineCompletedKey + "-" + selectedDateKey;
    localStorage.setItem(key, JSON.stringify(next));
    if (selectedDateKey === todayKey) localStorage.setItem(routineDateKey, todayKey);
    const waterTask = routine[index].title.toLowerCase().includes("water");
    if (waterTask) {
      const nextWater = next[index] ? Math.max(1, waterCount) : 0;
      setWaterCount(nextWater);
      saveProgress({ routineCompleted: next, water: nextWater });
    } else saveProgress({ routineCompleted: next });
  }

  function logWater() {
    const nextWater = Math.min(8, waterCount + 1);
    setWaterCount(nextWater);
    saveProgress({ water: nextWater });
  }

  const done = completedRoutine.filter(Boolean).length;
  const progress = Math.round(done / routine.length * 100);
  const calories = done * 60 + Math.round(stepCount * 0.04);
  const nextTask = routine.find((_, index) => !completedRoutine[index]);

  return <main className="app-page">
    <div className="page-container">
      <PageHeader eyebrow="Overview" title={greeting + ", " + user.name.trim().split(/\s+/)[0] + "."} description={todayLabel || "A fresh opportunity to feel your best."} user={user}>
        <label className="hidden items-center gap-2 rounded-xl border border-[#dfe5da] bg-white p-3 text-xs sm:flex"><CalendarDays size={16} className="text-[#6b825a]" /><input aria-label="Select dashboard date" type="date" className="w-28 bg-transparent outline-none" max={todayKey || undefined} value={selectedDateKey} onChange={(event) => setSelectedDateKey(event.target.value)} /></label>
      </PageHeader>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <section className="hero-pattern relative overflow-hidden rounded-3xl bg-[#153b2e] p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-sm">
              <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#d0f268]"><Sunrise size={14} /> YOUR EVERYDAY, UPGRADED</span>
              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-[38px]">Small steps.<br /><span className="text-[#d0f268]">Stronger days.</span></h2>
              <p className="mt-3 max-w-xs text-xs leading-6 text-[#b1c5b8]">{done === routine.length ? "You showed up for every habit. Take a moment to enjoy that." : "You have " + (routine.length - done) + " habits left on your plan. One at a time, you've got this."}</p>
              <Link href="/Routine" className="mt-5 inline-flex items-center gap-3 rounded-xl bg-[#d0f268] px-4 py-3 text-xs font-semibold text-[#153b2e] transition hover:bg-[#dff791]">View my routine<ArrowUpRight size={16} /></Link>
            </div>
            <div className="mx-auto sm:mx-0"><ProgressRing value={progress} label="Daily rhythm" dark /></div>
          </div>
        </section>
        <section className="surface flex flex-col justify-between bg-[#eef2e4] p-6 sm:p-7">
          <div className="flex items-center justify-between"><span className="eyebrow">Your next little win</span><span className="icon-tile bg-white text-[#779348]"><Leaf size={21} /></span></div>
          <div className="my-5"><p className="text-[27px] font-semibold tracking-tight">{nextTask?.title ?? "All done for today"}</p><p className="mt-2 text-sm text-[#859177]">{nextTask ? nextTask.time + " · " + nextTask.description : "Give yourself a little credit. You earned it."}</p></div>
          <Link href="/Routine" className="flex items-center justify-between border-t border-[#dce4cf] pt-4 text-xs font-semibold text-[#526b3b]">Keep your momentum<ArrowRight size={17} /></Link>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 sm:gap-5">
        <StatCard label="Habits completed" value={done + " / " + routine.length} detail="Every small win counts" icon={CheckCheck} progress={progress} />
        <StatCard label="Steps taken" value={stepCount.toLocaleString()} detail="Your goal · 10,000 steps" icon={Footprints} tone="orange" progress={stepProgress} />
        <StatCard label="Movement energy" value={<>{calories}<span className="ml-1 text-sm font-normal text-[#8b9389]">kcal</span></>} detail="Estimated from your activity" icon={Flame} tone="purple" progress={Math.min(100, Math.round(calories / 2000 * 100))} />
        <StatCard label="Hydration goal" value={<>{waterCount}<span className="ml-1 text-sm font-normal text-[#8b9389]">/ 8 glasses</span></>} detail={waterCount ? "Nice — keep sipping through the day" : "A reminder to pause & hydrate"} icon={Droplets} tone="blue" progress={waterCount / 8 * 100}><button type="button" onClick={logWater} className="mt-3 text-[11px] font-semibold text-[#4d8fb6] hover:underline">+ Log one glass</button></StatCard>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1.25fr_1fr]">
        <section className="surface overflow-hidden">
          <SectionHeading title="Your daily rhythm" subtitle="A little structure. A lot of possibility."><Link href="/Routine" className="text-link">Full routine<ArrowUpRight size={15} /></Link></SectionHeading>
          <div className="border-t border-[#eef1e9] px-5 sm:px-6">
            {routine.map((item, index) => <label key={item.title} className="group flex cursor-pointer items-center gap-3 border-b border-[#eef1e9] py-3.5 last:border-0">
              <input type="checkbox" checked={completedRoutine[index]} onChange={() => toggleRoutine(index)} disabled={!selectedDateKey} className="peer sr-only" />
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#d9e2d2] text-transparent transition peer-checked:border-[#769b48] peer-checked:bg-[#769b48] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#769b48] peer-focus-visible:ring-offset-2"><Check size={14} /></span>
              <span className="w-16 shrink-0 text-[11px] font-medium tabular-nums text-[#9ca590]">{item.time}</span>
              <span className="min-w-0 flex-1"><span className={"block text-xs font-semibold sm:text-sm " + (completedRoutine[index] ? "text-[#9aa48f] line-through" : "text-[#314635]")}>{item.title}</span><span className="mt-0.5 block truncate text-[11px] text-[#98a18e]">{item.description}</span></span>
              {completedRoutine[index] && <span className="hidden text-[9px] uppercase tracking-wider text-[#769b48] sm:block">Done</span>}
            </label>)}
          </div>
        </section>

        <div className="space-y-5">
          <section className="surface overflow-hidden">
            <SectionHeading title="Fuel your day" subtitle="A balanced sample meal plan"><Utensils size={18} className="text-[#9dac88]" /></SectionHeading>
            <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:px-6 sm:pb-6">{meals.map((meal) => <article key={meal.name} className="group overflow-hidden rounded-2xl border border-[#edf0e7]">
              <div className="relative h-28 overflow-hidden sm:h-32"><Image src={meal.image} alt={meal.meal} fill sizes="(max-width: 640px) 40vw, 240px" className="object-cover transition duration-500 group-hover:scale-105" /><span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-semibold text-[#4e6045] backdrop-blur-sm">{meal.calories}</span></div>
              <div className="p-3"><div className="flex flex-wrap items-center justify-between gap-1"><h3 className="text-xs font-semibold">{meal.name}</h3><span className="text-[9px] text-[#9ca590]">{meal.time}</span></div><p className="mt-1 text-[11px] leading-5 text-[#8b9389]">{meal.meal}</p></div>
            </article>)}</div>
          </section>
          <section className="surface p-5 sm:p-6">
            <div className="flex items-center gap-3"><span className="icon-tile bg-[#f0f3e8] text-[#7c994c]"><Footprints size={21} /></span><div><h2 className="text-sm font-semibold">Keep moving</h2><p className="mt-1 text-xs text-[#8b9389]">{isTracking ? "Step tracking is active" : "Step tracking is paused"}</p></div><span className={"ml-auto h-2 w-2 rounded-full " + (isTracking ? "bg-[#93b95d]" : "bg-[#bdc4b5]")} /></div>
            <button type="button" onClick={toggleTracking} className="action-secondary mt-4 w-full">{isTracking ? <Pause size={14} /> : <Play size={14} />}{isTracking ? "Pause tracking" : "Start tracking"}</button>
          </section>
          <Link href="/workouts" className="group flex items-center gap-4 rounded-3xl bg-[#e6ecda] p-5 sm:p-6"><span className="icon-tile bg-white text-[#5b783a]"><Dumbbell size={22} /></span><div><p className="text-sm font-semibold">Make room for movement.</p><p className="mt-1 text-xs text-[#7f8e70]">Explore your weekly workout plan</p></div><ArrowUpRight size={21} className="ml-auto shrink-0 text-[#5b783a] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
        </div>
      </div>
      <p className="flex items-center justify-center gap-2 pb-2 text-[10px] text-[#a6ad9c]"><Leaf size={12} /> Progress is a practice, not a finish line.</p>
    </div>
  </main>;
}

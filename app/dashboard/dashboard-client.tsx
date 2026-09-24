"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCheck, Droplets, Dumbbell, Flame, Footprints, Leaf, Pause, Play, Scale, Sunrise, Utensils, X } from "lucide-react";
import { useStepCounter } from "@/components/use-step-counter";
import { PageHeader, ProgressRing, SectionHeading, StatCard, type ProfileUser } from "@/components/ui/fitness";
import { routine, routineAskedKey, routineCompletedKey, routineDateKey } from "@/app/routine-data";

const meals = [
  { name: "Breakfast", time: "7:30 AM", meal: "Oats, banana & nuts", calories: "450 kcal", image: "/dashboard/breakfast-oats.jpg" },
  { name: "Lunch", time: "1:00 PM", meal: "Rice, chicken & vegetables", calories: "550 kcal", image: "/dashboard/lunch.jpg" },
  { name: "Snack", time: "5:00 PM", meal: "Apple & almonds", calories: "200 kcal", image: "/dashboard/snack-apple-almonds.jpg" },
  { name: "Dinner", time: "9:00 PM", meal: "Salad & mixed vegetables", calories: "400 kcal", image: "/dashboard/dinner.jpg" },
];

export default function DashboardClient({ user }: { user: ProfileUser }) {
  const [greeting, setGreeting] = useState("Hello");
  const [todayKey, setTodayKey] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [todayLabel, setTodayLabel] = useState("");
  const [completedRoutine, setCompletedRoutine] = useState<boolean[]>(() => routine.map(() => false));
  const [waterCount, setWaterCount] = useState(0);
  const [pendingTaskIndex, setPendingTaskIndex] = useState<number | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [showWeightPrompt, setShowWeightPrompt] = useState(false);
  const { stepCount, stepProgress, isTracking, toggleTracking } = useStepCounter(selectedDateKey || undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = new Date();
      const hour = now.getHours();
      setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
      const today = now.toLocaleDateString("en-CA");
      if (localStorage.getItem(routineDateKey) !== today) {
        localStorage.setItem(routineDateKey, today);
        localStorage.setItem(routineCompletedKey, JSON.stringify(routine.map(() => false)));
        localStorage.setItem(routineAskedKey, JSON.stringify([]));
      }
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

  useEffect(() => {
    void fetch("/api/profile").then((response) => response.ok ? response.json() : null).then((data: { weightKg?: number | null } | null) => {
      if (typeof data?.weightKg === "number") setWeightKg(data.weightKg);
      else setShowWeightPrompt(true);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selectedDateKey || selectedDateKey !== todayKey) return;
    const checkDueTask = () => {
      const now = new Date();
      const asked = JSON.parse(localStorage.getItem(routineAskedKey) ?? "[]") as number[];
      const nextIndex = routine.findIndex((item, index) => !completedRoutine[index] && !asked.includes(index) && now >= getRoutineTime(item.endTime));
      if (nextIndex !== -1) setPendingTaskIndex((current) => current ?? nextIndex);
    };
    checkDueTask();
    const timer = window.setInterval(checkDueTask, 30_000);
    return () => window.clearInterval(timer);
  }, [completedRoutine, selectedDateKey, todayKey]);

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

  function answerRoutineReminder(didComplete: boolean) {
    if (pendingTaskIndex === null) return;
    const index = pendingTaskIndex;
    setPendingTaskIndex(null);
    const asked = JSON.parse(localStorage.getItem(routineAskedKey) ?? "[]") as number[];
    localStorage.setItem(routineAskedKey, JSON.stringify([...new Set([...asked, index])]));
    if (completedRoutine[index] === didComplete) return;
    const next = [...completedRoutine];
    next[index] = didComplete;
    setCompletedRoutine(next);
    const key = selectedDateKey === todayKey ? routineCompletedKey : routineCompletedKey + "-" + selectedDateKey;
    localStorage.setItem(key, JSON.stringify(next));
    if (selectedDateKey === todayKey) localStorage.setItem(routineDateKey, todayKey);
    const isWater = routine[index].title.toLowerCase().includes("water");
    if (isWater) { const nextWater = didComplete ? Math.max(1, waterCount) : 0; setWaterCount(nextWater); saveProgress({ routineCompleted: next, water: nextWater }); }
    else saveProgress({ routineCompleted: next });
  }

  function saveWeight(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(weightInput);
    if (!Number.isFinite(value) || value < 20 || value > 300) return;
    void fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weightKg: value }) }).then((response) => response.ok ? response.json() : null).then((data: { weightKg?: number } | null) => { if (typeof data?.weightKg === "number") { setWeightKg(data.weightKg); setShowWeightPrompt(false); } }).catch(() => undefined);
  }

  const done = completedRoutine.filter(Boolean).length;
  const progress = Math.round(done / routine.length * 100);
  const calories = done * 60 + Math.round(stepCount * 0.04);
  const proteinTarget = weightKg ? Math.round(weightKg * 1.6) : null;
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

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5 sm:gap-5">
        <StatCard label="Habits completed" value={done + " / " + routine.length} detail="Every small win counts" icon={CheckCheck} progress={progress} />
        <StatCard label="Steps taken" value={stepCount.toLocaleString()} detail="Your goal · 10,000 steps" icon={Footprints} tone="orange" progress={stepProgress} />
        <StatCard label="Movement energy" value={<>{calories}<span className="ml-1 text-sm font-normal text-[#8b9389]">kcal</span></>} detail="Estimated from your activity" icon={Flame} tone="purple" progress={Math.min(100, Math.round(calories / 2000 * 100))} />
        <StatCard label="Protein target" value={proteinTarget ? <>{proteinTarget}<span className="ml-1 text-sm font-normal text-[#8b9389]">g</span></> : "Set weight"} detail={weightKg ? "Based on 1.6g per kg" : "Tell us your weight"} icon={Scale} tone="orange"><button type="button" onClick={() => setShowWeightPrompt(true)} className="mt-3 text-[11px] font-semibold text-[#d58a50] hover:underline">{weightKg ? "Update weight" : "Add weight"}</button></StatCard>
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
            <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:gap-4 sm:px-6 sm:pb-6">{meals.map((meal) => <article key={meal.name} className="group overflow-hidden rounded-2xl border border-[#edf0e7] bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#dce7ce] hover:shadow-[0_10px_24px_#153b2e0d]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f0f3e9]"><Image src={meal.image} alt={meal.meal} fill unoptimized sizes="(max-width: 640px) 42vw, 230px" className="object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#153b2e70] to-transparent" /><span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-semibold text-[#4e6045] shadow-sm backdrop-blur-sm">{meal.calories}</span></div>
              <div className="p-3 sm:p-3.5"><div className="flex flex-wrap items-center justify-between gap-1"><h3 className="text-xs font-semibold">{meal.name}</h3><span className="text-[9px] text-[#9ca590]">{meal.time}</span></div><p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#8b9389]">{meal.meal}</p></div>
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
    {pendingTaskIndex !== null && <div role="alert" className="fixed inset-x-4 bottom-24 z-50 ml-auto max-w-sm rounded-2xl border border-[#dce5d0] bg-white p-5 shadow-[0_12px_48px_#153b2e25] lg:bottom-6 lg:right-6"><p className="eyebrow flex items-center gap-2 text-[#769347]"><Sunrise size={13} /> Gentle check-in</p><p className="mt-2 text-sm font-semibold">Did you finish {routine[pendingTaskIndex].title.toLowerCase()}?</p><p className="mt-1 text-xs text-[#8b9389]">Your answer keeps today&apos;s progress accurate.</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => answerRoutineReminder(true)} className="action-primary flex-1">Yes, done<Check size={15} /></button><button type="button" onClick={() => answerRoutineReminder(false)} className="action-secondary flex-1">Not yet</button></div></div>}
    {showWeightPrompt && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#153b2e66] p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="surface w-full max-w-md p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><span className="icon-tile bg-[#fff1e6] text-[#d58a50]"><Scale size={20} /></span><h2 className="mt-4 text-xl font-semibold">Personalise your nutrition</h2><p className="mt-2 text-sm leading-6 text-[#778078]">Your weight helps us set a simple daily protein target.</p></div>{weightKg && <button type="button" aria-label="Close" onClick={() => setShowWeightPrompt(false)} className="rounded-lg p-2 text-[#8b9389] hover:bg-[#f2f5ec]"><X size={18} /></button>}</div><form onSubmit={saveWeight} className="mt-6"><label htmlFor="dashboard-weight" className="text-xs font-semibold text-[#52604e]">Your weight (kg)</label><div className="mt-2 flex gap-2"><input id="dashboard-weight" type="number" min="20" max="300" step="0.1" required value={weightInput} onChange={(event) => setWeightInput(event.target.value)} placeholder={weightKg ? String(weightKg) : "e.g. 68"} className="min-w-0 flex-1 rounded-xl border border-[#dfe7d7] bg-[#fbfcf8] px-4 py-3 text-sm outline-none focus:border-[#8baa65]" /><button type="submit" className="action-primary px-5">Save</button></div><p className="mt-3 text-[11px] text-[#9aa590]">Recommended target: about {weightInput && Number(weightInput) >= 20 ? Math.round(Number(weightInput) * 1.6) : proteinTarget ?? "—"}g protein/day.</p></form></div></div>}
  </main>;
}

function getRoutineTime(time: string) {
  const [clock, period] = time.split(" ");
  const [hours, minutes] = clock.split(":").map(Number);
  let hour = hours;
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  const taskTime = new Date();
  taskTime.setHours(hour, minutes, 0, 0);
  return taskTime;
}

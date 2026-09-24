"use client";
/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Apple, ArrowUpRight, Bed, BookOpen, Check, CheckCheck, Clock, Droplets, Dumbbell, Footprints, Leaf, Moon, Pause, Play, Sparkles } from "lucide-react";
import { useStepCounter } from "@/components/use-step-counter";
import { PageHeader, ProgressRing, SectionHeading, StatCard, type ProfileUser } from "@/components/ui/fitness";
import { routine, routineAskedKey, routineCompletedKey, routineDateKey } from "@/app/routine-data";

const routineIcons = { bed: Bed, water: Droplets, meal: Apple, book: BookOpen, walk: Footprints, workout: Dumbbell, sleep: Moon };

const motivationQuotes = [
  "Discipline today leads to a stronger tomorrow.",
  "Small steps every day create lasting change.",
  "Your only limit is the one you set yourself.",
  "Progress, not perfection, is the goal.",
  "A healthy habit today is a stronger you tomorrow.",
  "Keep going. Every effort counts.",
];

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

export default function RoutineClient({ user }: { user: ProfileUser }) {
  const [filter, setFilter] = useState("All habits");
  const { stepCount, stepProgress, isTracking, toggleTracking } = useStepCounter();
  const [todayLabel, setTodayLabel] = useState("");
  const [motivationQuote, setMotivationQuote] = useState("");
  const [completed, setCompleted] = useState<boolean[]>(
    () => routine.map((item) => item.completed)
  );
  const [pendingTaskIndex, setPendingTaskIndex] = useState<number | null>(null);
  const [waterCount, setWaterCount] = useState(0);

  function persistRoutine(next: boolean[]) {
    const waterIndex = routine.findIndex((item) => item.title.toLowerCase().includes("water"));
    void fetch("/api/wellness", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: new Date().toLocaleDateString("en-CA"), routineCompleted: next, water: waterIndex >= 0 && next[waterIndex] ? 1 : 0 }) }).catch(() => undefined);
  }

  useEffect(() => {
    const dayNumber = Math.floor(Date.now() / 86_400_000);
    const today = new Date().toLocaleDateString("en-CA");
    const savedDate = localStorage.getItem(routineDateKey);
    let savedCompleted: unknown = null;

    if (savedDate !== today) {
      localStorage.setItem(routineDateKey, today);
      localStorage.setItem(routineCompletedKey, JSON.stringify(routine.map(() => false)));
      localStorage.setItem(routineAskedKey, JSON.stringify([]));
    } else {
      savedCompleted = JSON.parse(
        localStorage.getItem(routineCompletedKey) ?? "null"
      );
    }

    const initializeTimer = window.setTimeout(() => {
      setTodayLabel(
        new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }).format(new Date())
      );
      setMotivationQuote(motivationQuotes[dayNumber % motivationQuotes.length]);
      if (Array.isArray(savedCompleted) && savedCompleted.length === routine.length) {
        setCompleted(savedCompleted);
      }
    }, 0);

    return () => window.clearTimeout(initializeTimer);
  }, []);

  useEffect(() => {
    void fetch(`/api/wellness?date=${encodeURIComponent(new Date().toLocaleDateString("en-CA"))}`).then((response) => response.ok ? response.json() : null).then((data: { current?: { water?: number; routineCompleted?: boolean[] } } | null) => {
      if (!data?.current) return;
      if (typeof data.current.water === "number") setWaterCount(data.current.water);
      if (Array.isArray(data.current.routineCompleted) && data.current.routineCompleted.length === routine.length) setCompleted(data.current.routineCompleted.map(Boolean));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const checkDueTask = () => {
      const now = new Date();
      const asked = JSON.parse(localStorage.getItem(routineAskedKey) ?? "[]") as number[];
      const nextTaskIndex = routine.findIndex(
        (item, index) => !asked.includes(index) && now >= getRoutineTime(item.endTime)
      );

      if (nextTaskIndex !== -1 && pendingTaskIndex === null) {
        setPendingTaskIndex(nextTaskIndex);
      }
    };

    checkDueTask();
    const reminderTimer = window.setInterval(checkDueTask, 30_000);
    return () => window.clearInterval(reminderTimer);
  }, [pendingTaskIndex]);

  const answerRoutineReminder = (didComplete: boolean) => {
    if (pendingTaskIndex === null) return;

    const nextCompleted = [...completed];
    nextCompleted[pendingTaskIndex] = didComplete;
    setCompleted(nextCompleted);
    localStorage.setItem(routineCompletedKey, JSON.stringify(nextCompleted));
    persistRoutine(nextCompleted);

    const asked = JSON.parse(localStorage.getItem(routineAskedKey) ?? "[]") as number[];
    localStorage.setItem(
      routineAskedKey,
      JSON.stringify([...new Set([...asked, pendingTaskIndex])])
    );
    setPendingTaskIndex(null);
  };

  const completedTasks = routine.filter(
    (_, index) => completed[index]
  ).length;
  const progress = Math.round(
    (completedTasks / routine.length) * 100
  );

  function toggleTask(index: number) {
    const next = [...completed];
    next[index] = !next[index];
    setCompleted(next);
    localStorage.setItem(routineCompletedKey, JSON.stringify(next));
    localStorage.setItem(routineDateKey, new Date().toLocaleDateString("en-CA"));
    persistRoutine(next);
  }

  function logWater() {
    const next = Math.min(8, waterCount + 1);
    setWaterCount(next);
    void fetch("/api/wellness", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: new Date().toLocaleDateString("en-CA"), water: next }) }).catch(() => undefined);
  }

  const visibleTasks = routine.map((item, index) => ({ ...item, index })).filter((item) =>
    filter === "All habits" || (filter === "Completed" ? completed[item.index] : !completed[item.index])
  );

  return <main className="app-page">
    <div className="page-container">
      <PageHeader eyebrow="Daily routine" title="Find your daily rhythm." description={todayLabel || "Small habits. A more balanced everyday."} user={user} />
      <section className="hero-pattern flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-[#153b2e] p-6 text-white sm:px-8">
        <div className="max-w-lg"><p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#d0f268]"><Sparkles size={14} /> SHOW UP FOR YOURSELF</p><h2 className="mt-4 text-2xl font-medium tracking-tight sm:text-3xl">{progress === 100 ? "Look at you. All done." : "Consistency starts with today."}</h2><p className="mt-3 text-sm leading-6 text-[#b0c4b5]">{completedTasks} of {routine.length} habits complete. Every check is a little promise kept.</p><span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] text-[#d0f268]"><CheckCheck size={13} /> Your pace. Your progress.</span></div>
        <div className="mx-auto sm:mx-0"><ProgressRing value={progress} label="Completed" dark /></div>
      </section>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Habits completed" value={completedTasks + " / " + routine.length} detail="One step at a time" icon={CheckCheck} progress={progress} />
        <StatCard label="Steps today" value={stepCount.toLocaleString()} detail="Your goal · 10,000 steps" icon={Footprints} tone="orange" progress={stepProgress} />
        <StatCard label="Water goal" value={<>{waterCount}<span className="ml-1 text-sm font-normal text-[#8b9389]">/ 8 glasses</span></>} detail={waterCount ? "Keep the rhythm going" : "Keep your bottle close"} icon={Droplets} tone="blue" progress={waterCount / 8 * 100}><button type="button" onClick={logWater} className="mt-3 text-[11px] font-semibold text-[#4d8fb6] hover:underline">+ Log one glass</button></StatCard>
        <StatCard label="Rest goal" value="7–8 hours" detail="Recovery is part of the plan" icon={Moon} tone="purple" />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[1.8fr_1fr]">
        <section className="surface overflow-hidden">
          <SectionHeading title="Your day, thoughtfully planned" subtitle="From your first glass of water to a restful night."><span className="pill"><Clock size={12} />{routine.length} habits</span></SectionHeading>
          <div className="flex flex-wrap gap-1 border-y border-[#edf0e7] bg-[#fafbf7] px-5 py-3 sm:px-6" aria-label="Filter routine">
            {["All habits", "Pending", "Completed"].map((tab) => <button type="button" key={tab} aria-pressed={filter === tab} onClick={() => setFilter(tab)} className={"rounded-lg px-3 py-2 text-xs font-medium transition " + (filter === tab ? "bg-[#e8efd9] text-[#486735]" : "text-[#8b9389] hover:bg-[#f0f3e9]")}>{tab}</button>)}
          </div>
          <div className="px-4 sm:px-6">{visibleTasks.map((item) => {
            const Icon = routineIcons[item.icon];
            const done = completed[item.index];
            return <div key={item.title} className="flex items-center gap-3 border-b border-[#edf0e7] py-5 last:border-0 sm:gap-4">
              <div className="hidden w-[72px] shrink-0 text-[11px] font-medium tabular-nums text-[#88957b] sm:block">{item.time}<span className="mt-1 block text-[10px] text-[#b0b8a6]">{item.endTime}</span></div>
              <span className={"icon-tile h-10 w-10 rounded-xl " + (done ? "bg-[#edf4df] text-[#729647]" : "bg-[#f4f5ef] text-[#9ba58e]")}><Icon size={19} strokeWidth={1.7} /></span>
              <div className="min-w-0 flex-1"><p className="mb-1 text-[10px] tabular-nums text-[#9ca78f] sm:hidden">{item.time} – {item.endTime}</p><h3 className={"text-sm font-semibold " + (done ? "text-[#91a07f]" : "text-[#314635]")}>{item.title}</h3><p className="mt-1 text-xs leading-5 text-[#929d87]">{item.description}</p></div>
              <button type="button" aria-label={"Mark " + item.title + " as " + (done ? "incomplete" : "complete")} aria-pressed={done} onClick={() => toggleTask(item.index)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-[#f4f7ec]"><span className={"flex h-6 w-6 items-center justify-center rounded-lg border transition " + (done ? "border-[#789b4d] bg-[#789b4d] text-white" : "border-[#dce4d3] bg-white text-transparent")}><Check size={14} /></span></button>
            </div>;
          })}{visibleTasks.length === 0 && <div className="py-14 text-center"><Leaf size={28} className="mx-auto text-[#a4b789]" /><p className="mt-3 text-sm font-medium">Nothing here just yet.</p><p className="mt-2 text-xs text-[#8b9389]">Your habits will appear here as you check them off.</p></div>}</div>
        </section>
        <aside className="space-y-5">
          <section className="surface p-6"><p className="eyebrow">Make space for the basics</p><h2 className="mt-2 text-lg font-semibold tracking-tight">Today's gentle reminders</h2><div className="mt-5 space-y-5">{[{ icon: Droplets, title: "A sip, then another", text: "Keep water within reach throughout your day.", color: "bg-[#edf4fa] text-[#679dbb]" }, { icon: Dumbbell, title: "Move in a way you enjoy", text: "A little movement is always a good start.", color: "bg-[#edf4df] text-[#829c51]" }, { icon: Moon, title: "Leave room to recharge", text: "Wind down and give yourself time to rest.", color: "bg-[#f2edfa] text-[#9c86c2]" }].map(({ icon: Icon, title, text, color }) => <div key={title} className="flex gap-3"><span className={"icon-tile " + color}><Icon size={19} /></span><div><h3 className="text-xs font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-[#8b9389]">{text}</p></div></div>)}</div></section>
          <section className="rounded-3xl bg-[#e8eddc] p-6"><span className="text-4xl leading-none text-[#a9bb8d]" aria-hidden="true">“</span><p className="mt-2 text-xl font-medium leading-relaxed tracking-tight text-[#4a6037]">{motivationQuote || motivationQuotes[0]}</p><p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a9b77]">A note from Fit-Mess AI</p></section>
          <button type="button" onClick={toggleTracking} className="action-secondary w-full">{isTracking ? <Pause size={16} /> : <Play size={16} />}{isTracking ? "Pause step tracking" : "Start step tracking"}</button>
          <Link href="/workouts" className="action-primary w-full">Explore your workouts<ArrowUpRight size={16} /></Link>
        </aside>
      </div>
    </div>
    {pendingTaskIndex !== null && <div role="alert" className="fixed inset-x-4 bottom-24 z-50 ml-auto max-w-sm rounded-2xl border border-[#dce5d0] bg-white p-5 shadow-[0_12px_48px_#153b2e25] lg:bottom-6 lg:right-6">
      <p className="eyebrow flex items-center gap-2 text-[#769347]"><Clock size={13} /> A quick check-in</p><p className="mt-2 text-sm font-semibold">Did you finish {routine[pendingTaskIndex].title.toLowerCase()}?</p>
      <div className="mt-4 flex gap-2"><button type="button" onClick={() => answerRoutineReminder(true)} className="action-primary flex-1">Yes, done<Check size={15} /></button><button type="button" onClick={() => answerRoutineReminder(false)} className="action-secondary flex-1">Not yet</button></div>
    </div>}
  </main>;
}

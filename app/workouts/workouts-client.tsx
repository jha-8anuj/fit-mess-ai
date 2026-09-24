"use client";
/* eslint-disable react/no-unescaped-entities */

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, CheckCheck, Clock, Dumbbell, Flame, Leaf, Lightbulb, Moon, Pause, Play, Target } from "lucide-react";
import { PageHeader, ProgressRing, SectionHeading, StatCard, type ProfileUser } from "@/components/ui/fitness";

type Exercise = {
  name: string;
  sets: string;
  muscle: string;
  image: string;
  completed: boolean;
};

type WorkoutPlan = {
  day: string;
  focus: string;
  calories: number;
  exercises: Exercise[];
};

const workoutPlans: WorkoutPlan[] = [
  {
    day: "Monday",
    focus: "Chest",
    calories: 320,
    exercises: [
      { name: "Push Ups", sets: "3 sets × 12 reps", muscle: "Chest", image: "/exercises/pushups.jpg", completed: false },
      { name: "Dumbbell Bench Press", sets: "3 sets × 10 reps", muscle: "Chest", image: "/exercises/bench-press.jpg", completed: false },
      { name: "Incline Push Ups", sets: "3 sets × 12 reps", muscle: "Chest", image: "/exercises/pushups.jpg", completed: false },
      { name: "Chest Press", sets: "3 sets × 10 reps", muscle: "Chest", image: "/exercises/bench-press.jpg", completed: false },
      { name: "Slow Push Ups", sets: "2 sets × 8 reps", muscle: "Chest", image: "/exercises/pushups.jpg", completed: false },
    ],
  },
  {
    day: "Tuesday",
    focus: "Back",
    calories: 340,
    exercises: [
      { name: "Bent Over Row", sets: "3 sets × 12 reps", muscle: "Back", image: "/exercises/bench-press.jpg", completed: false },
      { name: "Reverse Fly", sets: "3 sets × 12 reps", muscle: "Back", image: "/exercises/shoulder-press.jpg", completed: false },
      { name: "Single Arm Row", sets: "3 sets × 10 reps", muscle: "Back", image: "/exercises/bench-press.jpg", completed: false },
      { name: "Wide Rows", sets: "3 sets × 12 reps", muscle: "Back", image: "/exercises/bench-press.jpg", completed: false },
      { name: "Superman Hold", sets: "3 sets × 30 sec", muscle: "Back", image: "/exercises/plank.jpg", completed: false },
    ],
  },
  {
    day: "Wednesday",
    focus: "Shoulders",
    calories: 300,
    exercises: [
      { name: "Shoulder Press", sets: "3 sets × 12 reps", muscle: "Shoulders", image: "/exercises/shoulder-press.jpg", completed: false },
      { name: "Lateral Raises", sets: "3 sets × 15 reps", muscle: "Shoulders", image: "/exercises/shoulder-press.jpg", completed: false },
      { name: "Front Raises", sets: "3 sets × 12 reps", muscle: "Shoulders", image: "/exercises/shoulder-press.jpg", completed: false },
      { name: "Arnold Press", sets: "3 sets × 10 reps", muscle: "Shoulders", image: "/exercises/shoulder-press.jpg", completed: false },
      { name: "Shoulder Taps", sets: "3 sets × 20 taps", muscle: "Shoulders", image: "/exercises/pushups.jpg", completed: false },
    ],
  },
  {
    day: "Thursday",
    focus: "Arms",
    calories: 280,
    exercises: [
      { name: "Bicep Curl", sets: "3 sets × 12 reps", muscle: "Biceps", image: "/exercises/bicep.jpg", completed: false },
      { name: "Tricep Extension", sets: "3 sets × 12 reps", muscle: "Triceps", image: "/exercises/tricep.jpg", completed: false },
      { name: "Hammer Curl", sets: "3 sets × 10 reps", muscle: "Biceps", image: "/exercises/bicep.jpg", completed: false },
      { name: "Tricep Kickback", sets: "3 sets × 12 reps", muscle: "Triceps", image: "/exercises/tricep.jpg", completed: false },
      { name: "Close Grip Push Ups", sets: "2 sets × 10 reps", muscle: "Arms", image: "/exercises/pushups.jpg", completed: false },
    ],
  },
  {
    day: "Friday",
    focus: "Legs",
    calories: 420,
    exercises: [
      { name: "Bodyweight Squats", sets: "4 sets × 15 reps", muscle: "Legs", image: "/exercises/pushups.jpg", completed: false },
      { name: "Reverse Lunges", sets: "3 sets × 12 reps", muscle: "Legs", image: "/exercises/mountain-climber.jpg", completed: false },
      { name: "Split Squats", sets: "3 sets × 10 reps", muscle: "Legs", image: "/exercises/mountain-climber.jpg", completed: false },
      { name: "Glute Bridge", sets: "3 sets × 15 reps", muscle: "Glutes", image: "/exercises/plank.jpg", completed: false },
      { name: "Wall Sit", sets: "3 sets × 30 sec", muscle: "Legs", image: "/exercises/plank.jpg", completed: false },
    ],
  },
  {
    day: "Saturday",
    focus: "Core & Cardio",
    calories: 360,
    exercises: [
      { name: "Plank", sets: "3 sets × 45 sec", muscle: "Core", image: "/exercises/plank.jpg", completed: false },
      { name: "Mountain Climbers", sets: "3 sets × 30 sec", muscle: "Cardio", image: "/exercises/mountain-climber.jpg", completed: false },
      { name: "High Knees", sets: "3 sets × 30 sec", muscle: "Cardio", image: "/exercises/mountain-climber.jpg", completed: false },
      { name: "Bicycle Crunches", sets: "3 sets × 20 reps", muscle: "Core", image: "/exercises/plank.jpg", completed: false },
      { name: "Plank Jacks", sets: "2 sets × 20 reps", muscle: "Core", image: "/exercises/plank.jpg", completed: false },
    ],
  },
  { day: "Sunday", focus: "Rest Day", calories: 0, exercises: [] },
];

const workoutMeta: Record<string, { duration: string; level: string; tip: string }> = {
  Monday: { duration: "1 hr 30 min", level: "Strength", tip: "Build a strong push with controlled reps." },
  Tuesday: { duration: "1 hr 30 min", level: "Strength", tip: "Keep your back long and make every pull count." },
  Wednesday: { duration: "1 hr 30 min", level: "Mobility + strength", tip: "Move smoothly and leave space for recovery." },
  Thursday: { duration: "1 hr 30 min", level: "Upper body", tip: "Light, focused work for powerful arms." },
  Friday: { duration: "1 hr 30 min", level: "Lower body", tip: "Strong legs create an even stronger foundation." },
  Saturday: { duration: "1 hr 30 min", level: "Conditioning", tip: "Raise your heart rate, then finish proud." },
  Sunday: { duration: "Recovery", level: "Reset", tip: "Rest is where your body adapts and gets stronger." },
};

const workoutCover: Record<string, string> = {
  Monday: "/exercises/pushups.jpg",
  Tuesday: "/exercises/bench-press.jpg",
  Wednesday: "/exercises/shoulder-press.jpg",
  Thursday: "/exercises/bicep.jpg",
  Friday: "/exercises/mountain-climber.jpg",
  Saturday: "/exercises/plank.jpg",
  Sunday: "/dashboard/mountains.jpg",
};

export default function WorkoutsClient({ user }: { user: ProfileUser }) {
  const [currentDay, setCurrentDay] = useState("Monday");
  const [selectedDay, setSelectedDay] = useState("Monday");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
      setCurrentDay(day);
      setSelectedDay(day);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const [completedByDay, setCompletedByDay] = useState<Record<string, Record<string, boolean>>>({});
  const [completedWorkoutDays, setCompletedWorkoutDays] = useState<Record<string, boolean>>({});
  const [startedDay, setStartedDay] = useState<string | null>(null);
  const todayWorkout = workoutPlans.find((plan) => plan.day === selectedDay) ?? workoutPlans[0];
  const selectedMeta = workoutMeta[selectedDay];
  const exercises = todayWorkout.exercises.map((exercise) => ({
    ...exercise,
    completed: completedByDay[selectedDay]?.[exercise.name] ?? exercise.completed,
  }));
  const completedExercises = exercises.filter(
    (exercise) => exercise.completed
  ).length;

  const progress = exercises.length ? Math.round(completedExercises / exercises.length * 100) : 0;
  const burnedCalories = exercises.length === 0
    ? 0
    : Math.round((completedExercises / exercises.length) * todayWorkout.calories);
  const canCompleteWorkout = selectedDay === currentDay
    && startedDay === selectedDay
    && exercises.length > 0
    && completedExercises === exercises.length
    && !completedWorkoutDays[selectedDay];

  const toggleExercise = (exerciseName: string) => {
    setCompletedByDay((previous) => ({
      ...previous,
      [selectedDay]: {
        ...previous[selectedDay],
        [exerciseName]: !exercises.find((exercise) => exercise.name === exerciseName)?.completed,
      },
    }));
  };

  const selectDay = (day: string) => {
    setSelectedDay(day);
    setStartedDay(null);
  };

  const completeWorkout = () => {
    if (!canCompleteWorkout) {
      return;
    }

    setCompletedByDay((previous) => ({
      ...previous,
      [selectedDay]: Object.fromEntries(
        todayWorkout.exercises.map((exercise) => [exercise.name, true])
      ),
    }));
    setCompletedWorkoutDays((previous) => ({ ...previous, [selectedDay]: true }));
    setStartedDay(null);
  };

  const isRestDay = exercises.length === 0;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem("fitai-workout-progress") ?? "null");
        if (saved && typeof saved === "object") setCompletedByDay(saved.completedByDay ?? {});
        const finished = JSON.parse(localStorage.getItem("fitai-workout-days") ?? "null");
        if (finished && typeof finished === "object") setCompletedWorkoutDays(finished);
      } catch { /* Start with a clean plan when stored data is invalid. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("fitai-workout-progress", JSON.stringify({ completedByDay }));
    localStorage.setItem("fitai-workout-days", JSON.stringify(completedWorkoutDays));
  }, [completedByDay, completedWorkoutDays]);

  return <main className="app-page">
    <div className="page-container">
      <PageHeader eyebrow="Workouts" title="Make every rep count." description="A little effort today. A stronger you tomorrow." user={user} />
      <section aria-label="Workout days" className="surface overflow-x-auto p-2">
        <div className="grid min-w-[690px] grid-cols-7 gap-1">
          {workoutPlans.map((plan) => <button type="button" key={plan.day} onClick={() => selectDay(plan.day)} aria-pressed={plan.day === selectedDay} className={"relative overflow-hidden rounded-2xl px-3 py-3 text-left transition " + (plan.day === selectedDay ? "bg-[#153b2e] text-white shadow-sm" : "text-[#829175] hover:bg-[#f2f5eb]")}>
            <div className="relative mb-3 h-12 overflow-hidden rounded-xl"><Image src={workoutCover[plan.day]} alt="" fill unoptimized sizes="120px" className={"object-cover " + (plan.day === selectedDay ? "opacity-80" : "opacity-65")} /><div className="absolute inset-0 bg-gradient-to-t from-[#153b2e88] to-transparent" /></div><span className={"text-[9px] uppercase tracking-[0.15em] " + (plan.day === selectedDay ? "text-[#d0f268]" : "text-[#acb59f]")}>{plan.day === currentDay ? "Today" : plan.day.slice(0, 3)}</span><span className="mt-1 block text-sm font-semibold">{plan.day}</span><span className={"mt-1 block text-[10px] " + (plan.day === selectedDay ? "text-[#a6bba7]" : "text-[#a4ae98]")}>{plan.focus}</span><span className={"mt-2 block text-[9px] " + (plan.day === selectedDay ? "text-[#d0f268]" : "text-[#a4ae98]")}>{plan.calories ? plan.calories + " kcal" : "Recovery"}</span>
          </button>)}
        </div>
      </section>
      <section className="relative isolate overflow-hidden rounded-3xl bg-[#153b2e] text-white">
        <div className="absolute inset-y-0 right-0 -z-20 w-full sm:w-1/2"><Image src={isRestDay ? "/dashboard/mountains.jpg" : todayWorkout.exercises[0].image} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover opacity-45" /></div>
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#153b2e] via-[#153b2e]/90 to-[#153b2e]/20" />
        <div className="max-w-lg p-6 sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.13em] text-[#d0f268]">{isRestDay ? <Moon size={13} /> : <Dumbbell size={13} />}{isRestDay ? "RECOVER & RECHARGE" : "YOUR " + selectedDay.toUpperCase() + " SESSION"}</span>
          <h2 className="mt-5 text-4xl font-medium tracking-[-0.04em] sm:text-[44px]">{isRestDay ? "Rest is progress, too." : todayWorkout.focus + " day."}</h2>
          <p className="mt-3 text-sm leading-6 text-[#b0c4b5]">{selectedMeta.tip}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#b7c9bd]"><span className="flex items-center gap-1.5"><Clock size={14} />{selectedMeta.duration}</span><span className="rounded-full border border-white/15 px-2.5 py-1">{selectedMeta.level}</span>{!isRestDay && <><span className="h-1 w-1 rounded-full bg-[#8eab96]" /><span>{exercises.length} exercises</span></>}</div>
          {!isRestDay && <button type="button" aria-pressed={startedDay === selectedDay} onClick={() => setStartedDay(startedDay === selectedDay ? null : selectedDay)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#d0f268] px-5 py-3 text-xs font-semibold text-[#153b2e] transition hover:bg-[#dff791]">{startedDay === selectedDay ? <Pause size={15} /> : <Play size={15} />}{startedDay === selectedDay ? "Pause workout" : "Start workout"}<ArrowUpRight size={15} className="ml-2" /></button>}
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Planned duration" value={selectedMeta.duration} detail={isRestDay ? "Take it easy today" : "Make time for your strength"} icon={Clock} />
        <StatCard label="Estimated energy" value={burnedCalories + " kcal"} detail="Based on completed exercises" icon={Flame} tone="orange" />
        <StatCard label="Exercises done" value={completedExercises + " / " + exercises.length} detail={isRestDay ? "Recovery is the goal" : "Your session progress"} icon={Target} tone="blue" progress={progress} />
        <StatCard label="Sessions completed" value={Object.values(completedWorkoutDays).filter(Boolean).length + " / 6"} detail="Keep building consistency" icon={CheckCheck} tone="purple" />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[1.7fr_1fr]">
        <section className="surface overflow-hidden">
          <SectionHeading title="Your session plan" subtitle={isRestDay ? "Today's priority is recovery." : "Five focused moves. Check each one off when you're finished."}><span className="pill">{todayWorkout.focus} · {exercises.length || 0} moves</span></SectionHeading>
          {isRestDay ? <div className="flex flex-col items-center border-t border-[#edf0e7] px-6 py-14 text-center"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf3e0] text-[#7f9a53]"><Leaf size={30} strokeWidth={1.5} /></span><h3 className="mt-5 text-lg font-semibold">Permission to slow down.</h3><p className="mt-3 max-w-xs text-sm leading-6 text-[#8b9389]">Hydrate, stretch gently and let your muscles recover. We'll be here for your next session.</p></div> :
          <><div className="relative mx-4 mt-1 aspect-[16/7] overflow-hidden rounded-2xl bg-[#e8eee0] sm:mx-6"><Image src={todayWorkout.exercises[0].image} alt={todayWorkout.focus + " workout"} fill unoptimized sizes="(max-width: 768px) 90vw, 640px" className="object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-t from-[#153b2ecc] via-[#153b2e20] to-transparent" /><div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3"><span className="text-xs font-semibold text-white">{todayWorkout.focus} session</span><span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-[#456137]">{todayWorkout.calories} kcal planned</span></div></div><div className="border-t border-[#edf0e7] px-4 sm:px-6">{exercises.map((exercise, index) => <article key={exercise.name} className="flex flex-wrap items-center gap-3 border-b border-[#edf0e7] py-5 last:border-0 sm:gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f1f3ec] sm:h-20 sm:w-24"><Image src={exercise.image} alt={exercise.name} fill unoptimized sizes="96px" className="object-cover" /></div>
            <div className="min-w-0 flex-1"><p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-[#9fa994]">EXERCISE {String(index + 1).padStart(2, "0")}</p><h3 className={"text-sm font-semibold " + (exercise.completed ? "text-[#77905e]" : "")}>{exercise.name}</h3><p className="mt-1.5 text-xs text-[#929e85]">{exercise.sets}</p><span className="mt-2 inline-block rounded-md bg-[#f1f5e9] px-2 py-1 text-[9px] text-[#7b925f]">{exercise.muscle}</span></div>
            <button type="button" aria-label={"Mark " + exercise.name + " as " + (exercise.completed ? "incomplete" : "complete")} aria-pressed={exercise.completed} onClick={() => toggleExercise(exercise.name)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-[#f2f6e9]"><span className={"flex h-7 w-7 items-center justify-center rounded-full border transition " + (exercise.completed ? "border-[#83a252] bg-[#83a252] text-white" : "border-[#d9e3ce] text-transparent")}><Check size={16} /></span></button>
          </article>)}</div></>}
          {!isRestDay && <div className="border-t border-[#edf0e7] bg-[#fafbf7] p-5 sm:p-6"><button type="button" onClick={completeWorkout} disabled={!canCompleteWorkout} className="action-primary w-full"><Check size={17} />{completedWorkoutDays[selectedDay] ? "Session complete. Well done!" : "Finish workout"}</button><p className="mt-3 text-center text-[11px] text-[#9ba58e]">{selectedDay !== currentDay ? "Select today's tab to complete your session." : completedWorkoutDays[selectedDay] ? "That's another little win in the books." : "Start your workout and check off every exercise to finish."}</p></div>}
        </section>
        <aside className="space-y-5">
          <section className="surface"><SectionHeading title="Your week in motion" subtitle="A balanced split for the whole week." /><div className="space-y-1 px-4 pb-5">{workoutPlans.map((plan) => <button type="button" key={plan.day} onClick={() => selectDay(plan.day)} aria-pressed={selectedDay === plan.day} className={"flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition " + (selectedDay === plan.day ? "bg-[#edf3e1]" : "hover:bg-[#f7f9f2]")}><span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg"><Image src={workoutCover[plan.day]} alt="" fill unoptimized sizes="36px" className="object-cover" /><span className={"absolute inset-0 flex items-center justify-center bg-[#153b2e55] text-[9px] " + (completedWorkoutDays[plan.day] ? "text-white" : "text-transparent")}>{completedWorkoutDays[plan.day] && <Check size={13} />}</span></span><span className="text-xs font-medium">{plan.day}</span><span className="ml-auto text-[10px] text-[#849371]">{plan.focus}</span></button>)}</div></section>
          <section className="surface flex items-center justify-around gap-4 p-5"><ProgressRing value={progress} label="Session" /><div><p className="eyebrow">Your momentum</p><p className="mt-3 text-sm font-semibold">{completedExercises} exercises done.</p><p className="mt-2 max-w-32 text-xs leading-5 text-[#8b9389]">Celebrate each rep. Progress adds up.</p></div></section>
          <section className="rounded-3xl bg-[#edf1e3] p-6"><span className="flex items-center gap-2 text-xs font-semibold text-[#5f773f]"><Lightbulb size={17} /> A little reminder</span><p className="mt-3 text-sm leading-7 text-[#859470]">Warm up before you start, focus on controlled movement, and listen to your body. Your pace is the right pace.</p></section>
        </aside>
      </div>
    </div>
  </main>;
}

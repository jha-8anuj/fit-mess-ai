"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Apple, Check, CheckCheck, Droplets, Flame, Leaf, Plus, Sparkles, Utensils } from "lucide-react";
import { PageHeader, ProgressRing, SectionHeading, StatCard, type ProfileUser } from "@/components/ui/fitness";

const meals = [
  { name: "Breakfast", time: "7:30 AM", meal: "Oats, banana & nuts", calories: 450, protein: "18g protein", image: "/dashboard/breakfast-oats.jpg" },
  { name: "Lunch", time: "1:00 PM", meal: "Rice, chicken & vegetables", calories: 550, protein: "34g protein", image: "/dashboard/lunch.jpg" },
  { name: "Snack", time: "5:00 PM", meal: "Apple & almonds", calories: 200, protein: "6g protein", image: "/dashboard/snack-apple-almonds.jpg" },
  { name: "Dinner", time: "9:00 PM", meal: "Salad & mixed vegetables", calories: 400, protein: "22g protein", image: "/dashboard/dinner.jpg" },
];

const mealSets = [
  meals,
  meals.map((meal, index) => [
    { ...meal, meal: ["Greek yogurt, berries & granola", "Quinoa, paneer & greens", "Banana & peanut butter", "Dal, roti & roasted vegetables"][index], calories: [380, 520, 220, 460][index] },
  ][0]),
  meals.map((meal, index) => [
    { ...meal, meal: ["Eggs, toast & avocado", "Grilled fish, rice & salad", "Dates, walnuts & tea", "Chicken soup & sweet potato"][index], calories: [430, 570, 190, 420][index] },
  ][0]),
];
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function NutritionClient({ user }: { user: ProfileUser }) {
  const [completed, setCompleted] = useState<boolean[]>(() => meals.map(() => false));
  const [water, setWater] = useState(0);
  const [today, setToday] = useState("");
  const [dayNumber, setDayNumber] = useState(0);
  const [currentDay, setCurrentDay] = useState("");
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const dailyMeals = mealSets[dayNumber % mealSets.length] ?? meals;
  const totalCalories = dailyMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const eatenCalories = dailyMeals.reduce((sum, meal, index) => sum + (completed[index] ? meal.calories : 0), 0);
  const proteinTarget = weightKg ? Math.round(weightKg * 1.6) : 80;

  useEffect(() => {
    const timer = window.setTimeout(() => { const date = new Date(); const weekday = date.getDay() === 0 ? 6 : date.getDay() - 1; setToday(date.toLocaleDateString("en-CA")); setDayNumber(weekday); setCurrentDay(weekDays[weekday]); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!today) return;
    const timer = window.setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(`fitai-meals-${today}`) ?? "null");
        if (Array.isArray(stored) && stored.length === dailyMeals.length) setCompleted(stored.map(Boolean));
      } catch { /* Use a fresh plan when local data is invalid. */ }
    }, 0);
    void fetch(`/api/wellness?date=${today}`).then((response) => response.ok ? response.json() : null).then((data: { current?: { water?: number } } | null) => { if (typeof data?.current?.water === "number") setWater(data.current.water); }).catch(() => undefined);
    void fetch("/api/profile").then((response) => response.ok ? response.json() : null).then((data: { weightKg?: number | null } | null) => { if (typeof data?.weightKg === "number") setWeightKg(data.weightKg); }).catch(() => undefined);
    return () => window.clearTimeout(timer);
  }, [today, dailyMeals.length]);

  function toggleMeal(index: number) {
    const next = [...completed];
    next[index] = !next[index];
    setCompleted(next);
    if (today) localStorage.setItem(`fitai-meals-${today}`, JSON.stringify(next));
  }

  function logWater() {
    const next = Math.min(8, water + 1);
    setWater(next);
    if (today) void fetch("/api/wellness", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: today, water: next }) });
  }

  function selectDay(index: number) {
    setDayNumber(index);
  }

  return <main className="app-page"><div className="page-container">
    <PageHeader eyebrow="Nutrition" title="Eat for your energy." description="A simple plan that keeps your day nourished, balanced and moving forward." user={user} />
    <section aria-label="Nutrition days" className="surface overflow-x-auto p-2"><div className="grid min-w-[690px] grid-cols-7 gap-1">{weekDays.map((day, index) => <button type="button" key={day} onClick={() => selectDay(index)} aria-pressed={dayNumber === index} className={"rounded-2xl px-3 py-3 text-left transition " + (dayNumber === index ? "bg-[#153b2e] text-white shadow-sm" : "text-[#829175] hover:bg-[#f2f5eb]")}><span className={"text-[9px] uppercase tracking-[0.15em] " + (dayNumber === index ? "text-[#d0f268]" : "text-[#acb59f]")}>{day === currentDay ? "Today" : day.slice(0, 3)}</span><span className="mt-1 block text-sm font-semibold">{day}</span><span className={"mt-1 block text-[10px] " + (dayNumber === index ? "text-[#a6bba7]" : "text-[#a4ae98]")}>{mealSets[index % mealSets.length].reduce((sum, meal) => sum + meal.calories, 0)} kcal menu</span></button>)}</div></section>
    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <section className="hero-pattern relative overflow-hidden rounded-3xl bg-[#153b2e] p-6 text-white sm:p-8"><div className="relative z-10 max-w-md"><span className="eyebrow flex items-center gap-2 text-[#d0f268]"><Sparkles size={13} /> DAILY FUEL PLAN</span><h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">Nourish your next win.</h2><p className="mt-3 text-sm leading-6 text-[#b0c4b5]">Complete each meal as you go and make food one less thing to think about.</p><div className="mt-6 flex items-center gap-5"><ProgressRing value={Math.round(eatenCalories / totalCalories * 100)} label="Fuelled" dark /><div><p className="text-2xl font-semibold">{eatenCalories.toLocaleString()} <span className="text-sm font-normal text-[#b0c4b5]">/ {totalCalories.toLocaleString()} kcal</span></p><p className="mt-2 text-xs text-[#a9c0b1]">{completed.filter(Boolean).length} of {meals.length} meals logged</p></div></div></div><Utensils size={180} className="absolute -bottom-10 -right-8 text-white/[0.06]" /></section>
      <section className="surface flex flex-col justify-between bg-[#eef2e4] p-6 sm:p-7"><div className="flex items-center justify-between"><span className="eyebrow">Hydration check</span><span className="icon-tile bg-white text-[#4d8fb6]"><Droplets size={20} /></span></div><div><p className="mt-7 text-4xl font-semibold tracking-tight">{water}<span className="ml-1 text-base font-normal text-[#8b9389]">/ 8 glasses</span></p><div className="mt-4 flex gap-1.5">{Array.from({ length: 8 }, (_, index) => <span key={index} className={"h-2 flex-1 rounded-full " + (index < water ? "bg-[#6ca6c2]" : "bg-[#d8e3dd]")} />)}</div></div><button type="button" onClick={logWater} className="action-secondary mt-6 w-full"><Plus size={15} /> Log one glass</button></section>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5"><StatCard label="Daily calories" value={totalCalories.toLocaleString()} detail="Planned meal energy" icon={Flame} tone="orange" /><StatCard label="Meals logged" value={completed.filter(Boolean).length + " / " + dailyMeals.length} detail="Keep your rhythm" icon={CheckCheck} progress={completed.filter(Boolean).length / dailyMeals.length * 100} /><StatCard label="Protein target" value={proteinTarget + "g"} detail={weightKg ? "Based on your weight" : "Add weight on dashboard"} icon={Apple} tone="purple" /><StatCard label="Water goal" value={water + " / 8"} detail="Small sips add up" icon={Droplets} tone="blue" progress={water / 8 * 100} /></div>
    <section className="surface overflow-hidden"><SectionHeading title={currentDay === weekDays[dayNumber] ? "Today's meal plan" : weekDays[dayNumber] + " meal plan"} subtitle="Your weekly menu changes by day for more variety."><span className="pill"><Leaf size={12} /> {weekDays[dayNumber]} menu</span></SectionHeading><div className="grid gap-4 border-t border-[#edf0e7] p-5 sm:grid-cols-2 sm:p-6">{dailyMeals.map((meal, index) => <article key={meal.name} className={"group overflow-hidden rounded-2xl border transition " + (completed[index] ? "border-[#b9d49c] bg-[#f5f8ef]" : "border-[#edf0e7] bg-white hover:-translate-y-0.5 hover:shadow-md")}><div className="relative aspect-[16/9] overflow-hidden"><Image src={meal.image} alt={meal.meal} fill unoptimized sizes="(max-width: 640px) 90vw, 420px" className="object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#4e6045]">{meal.time}</span><span className="absolute bottom-3 left-3 rounded-full bg-[#153b2ecc] px-2.5 py-1 text-[10px] font-semibold text-white">{meal.calories} kcal</span></div><div className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><h3 className={"text-sm font-semibold " + (completed[index] ? "text-[#78915d] line-through" : "")}>{meal.name}</h3><p className="mt-1 text-xs text-[#8b9389]">{meal.meal}</p><span className="mt-2 inline-block text-[10px] font-medium text-[#9aaa8e]">{meal.protein}</span></div><button type="button" aria-label={(completed[index] ? "Unlog " : "Log ") + meal.name} aria-pressed={completed[index]} onClick={() => toggleMeal(index)} className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition " + (completed[index] ? "border-[#82a75a] bg-[#82a75a] text-white" : "border-[#dfe8d7] text-transparent hover:bg-[#f2f7ea]")}><Check size={17} /></button></div></article>)}</div></section>
    <p className="flex items-center justify-center gap-2 pb-2 text-[10px] text-[#a6ad9c]"><Leaf size={12} /> Good food, good energy, good days.</p>
  </div></main>;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ActivityMode = "walking" | "running";
const STEP_COUNT_KEY = "fitai-step-count";
const ACTIVITY_MODE_KEY = "fitai-activity-mode";
const STEP_TRACKING_KEY = "fitai-step-tracking";
const STEP_GOAL = 10000;
function getToday() { return new Date().toLocaleDateString("en-CA"); }

export function useStepCounter(selectedDate?: string) {
  const [stepCount, setStepCount] = useState(0);
  const [activityMode, setActivityMode] = useState<ActivityMode | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const activeDate = selectedDate ?? getToday();
  const stepStorageKey = `${STEP_COUNT_KEY}-${activeDate}`;
  const syncTimer = useRef<number | null>(null);
  const syncSteps = useCallback((steps: number) => {
    if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => { void fetch("/api/wellness", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: activeDate, steps }) }); }, 800);
  }, [activeDate]);

  useEffect(() => {
    let cancelled = false;
    const savedCount = Number(localStorage.getItem(stepStorageKey) ?? "0");
    const savedMode = localStorage.getItem(ACTIVITY_MODE_KEY);
    const loadTimer = window.setTimeout(() => {
      setStepCount(Number.isFinite(savedCount) ? savedCount : 0);
      setActivityMode(savedMode === "running" ? "running" : "walking");
      setIsTracking(localStorage.getItem(STEP_TRACKING_KEY) !== "false");
    }, 0);
    void fetch(`/api/wellness?date=${encodeURIComponent(activeDate)}`).then((response) => response.ok ? response.json() : null).then((data: { current?: { steps?: number } } | null) => {
      if (cancelled) return;
      const serverSteps = data?.current?.steps;
      if (typeof serverSteps === "number" && Number.isFinite(serverSteps)) { setStepCount(serverSteps); localStorage.setItem(stepStorageKey, String(serverSteps)); }
    }).catch(() => undefined);
    return () => { cancelled = true; window.clearTimeout(loadTimer); if (syncTimer.current !== null) window.clearTimeout(syncTimer.current); };
  }, [activeDate, stepStorageKey]);

  const addStep = useCallback(() => { setStepCount((count) => { const next = count + 1; localStorage.setItem(stepStorageKey, String(next)); syncSteps(next); return next; }); }, [stepStorageKey, syncSteps]);
  useEffect(() => {
    if (!activityMode || !isTracking) return;
    let lastStepAt = 0;
    const minimumStepGap = activityMode === "running" ? 250 : 350;
    const handleMotion = (event: DeviceMotionEvent) => { const acceleration = event.accelerationIncludingGravity; if (!acceleration) return; const magnitude = Math.sqrt((acceleration.x ?? 0) ** 2 + (acceleration.y ?? 0) ** 2 + (acceleration.z ?? 0) ** 2); const now = Date.now(); if (magnitude < 12 || now - lastStepAt < minimumStepGap) return; lastStepAt = now; addStep(); };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [activityMode, isTracking, addStep]);
  useEffect(() => { if (!isTracking) return; const handleKeyDown = (event: KeyboardEvent) => { if (event.code === "Space") { event.preventDefault(); addStep(); } }; window.addEventListener("keydown", handleKeyDown); return () => window.removeEventListener("keydown", handleKeyDown); }, [isTracking, addStep]);
  const toggleTracking = async () => { if (isTracking) { localStorage.setItem(STEP_TRACKING_KEY, "false"); setIsTracking(false); return; } const motionEvent = DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<PermissionState> }; if (motionEvent.requestPermission) { try { if (await motionEvent.requestPermission() !== "granted") return; } catch { return; } } localStorage.setItem(STEP_TRACKING_KEY, "true"); setIsTracking(true); };
  return { stepCount, stepProgress: Math.min(Math.round(stepCount / STEP_GOAL * 100), 100), activityMode, isTracking, toggleTracking, addTestStep: () => { if (isTracking) addStep(); } };
}

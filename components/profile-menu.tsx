"use client";

import { ChevronDown, LoaderCircle, LogOut, UserRound } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type ProfileMenuProps = {
  user: { name: string; email: string };
};

export default function ProfileMenu({ user }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok && response.status !== 401) {
        throw new Error("Logout failed");
      }

      // A full navigation also discards cached authenticated router state.
      window.location.replace("/login");
    } catch {
      setError("Could not log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Profile menu"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:pr-3"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
          <UserRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <ChevronDown className={`hidden h-4 w-4 text-slate-500 transition-transform sm:block ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className="absolute right-0 top-full z-50 mt-3 w-64 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(23,59,47,0.15)]"
      >
        <div className="border-b border-slate-100 px-3 pb-3 pt-2">
          <p className="text-xs font-medium text-slate-500">Signed in as</p>
          <p className="mt-1 break-words text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="mt-0.5 break-all text-xs text-slate-500">{user.email}</p>
        </div>
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={handleLogout}
          className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait disabled:opacity-60"
        >
          {isLoggingOut ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
        {error && <p role="alert" className="px-3 pb-2 pt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle, Mail, UserRound } from "lucide-react";
import AuthShell from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message ?? "Unable to create your account. Please try again.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell mode="signup">
      <form className="space-y-5" onSubmit={handleSubmit} aria-busy={isSubmitting}>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative"><UserRound size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" /><Input id="name" name="name" autoComplete="name" minLength={2} maxLength={60} placeholder="Your full name" required className="pl-11" /></div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative"><Mail size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" /><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required className="pl-11" /></div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" name="password" autoComplete="new-password" placeholder="Create a password" minLength={8} required />
          <p className="text-xs text-[#8b9389]">Use at least 8 characters.</p>
        </div>
        {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="mt-2 h-[52px] w-full gap-2">{isSubmitting ? <><LoaderCircle size={17} className="animate-spin" />Creating account...</> : <>Create your account<ArrowRight size={17} /></>}</Button>
      </form>
      <p className="mt-7 text-center text-xs leading-6 text-[#8b9389]">Already have an account? <Link href="/login" className="font-semibold text-[#486f32] underline-offset-4 hover:underline">Log in</Link></p>
    </AuthShell>
  );
}

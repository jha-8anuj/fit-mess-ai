"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Input } from "./input";

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return <div className="relative"><LockKeyhole size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" /><Input {...props} type={visible ? "text" : "password"} className={"pl-11 pr-12 " + (props.className ?? "")} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute inset-y-1 right-1 flex w-10 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-[#153b2e]">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>;
}

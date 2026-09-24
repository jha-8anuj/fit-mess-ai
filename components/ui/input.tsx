import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-[52px] w-full rounded-xl border border-[#dfe5d8] bg-[#f8f9f5] px-4 text-sm text-[#20392d] outline-none transition placeholder:text-[#a5ac9e] focus:border-[#8ba862] focus:bg-white focus:ring-4 focus:ring-[#b5ca8c]/15 ${className}`}
      {...props}
    />
  );
}

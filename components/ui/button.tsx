import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export function Button({
  className = "",
  variant = "default",
  ...props
}: ButtonProps) {
  const variantClasses =
    variant === "outline"
      ? "border border-stone-300 bg-transparent text-stone-700 hover:bg-stone-100"
      : "bg-[#153b2e] text-white shadow-[0_8px_20px_-8px_#153b2e60] hover:bg-[#285340]";

  return (
    <button
      className={`inline-flex h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses} ${className}`}
      {...props}
    />
  );
}

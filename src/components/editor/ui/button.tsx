import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626]/50";
  const variants: Record<Variant, string> = {
    primary: "bg-[#dc2626] text-white hover:bg-[#b91c1c] shadow-[0_4px_12px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_16px_rgba(220,38,38,0.4)]",
    secondary: "bg-[#1a1a1a] text-white border border-[#262626] hover:bg-[#262626] hover:border-[#333]",
    ghost: "bg-transparent text-white/80 hover:text-white hover:bg-white/10",
    danger: "bg-transparent text-[#ff4444] border border-[#ff4444]/30 hover:bg-[#ff4444]/10",
  };
  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-sm",
    icon: "p-2 aspect-square",
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}

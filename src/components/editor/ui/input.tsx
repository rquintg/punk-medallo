import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2.5 rounded-lg bg-background border border-muted text-white placeholder:text-white/40 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full px-3 py-2.5 rounded-lg bg-background border border-muted text-white placeholder:text-white/40 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y min-h-[72px] ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export function Label({ className = "", ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`block text-xs font-semibold tracking-widest uppercase text-white/60 mb-1.5 ${className}`} {...props} />;
}

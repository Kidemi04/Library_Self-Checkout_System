"use client";

import { cn } from "@/app/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    intensity?: "low" | "medium" | "high";
}

export default function GlassCard({
    children,
    className,
    intensity = "medium",
    ...props
}: GlassCardProps) {
    const intensityClasses = {
        low: "bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm border-white/20 dark:border-slate-700",
        medium: "bg-white/60 dark:bg-slate-900/70 backdrop-blur-md border-white/30 dark:border-slate-700",
        high: "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-white/40 dark:border-slate-600",
    };

    return (
        <div
            className={cn(
                "rounded-3xl border shadow-xl transition-all duration-300",
                intensityClasses[intensity],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

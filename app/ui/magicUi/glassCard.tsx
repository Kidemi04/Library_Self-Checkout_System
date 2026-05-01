"use client";

import { cn } from "@/app/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    intensity?: "low" | "medium" | "high";
}

// Translucent card meant to sit over a dark image background (login + landing).
// Keeps `on-dark` (cream) translucency in light mode + `dark-canvas` translucency in dark mode.
export default function GlassCard({
    children,
    className,
    intensity = "medium",
    ...props
}: GlassCardProps) {
    const intensityClasses = {
        low: "bg-on-dark/30 dark:bg-dark-canvas/60 backdrop-blur-sm border-on-dark/20 dark:border-dark-hairline",
        medium: "bg-on-dark/60 dark:bg-dark-canvas/70 backdrop-blur-md border-on-dark/30 dark:border-dark-hairline",
        high: "bg-on-dark/80 dark:bg-dark-canvas/80 backdrop-blur-lg border-on-dark/40 dark:border-dark-hairline",
    };

    return (
        <div
            className={cn(
                "rounded-card border shadow-xl transition-all duration-300",
                intensityClasses[intensity],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

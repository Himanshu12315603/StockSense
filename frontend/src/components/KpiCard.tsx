import React from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: "up" | "down" | "neutral" | "warning";
  accentColor?: "indigo" | "emerald" | "amber" | "rose" | "cyan";
  onClick?: () => void;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = "neutral",
  accentColor = "indigo",
  onClick,
}: KpiCardProps) {
  const colorMap = {
    indigo: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      icon: "text-indigo-400",
      glow: "hover:border-indigo-500/40 hover:shadow-indigo-500/10",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: "text-emerald-400",
      glow: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: "text-amber-400",
      glow: "hover:border-amber-500/40 hover:shadow-amber-500/10",
    },
    rose: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      icon: "text-rose-400",
      glow: "hover:border-rose-500/40 hover:shadow-rose-500/10",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      icon: "text-cyan-400",
      glow: "hover:border-cyan-500/40 hover:shadow-cyan-500/10",
    },
  };

  const currentTheme = colorMap[accentColor];

  const trendBadge = trend ? (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
        trendType === "up"
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : trendType === "warning" || trendType === "down"
          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          : "bg-slate-800 text-slate-400 border border-slate-700"
      }`}
    >
      {trend}
    </span>
  ) : null;

  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 rounded-2xl transition-all duration-300 ${
        onClick ? "cursor-pointer" : ""
      } ${currentTheme.glow} border border-slate-800/80 shadow-lg relative overflow-hidden group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-white tracking-tight font-display">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${currentTheme.bg} ${currentTheme.border} border`}>
          <Icon className={`h-6 w-6 ${currentTheme.icon}`} />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
          <span className="truncate max-w-[180px]">{subtitle}</span>
          {trendBadge}
        </div>
      )}
    </div>
  );
}

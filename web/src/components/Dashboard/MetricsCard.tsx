import React from "react";

export interface MetricCardProps {
  title: string;
  icon: string;
  value: string;
  subtitle: React.ReactNode;
  themeColorClass: string;
  iconColorClass: string;
  subtitleColorClass: string;
}

export function MetricsCard({
  title,
  icon,
  value,
  subtitle,
  themeColorClass,
  iconColorClass,
  subtitleColorClass,
}: MetricCardProps) {
  return (
    <div className="crm-panel metric-card p-6 rounded-xl relative overflow-hidden group">
      <div
        className={`absolute top-0 left-0 w-1 h-full transition-all duration-300 ${themeColorClass}`}
      ></div>
      <div className="flex justify-between items-start mb-4">
        <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">
          {title}
        </span>
        <span
          className={`material-symbols-outlined ${iconColorClass}`}
          data-icon={icon}
        >
          {icon}
        </span>
      </div>
      <div className="metric-card-body">
        <div className="flex flex-col">
          <span className="metric-value font-extrabold text-on-surface tracking-tight mb-1">
            {value}
          </span>
          <span className={`flex items-center gap-1 text-xs font-bold ${subtitleColorClass}`}>
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  );
}

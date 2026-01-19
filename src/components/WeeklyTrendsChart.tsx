"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeeklyData {
  week: number;
  year: number;
  count: number;
}

interface WeeklyTrendsChartProps {
  data: WeeklyData[];
}

export default function WeeklyTrendsChart({ data }: WeeklyTrendsChartProps) {
  const years = [...new Set(data.map((d) => d.year))].sort((a, b) => b - a);

  if (years.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500">
        Waiting for stream...
      </div>
    );
  }

  const currentYear = years[0];
  const previousYear = years[1];

  const chartData = Array.from({ length: 53 }, (_, i) => {
    const week = i + 1;
    const currentWeekData = data.find((d) => d.year === currentYear && d.week === week);
    const previousWeekData =
      previousYear != null ? data.find((d) => d.year === previousYear && d.week === week) : undefined;
    return {
      week: week,
      current: currentWeekData?.count || 0,
      previous: previousWeekData?.count || 0,
    };
  });

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#475569" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#475569" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }}
            axisLine={false}
            tickLine={false}
            interval={12}
          />
          <YAxis tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(51, 65, 85, 0.5)",
              borderRadius: "16px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              fontSize: "11px",
              color: "#f8fafc"
            }}
            itemStyle={{ color: "#f8fafc", fontWeight: "bold" }}
            labelFormatter={(label) => `Week ${label}`}
          />
          <Area
            type="monotone"
            dataKey="current"
            name={`${currentYear}`}
            stroke="#60a5fa"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorCurrent)"
            animationDuration={1500}
          />
          {previousYear != null && (
            <Area
              type="monotone"
              dataKey="previous"
              name={`${previousYear}`}
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorPrevious)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}


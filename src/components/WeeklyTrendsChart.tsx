"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
      <div className="w-full h-80 flex items-center justify-center text-sm text-gray-500">
        No weekly data available
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
      week: `W${week}`,
      [currentYear]: currentWeekData?.count || 0,
      ...(previousYear != null ? { [previousYear]: previousWeekData?.count || 0 } : {}),
    };
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10 }}
            interval={4}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={currentYear}
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          {previousYear != null && (
            <Line
              type="monotone"
              dataKey={previousYear}
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useMemo } from "react";
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

interface MultiYearWeeklyChartProps {
  data: WeeklyData[];
  availableYears: number[];
  selectedYears: number[];
  onYearChange: (years: number[]) => void;
}

const COLORS = [
  "#3b82f6",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#a855f7",
  "#eab308",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f43f5e",
];

export default function MultiYearWeeklyChart({
  data,
  availableYears,
  selectedYears,
  onYearChange,
}: MultiYearWeeklyChartProps) {
  const allSelected = selectedYears.length === availableYears.length;

  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      onYearChange(selectedYears.filter((y) => y !== year));
    } else {
      onYearChange([...selectedYears, year]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onYearChange([]);
    } else {
      onYearChange([...availableYears]);
    }
  };

  const chartData = useMemo(() => {
    return Array.from({ length: 53 }, (_, i) => {
      const week = i + 1;
      const weekData: Record<string, number | string> = { week: `W${week}` };
      for (const year of selectedYears) {
        const yearWeekData = data.find((d) => d.year === year && d.week === week);
        weekData[year] = yearWeekData?.count || 0;
      }
      return weekData;
    });
  }, [data, selectedYears]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={toggleAll}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            allSelected
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500"
          }`}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
        {availableYears.map((year) => {
          const isSelected = selectedYears.includes(year);
          return (
            <button
              key={year}
              onClick={() => toggleYear(year)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                isSelected
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500"
              }`}
            >
              {year}
            </button>
          );
        })}
      </div>
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
            {selectedYears.map((year, index) => (
              <Line
                key={year}
                type="monotone"
                dataKey={year.toString()}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {selectedYears.length === 0 && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Select at least one year to view data
        </div>
      )}
    </div>
  );
}

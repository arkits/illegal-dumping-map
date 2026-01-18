"use client";

import { useState, useEffect, useCallback } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import MultiYearWeeklyChart from "@/components/MultiYearWeeklyChart";

interface WeeklyData {
  week: number;
  year: number;
  count: number;
}

export default function WeeklyTrendsPage() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [yearsRes, weeklyRes] = await Promise.all([
        fetch("/api/years"),
        fetch("/api/weekly?all=true"),
      ]);

      if (!yearsRes.ok || !weeklyRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [yearsData, weeklyResponse] = await Promise.all([
        yearsRes.json(),
        weeklyRes.json(),
      ]);

      const years = yearsData.years || [];
      setAvailableYears(years);
      setSelectedYears(years);
      setWeeklyData(weeklyResponse.weeklyData || []);
    } catch (err) {
      setAvailableYears([]);
      setSelectedYears([]);
      setWeeklyData([]);
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              >
                ← Back to Map
              </a>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Weekly Trends Analysis
              </h1>
            </div>
            <ThemeToggle />
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Compare illegal dumping request patterns across multiple years
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Request Trends
          </h2>
          {loading ? (
            <div className="h-80 bg-gray-100 dark:bg-gray-700 animate-pulse rounded"></div>
          ) : (
            <MultiYearWeeklyChart
              data={weeklyData}
              availableYears={availableYears}
              selectedYears={selectedYears}
              onYearChange={setSelectedYears}
            />
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Data source:{" "}
            <a
              href="https://data.oaklandca.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Oakland Open Data Portal
            </a>{" "}
            (311 Service Requests)
          </p>
        </div>
      </div>
    </main>
  );
}

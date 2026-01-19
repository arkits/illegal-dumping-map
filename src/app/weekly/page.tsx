"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import MultiYearWeeklyChart from "@/components/MultiYearWeeklyChart";
import { CITIES, CityId } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface WeeklyData {
  week: number;
  year: number;
  count: number;
}

interface YearsResponse {
  years: number[];
}

interface WeeklyResponse {
  weeklyData: WeeklyData[];
  cityId: string;
}

function useWeeklyTrendsData(cityId: CityId) {
  const { data: yearsData, isError: yearsError } = useQuery<YearsResponse>({
    queryKey: ["years", cityId],
    queryFn: async () => {
      const res = await fetch(`/api/years?cityId=${cityId}`);
      if (!res.ok) throw new Error("Failed to fetch years");
      return res.json();
    },
  });

  const { data: weeklyDataResponse, isError: weeklyError } = useQuery<WeeklyResponse>({
    queryKey: ["weekly", cityId, "all"],
    queryFn: async () => {
      const res = await fetch(`/api/weekly?cityId=${cityId}&all=true`);
      if (!res.ok) throw new Error("Failed to fetch weekly data");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  return {
    weeklyData: weeklyDataResponse?.weeklyData ?? [],
    availableYears: yearsData?.years ?? [],
    loading: !yearsData || !weeklyDataResponse,
    error: yearsError || weeklyError,
  };
}

export default function WeeklyTrendsPage() {
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityId>("oakland");

  const { weeklyData, availableYears, loading, error } = useWeeklyTrendsData(selectedCity);

  const cities = Object.values(CITIES);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              >
                ← Back
              </a>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Weekly Trends Analysis
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value as CityId);
                }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <ThemeToggle />
            </div>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Compare illegal dumping request patterns across multiple years for {cities.find(c => c.id === selectedCity)?.name}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">Failed to load data</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Request Trends
          </h2>
          {loading ? (
            <div className="h-96 bg-gray-100 dark:bg-gray-700 animate-pulse rounded"></div>
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
              href={
                selectedCity === "oakland"
                  ? "https://data.oaklandca.gov/"
                  : selectedCity === "sanfrancisco"
                  ? "https://data.sfgov.org/"
                  : "https://data.lacity.org/"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {selectedCity === "oakland"
                ? "Oakland Open Data Portal"
                : selectedCity === "sanfrancisco"
                ? "DataSF"
                : "DataLA"}
            </a>{" "}
            (311 Service Requests)
          </p>
        </div>
      </div>
    </main>
  );
}

"use client";

import * as Sentry from "@sentry/nextjs";
import { useState, useEffect, useCallback } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import MultiYearWeeklyChart from "@/components/MultiYearWeeklyChart";
import { CITIES, CityId } from "@/lib/utils";

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
  const [selectedCity, setSelectedCity] = useState<CityId>("oakland");

  useEffect(() => {
    document.title = "Weekly Trends - Illegal Dumping Map";
  }, []);

  const cities = Object.values(CITIES);

  const fetchData = useCallback(async () => {
    return Sentry.startSpan(
      {
        op: "function",
        name: "Fetch Weekly Data",
      },
      async (span) => {
        setLoading(true);
        setError(null);

        span.setAttribute("cityId", selectedCity);

        try {
          const [yearsRes, weeklyRes] = await Promise.all([
            Sentry.startSpan(
              {
                op: "http.client",
                name: `GET /api/years?cityId=${selectedCity}`,
              },
              async () => {
                return fetch(`/api/years?cityId=${selectedCity}`);
              }
            ),
            Sentry.startSpan(
              {
                op: "http.client",
                name: `GET /api/weekly?cityId=${selectedCity}&all=true`,
              },
              async () => {
                return fetch(`/api/weekly?cityId=${selectedCity}&all=true`);
              }
            ),
          ]);

          if (!yearsRes.ok || !weeklyRes.ok) {
            throw new Error("Failed to fetch data");
          }

          const [yearsData, weeklyResponse] = await Promise.all([
            yearsRes.json(),
            weeklyRes.json(),
          ]);

          const years = yearsData.years || [];
          span.setAttribute("yearsCount", years.length);
          span.setAttribute("weeklyDataCount", weeklyResponse.weeklyData?.length || 0);

          setAvailableYears(years);
          setSelectedYears(years);
          setWeeklyData(weeklyResponse.weeklyData || []);
        } catch (err) {
          setAvailableYears([]);
          setSelectedYears([]);
          setWeeklyData([]);
          setError(err instanceof Error ? err.message : "An error occurred");
          console.error("Error fetching data:", err);
          Sentry.captureException(err);
        } finally {
          setLoading(false);
        }
      }
    );
  }, [selectedCity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
                  Sentry.startSpan(
                    {
                      op: "ui.change",
                      name: "City Selection Change",
                    },
                    (span) => {
                      const newCityId = e.target.value as CityId;
                      span.setAttribute("oldCityId", selectedCity);
                      span.setAttribute("newCityId", newCityId);
                      setSelectedCity(newCityId);
                    }
                  );
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
            <p className="text-red-600 dark:text-red-400">{error}</p>
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

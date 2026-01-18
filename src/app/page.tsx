"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Stats from "@/components/Stats";
import WeeklyTrendsChart from "@/components/WeeklyTrendsChart";
import RequestDistribution from "@/components/RequestDistribution";
import { DumpingRequest } from "@/lib/utils";

const RequestMap = dynamic(() => import("@/components/RequestMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      <p>Loading map...</p>
    </div>
  ),
});

interface WeeklyData {
  week: number;
  year: number;
  count: number;
}

interface StatsData {
  totalRequests: number;
  avgPerWeek: number;
  previousTotal: number;
  previousAvgPerWeek: number;
  changePercent: number;
  year: number;
  compareYear: number;
}

export default function Home() {
  const [requests, setRequests] = useState<DumpingRequest[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [statsRes, requestsRes, weeklyRes] = await Promise.all([
          fetch(`/api/stats?year=${selectedYear}&compareYear=${selectedYear - 1}`),
          fetch(`/api/requests?year=${selectedYear}&limit=5000`),
          fetch(`/api/weekly?years=${selectedYear},${selectedYear - 1}`),
        ]);

        if (!statsRes.ok || !requestsRes.ok || !weeklyRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [statsData, requestsData, weeklyDataResponse] = await Promise.all([
          statsRes.json(),
          requestsRes.json(),
          weeklyRes.json(),
        ]);

        setStats(statsData);
        setRequests(requestsData.requests);
        setWeeklyData(weeklyDataResponse.weeklyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedYear]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Oakland Illegal Dumping Map
          </h1>
          <p className="mt-2 text-gray-600">
            Visualize and analyze illegal dumping requests from Oakland&apos;s 311 service data
          </p>

          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Stats stats={stats} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Trends ({selectedYear} vs {selectedYear - 1})
            </h2>
            {loading ? (
              <div className="h-80 bg-gray-100 animate-pulse rounded"></div>
            ) : (
              <WeeklyTrendsChart data={weeklyData} />
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Request Distribution
            </h2>
            {loading ? (
              <div className="h-80 bg-gray-100 animate-pulse rounded"></div>
            ) : (
              <RequestDistribution requests={requests} />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Interactive Map
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Click on markers to see details. Scroll to zoom, drag to pan.
            </p>
          </div>
          <div className="h-[600px]">
            {loading ? (
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <p>Loading map...</p>
              </div>
            ) : (
              <RequestMap
                requests={requests}
                centerLat={37.804747}
                centerLon={-122.272}
              />
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Data source:{" "}
            <a
              href="https://data.oaklandca.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
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

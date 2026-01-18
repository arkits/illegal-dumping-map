"use client";

import * as Sentry from "@sentry/nextjs";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Stats from "@/components/Stats";
import WeeklyTrendsChart from "@/components/WeeklyTrendsChart";
import RequestDistribution from "@/components/RequestDistribution";
import RequestTable from "@/components/RequestTable";
import ThemeToggle from "@/components/ThemeToggle";
import { DumpingRequest, getCityConfig } from "@/lib/utils";
import Link from "next/link";

const RequestMap = dynamic(() => import("@/components/RequestMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-700 dark:text-gray-300 font-medium">Loading data...</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">may take a second</p>
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

export default function OaklandPage() {
  const cityId = "oakland";
  const city = getCityConfig(cityId);
  const currentYear = new Date().getFullYear();
  const [requests, setRequests] = useState<DumpingRequest[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Oakland Illegal Dumping Map";
  }, []);

  const [sidebarWidth, setSidebarWidth] = useState(33);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      const clampedWidth = Math.min(Math.max(newWidth, 15), 60);
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      return Sentry.startSpan(
        {
          op: "function",
          name: "Fetch City Data",
        },
        async (span) => {
          setLoading(true);
          setError(null);

          span.setAttribute("cityId", cityId);
          span.setAttribute("year", currentYear);

          try {
            const [statsRes, requestsRes, weeklyRes] = await Promise.all([
              Sentry.startSpan(
                {
                  op: "http.client",
                  name: `GET /api/stats?cityId=${cityId}&year=${currentYear}`,
                },
                async () => {
                  return fetch(`/api/stats?cityId=${cityId}&year=${currentYear}&compareYear=${currentYear - 1}`, {
                    signal: controller.signal,
                  });
                }
              ),
              Sentry.startSpan(
                {
                  op: "http.client",
                  name: `GET /api/requests?cityId=${cityId}&year=${currentYear}`,
                },
                async () => {
                  return fetch(`/api/requests?cityId=${cityId}&year=${currentYear}&limit=5000`, {
                    signal: controller.signal,
                  });
                }
              ),
              Sentry.startSpan(
                {
                  op: "http.client",
                  name: `GET /api/weekly?cityId=${cityId}&years=${currentYear},${currentYear - 1}`,
                },
                async () => {
                  return fetch(`/api/weekly?cityId=${cityId}&years=${currentYear},${currentYear - 1}`, {
                    signal: controller.signal,
                  });
                }
              ),
            ]);

            if (!statsRes.ok || !requestsRes.ok || !weeklyRes.ok) {
              throw new Error("Failed to fetch data");
            }

            const [statsData, requestsData, weeklyDataResponse] = await Promise.all([
              statsRes.json(),
              requestsRes.json(),
              weeklyRes.json(),
            ]);

            if (controller.signal.aborted) return;

            span.setAttribute("statsLoaded", true);
            span.setAttribute("requestsCount", requestsData.requests?.length || 0);
            span.setAttribute("weeklyDataCount", weeklyDataResponse.weeklyData?.length || 0);

            setStats(statsData);
            setRequests(requestsData.requests);
            setWeeklyData(weeklyDataResponse.weeklyData);
          } catch (err) {
            if (err instanceof Error && err.name === "AbortError") return;
            setStats(null);
            setRequests([]);
            setWeeklyData([]);
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Error fetching data:", err);
            Sentry.captureException(err);
          } finally {
            if (!controller.signal.aborted) {
              setLoading(false);
            }
          }
        }
      );
    }

    fetchData();
    return () => controller.abort();
  }, [currentYear, cityId]);

  return (
    <main className="h-screen w-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <header className="flex-shrink-0 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between max-w-none mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ← Back
            </Link>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {city.name} Illegal Dumping Map
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/weekly"
              className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors whitespace-nowrap"
            >
              Weekly Trends →
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" ref={containerRef}>
        <aside 
          className="flex-shrink-0 bg-white dark:bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
          style={{ width: isDragging ? undefined : `${sidebarWidth}%` }}
        >
          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Stats stats={stats} loading={loading} />

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Weekly Trends ({currentYear} vs {currentYear - 1})
                </h2>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-28 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <WeeklyTrendsChart data={weeklyData} />
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Request Distribution
                </h2>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-28 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <RequestDistribution requests={requests} />
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {loading ? (
                  <div className="h-[400px] bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
                ) : (
                  <RequestTable requests={requests} onRequestClick={setSelectedRequestId} selectedRequestId={selectedRequestId} />
                )}
              </div>
            </div>

            <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
              <p>
                Data:{" "}
                <a
                  href="https://data.oaklandca.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Oakland Open Data
                </a>
              </p>
            </div>
          </div>
        </aside>

        <div
          onMouseDown={handleMouseDown}
          className={`hidden lg:block w-1 flex-shrink-0 cursor-col-resize bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors ${
            isDragging ? 'bg-blue-500' : ''
          }`}
          style={{ cursor: isDragging ? 'col-resize' : undefined }}
        />

        <section className="flex-1 bg-gray-100 dark:bg-gray-900 relative">
          <div className="absolute inset-0">
            {loading ? (
              <div className="h-full w-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">Loading data...</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">may take a second</p>
              </div>
            ) : (
              <RequestMap
                requests={requests}
                centerLat={selectedRequestId ? undefined : city.centerLat}
                centerLon={selectedRequestId ? undefined : city.centerLon}
                selectedRequestId={selectedRequestId}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

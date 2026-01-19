"use client";

import { useState } from "react";
import Link from "next/link";
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
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-bold text-slate-400 hover:text-blue-400 flex items-center gap-2 group transition-colors"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
                  Weekly Trends <span className="text-blue-500 font-bold ml-2">Analysis</span>
                </h1>
                <p className="mt-2 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                  Comparative Multi-Year Illegal Dumping Analytics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value as CityId);
                }}
                className="px-4 py-2 bg-slate-900 border border-slate-700/50 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer hover:bg-slate-800"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-rose-900/20 border border-rose-500/30 rounded-2xl animate-pulse">
            <p className="text-rose-400 font-black uppercase tracking-widest text-xs">Data Stream Interrupted</p>
            <p className="text-rose-300/80 text-sm mt-1 font-bold">Failed to synchronize multi-year trends. Retrying connection...</p>
          </div>
        )}

        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] border border-slate-700/50 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              Temporal Distribution
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">Live Engine</span>
            </div>
          </div>

          {loading ? (
            <div className="h-96 bg-slate-800/50 animate-pulse rounded-3xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compiling Histories...</p>
              </div>
            </div>
          ) : (
            <MultiYearWeeklyChart
              data={weeklyData}
              availableYears={availableYears}
              selectedYears={selectedYears}
              onYearChange={setSelectedYears}
            />
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-loose">
            Aggregation Node: {selectedCity.toUpperCase()}-311-CORE
            <br />
            Last Synced Across {availableYears.length} Epochs
          </p>
        </div>
      </div>
    </main>
  );
}

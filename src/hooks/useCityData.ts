"use client";

import { useQuery } from "@tanstack/react-query";
import { DumpingRequest } from "@/lib/utils";

export interface StatsData {
  totalRequests: number;
  avgPerWeek: number;
  previousTotal: number;
  previousAvgPerWeek: number;
  changePercent: number;
  year: number;
  compareYear: number;
  cityId: string;
}

export interface WeeklyData {
  week: number;
  year: number;
  count: number;
}

interface RequestsResponse {
  requests: DumpingRequest[];
  count: number;
}

interface WeeklyResponse {
  weeklyData: WeeklyData[];
  cityId: string;
}

interface YearsResponse {
  years: number[];
}

export function useStats(cityId: string, year: number) {
  return useQuery<StatsData>({
    queryKey: ["stats", cityId, year],
    queryFn: async () => {
      const res = await fetch(
        `/api/stats?cityId=${cityId}&year=${year}&compareYear=${year - 1}`
      );
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRequests(cityId: string, year: number) {
  return useQuery<RequestsResponse>({
    queryKey: ["requests", cityId, year],
    queryFn: async () => {
      const res = await fetch(
        `/api/requests?cityId=${cityId}&year=${year}&limit=5000`
      );
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWeeklyData(cityId: string, years: number[]) {
  return useQuery<WeeklyResponse>({
    queryKey: ["weekly", cityId, ...years],
    queryFn: async () => {
      const res = await fetch(
        `/api/weekly?cityId=${cityId}&years=${years.join(",")}`
      );
      if (!res.ok) throw new Error("Failed to fetch weekly data");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useYears(cityId: string) {
  return useQuery<YearsResponse>({
    queryKey: ["years", cityId],
    queryFn: async () => {
      const res = await fetch(`/api/years?cityId=${cityId}`);
      if (!res.ok) throw new Error("Failed to fetch years");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}

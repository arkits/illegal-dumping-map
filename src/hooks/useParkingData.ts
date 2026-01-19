"use client";

import { useQuery } from "@tanstack/react-query";
import { ParkingCitation } from "@/lib/parking-citations";

export interface ParkingStatsData {
  totalCitations: number;
  totalFineAmount: number;
  avgFineAmount: number;
  avgPerWeek: number;
  previousTotal: number;
  previousTotalFineAmount: number;
  previousAvgFineAmount: number;
  previousAvgPerWeek: number;
  changePercent: number;
  topViolations: Array<{ violation: string; count: number }>;
  year: number;
  compareYear: number;
  cityId: string;
}

export interface ParkingWeeklyData {
  week: number;
  year: number;
  count: number;
}

interface ParkingCitationsResponse {
  citations: ParkingCitation[];
  count: number;
}

interface ParkingWeeklyResponse {
  weeklyData: ParkingWeeklyData[];
  cityId: string;
}

interface ParkingYearsResponse {
  years: number[];
  cityId: string;
}

export function useParkingStats(cityId: string, year: number) {
  return useQuery<ParkingStatsData>({
    queryKey: ["parking-stats", cityId, year],
    queryFn: async () => {
      const res = await fetch(
        `/api/parking/stats?cityId=${cityId}&year=${year}&compareYear=${year - 1}`
      );
      if (!res.ok) throw new Error("Failed to fetch parking stats");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useParkingCitations(cityId: string, year: number) {
  return useQuery<ParkingCitationsResponse>({
    queryKey: ["parking-citations", cityId, year],
    queryFn: async () => {
      const res = await fetch(
        `/api/parking/requests?cityId=${cityId}&year=${year}&limit=5000`
      );
      if (!res.ok) throw new Error("Failed to fetch parking citations");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useParkingWeeklyData(cityId: string, years: number[]) {
  return useQuery<ParkingWeeklyResponse>({
    queryKey: ["parking-weekly", cityId, ...years],
    queryFn: async () => {
      const res = await fetch(
        `/api/parking/weekly?cityId=${cityId}&years=${years.join(",")}`
      );
      if (!res.ok) throw new Error("Failed to fetch parking weekly data");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useParkingYears(cityId: string) {
  return useQuery<ParkingYearsResponse>({
    queryKey: ["parking-years", cityId],
    queryFn: async () => {
      const res = await fetch(`/api/parking/years?cityId=${cityId}`);
      if (!res.ok) throw new Error("Failed to fetch parking years");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}

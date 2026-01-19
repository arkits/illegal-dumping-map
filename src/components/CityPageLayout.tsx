"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Stats from "@/components/Stats";
import WeeklyTrendsChart from "@/components/WeeklyTrendsChart";
import RequestDistribution from "@/components/RequestDistribution";
import RequestTable from "@/components/RequestTable";
import { CityConfig } from "@/lib/utils";
import { useStats, useRequests, useWeeklyData } from "@/hooks/useCityData";
import Link from "next/link";

const RequestMap = dynamic(() => import("@/components/RequestMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 font-bold animate-pulse">Initializing Data Stream...</p>
        </div>
    ),
});

interface CityPageLayoutProps {
    cityId: string;
    city: CityConfig;
}

export default function CityPageLayout({ cityId, city }: CityPageLayoutProps) {
    const currentYear = new Date().getFullYear();

    const { data: statsData, isError: statsError } = useStats(cityId, currentYear);
    const { data: requestsData, isError: requestsError } = useRequests(cityId, currentYear);
    const { data: weeklyDataResponse, isError: weeklyError } = useWeeklyData(cityId, [currentYear, currentYear - 1]);

    const loading = !statsData || !requestsData || !weeklyDataResponse;
    const error = statsError || requestsError || weeklyError;

    const requests = requestsData?.requests ?? [];
    const weeklyData = weeklyDataResponse?.weeklyData ?? [];
    const stats = statsData ?? null;

    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const cardClass = "bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] border border-slate-700/50 p-6 shadow-2xl transition-all";
    const labelClass = "text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-3";

    return (
        <main className="relative h-screen w-screen bg-slate-950 overflow-hidden font-sans text-slate-100">
            {/* Background Map */}
            <div className="absolute inset-0 z-0">
                <RequestMap
                    requests={requests}
                    centerLat={selectedRequestId ? undefined : city.centerLat}
                    centerLon={selectedRequestId ? undefined : city.centerLon}
                    selectedRequestId={selectedRequestId}
                />
            </div>

            {/* Floating Header */}
            <header className="absolute top-4 lg:top-6 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] lg:w-[calc(100%-3rem)] max-w-7xl font-sans">
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 shadow-2xl rounded-2xl lg:rounded-3xl px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 lg:gap-6">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 text-xs lg:text-sm font-bold text-slate-400 hover:text-blue-400 transition-colors"
                        >
                            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Directory</span>
                        </Link>
                        <div className="h-6 w-px bg-slate-800" />
                        <div>
                            <h1 className="text-base lg:text-xl font-black text-white tracking-tight flex items-center gap-2">
                                {city.name} <span className="text-blue-400 opacity-60 font-bold text-sm lg:text-base">{city.state}</span>
                            </h1>
                            <p className="text-[8px] lg:text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] opacity-80">Illegal Dumping Analytics</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <Link
                            href="/weekly"
                            className="px-3 lg:px-5 py-1.5 lg:py-2 text-[10px] lg:text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                        >
                            Trends
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 bg-slate-800 rounded-xl text-slate-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar Dashboard */}
            <aside className={`absolute z-20 
                transition-all duration-500 ease-in-out
                ${isSidebarOpen ? 'translate-y-0 opacity-100' : 'translate-y-full lg:translate-y-0 opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-none'}
                bottom-0 left-0 right-0 h-[70vh] lg:h-auto
                lg:top-28 lg:left-6 lg:bottom-6 lg:w-[400px] 
                flex flex-col gap-4 pointer-events-none`}
            >
                <div className="flex-1 overflow-y-auto pointer-events-auto flex flex-col gap-6 px-4 pb-20 lg:px-0 lg:pb-12 lg:pr-4 custom-scrollbar">
                    {error && (
                        <div className="p-6 bg-rose-900/40 border-2 border-rose-500 rounded-3xl animate-pulse">
                            <p className="text-xs font-black text-rose-100 uppercase tracking-widest">Connection Failure</p>
                            <p className="text-[10px] text-rose-300 mt-1">Unable to reach city data nodes. Retrying...</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 flex-shrink-0">
                        <Stats stats={stats} loading={loading} />
                    </div>

                    <div className={`${cardClass} flex-shrink-0`}>
                        <h2 className={labelClass}>Weekly Trends</h2>
                        <WeeklyTrendsChart data={weeklyData} />
                    </div>

                    <div className={`${cardClass} flex-shrink-0`}>
                        <h2 className={labelClass}>Status Mix</h2>
                        <RequestDistribution requests={requests} />
                    </div>

                    <div className="flex-shrink-0">
                        <RequestTable
                            requests={requests}
                            onRequestClick={setSelectedRequestId}
                            selectedRequestId={selectedRequestId}
                        />
                    </div>

                    <div className="p-4 text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                            Source: <a href={`https://${city.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{city.domain}</a>
                            <br />
                            Last Sync: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </aside>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Synchronizing Data</h2>
                    <p className="text-slate-400 font-bold mt-2 animate-pulse tracking-[0.2em] text-[10px]">Establishing secure handshake with city nodes...</p>
                </div>
            )}
        </main>
    );
}

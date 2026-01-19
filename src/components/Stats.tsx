"use client";

interface StatsData {
  totalRequests: number;
  avgPerWeek: number;
  previousTotal: number;
  previousAvgPerWeek: number;
  changePercent: number;
  year: number;
  compareYear: number;
}

interface StatsProps {
  stats: StatsData | null;
  loading: boolean;
}

export default function Stats({ stats, loading }: StatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] border border-slate-700/50 p-5 animate-pulse">
            <div className="h-2 bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="h-6 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const isIncrease = stats.changePercent >= 0;
  const changeColor = isIncrease ? "text-rose-400" : "text-emerald-400";
  const changeBg = isIncrease ? "bg-rose-500/10" : "bg-emerald-500/10";

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Total Card */}
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] p-5 border border-slate-700/50 shadow-2xl">
        <div className="flex flex-col gap-2 mb-3 border-b border-slate-800 pb-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Total {stats.year}
          </p>
          <span className={`inline-fit text-[8px] font-black px-1.5 py-0.5 rounded-md ${changeBg} ${changeColor} border border-current opacity-80 w-fit`}>
            {isIncrease ? "+" : ""}{stats.changePercent.toFixed(1)}%
          </span>
        </div>
        <p className="text-2xl font-black text-white tracking-tight">
          {stats.totalRequests.toLocaleString()}
        </p>
      </div>

      {/* Avg Per Week Card */}
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] p-5 border border-slate-700/50 shadow-2xl">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 border-b border-slate-800 pb-2">
          Weekly Avg
        </p>
        <p className="text-2xl font-black text-white tracking-tight">
          {stats.avgPerWeek.toFixed(1)}
        </p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">Req / Week</p>
      </div>
    </div>
  );
}



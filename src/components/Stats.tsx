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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const changeColor = stats.changePercent >= 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";
  const changeArrow = stats.changePercent >= 0 ? "↑" : "↓";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Total Requests ({stats.year})
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {stats.totalRequests.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          vs {stats.previousTotal.toLocaleString()} in {stats.compareYear}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Average Per Week ({stats.year})
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {stats.avgPerWeek.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          vs{" "}
          {stats.previousAvgPerWeek.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}{" "}
          in {stats.compareYear}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Change vs {stats.compareYear}
        </p>
        <p className={`text-3xl font-bold ${changeColor}`}>
          {changeArrow} {Math.abs(stats.changePercent).toFixed(1)}%
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {stats.changePercent >= 0 ? "Increase" : "Decrease"} in reports
        </p>
      </div>
    </div>
  );
}

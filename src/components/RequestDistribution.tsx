"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RequestDistributionProps {
  requests: Array<{
    status: string;
    description: string;
  }>;
}

export default function RequestDistribution({ requests }: RequestDistributionProps) {
  const statusCounts = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusColors: Record<string, string> = {
    PENDING: "#fbbf24",
    OPEN: "#60a5fa",
    CLOSED: "#34d399",
    COMPLETED: "#94a3b8",
  };

  const data = Object.entries(statusCounts)
    .map(([status, count]) => ({
      status: status.charAt(0) + status.slice(1).toLowerCase(),
      count,
      fill: statusColors[status] || "#94a3b8",
    }))
    .sort((a, b) => b.count - a.count);

  const total = requests.length;

  if (total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500">
        Waiting for status...
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="status"
            type="category"
            tick={{ fontSize: 10, fontWeight: "bold", fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(51, 65, 85, 0.5)",
              borderRadius: "16px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              fontSize: "11px",
              color: "#f8fafc"
            }}
            itemStyle={{ color: "#f8fafc", fontWeight: "bold" }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


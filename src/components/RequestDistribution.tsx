"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
    PENDING: "#f59e0b",
    OPEN: "#3b82f6",
    CLOSED: "#10b981",
    COMPLETED: "#6b7280",
  };

  const data = Object.entries(statusCounts)
    .map(([status, count]) => ({
      status: status.charAt(0) + status.slice(1).toLowerCase(),
      count,
      fill: statusColors[status] || "#9ca3af",
    }))
    .sort((a, b) => b.count - a.count);

  const total = requests.length;

  if (total === 0) {
    return (
      <div className="h-80 bg-gray-100 flex items-center justify-center rounded">
        <p className="text-gray-500">No requests to display</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <div className="mb-2 text-center text-sm text-gray-500">
        {total.toLocaleString()} total requests
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="status" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number | undefined) => [value ?? 0, "Requests"]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

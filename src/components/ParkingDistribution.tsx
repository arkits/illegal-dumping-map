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
import { ParkingCitation } from "@/lib/parking-citations";

interface ParkingDistributionProps {
  citations: ParkingCitation[];
}

export default function ParkingDistribution({ citations }: ParkingDistributionProps) {
  const violationCounts = citations.reduce((acc, citation) => {
    const violation = citation.violationDesc || citation.violation || "Unknown";
    acc[violation] = (acc[violation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colors = ["#f59e0b", "#fb7185", "#a78bfa", "#34d399", "#60a5fa", "#94a3b8"];

  const data = Object.entries(violationCounts)
    .map(([violation, count], index) => ({
      violation: violation.length > 30 ? violation.substring(0, 30) + "..." : violation,
      fullViolation: violation,
      count,
      fill: colors[index % colors.length],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 violations

  const total = citations.length;

  if (total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500">
        Waiting for data...
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
            dataKey="violation"
            type="category"
            tick={{ fontSize: 9, fontWeight: "bold", fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={120}
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
            formatter={(value: any, name: any, props: any) => [
              `${value ?? 0} citations`,
              props.payload?.fullViolation || props.payload?.violation || ""
            ]}
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

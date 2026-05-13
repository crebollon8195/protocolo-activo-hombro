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
import { WeeklyProgress } from "@/lib/types";

interface AdherenceChartProps {
  weeklyProgress: WeeklyProgress[];
  height?: number;
}

export function AdherenceChart({ weeklyProgress, height = 200 }: AdherenceChartProps) {
  const data = weeklyProgress.map((w) => ({
    week: `S${w.week_number}`,
    adherence: w.adherence_percentage,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EBEEF3" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: "#808285", fontFamily: "Montserrat" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "#808285", fontFamily: "Montserrat" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid #EBEEF3", fontFamily: "Montserrat", fontSize: 12 }}
          formatter={(value) => [`${value}%`, "Adherencia"]}
        />
        <Bar dataKey="adherence" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.adherence >= 70 ? "#0170B9" : entry.adherence >= 50 ? "#eab308" : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

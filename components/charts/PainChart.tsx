"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PainChartProps {
  data: { date: string; pain: number }[];
  height?: number;
}

export function PainChart({ data, height = 200 }: PainChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EBEEF3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#808285", fontFamily: "Montserrat" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fontSize: 11, fill: "#808285", fontFamily: "Montserrat" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #EBEEF3",
            fontFamily: "Montserrat",
            fontSize: 12,
          }}
          formatter={(value) => [value, "Dolor"]}
        />
        <ReferenceLine y={5} stroke="#eab308" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="pain"
          stroke="#0170B9"
          strokeWidth={2.5}
          dot={{ fill: "#0170B9", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

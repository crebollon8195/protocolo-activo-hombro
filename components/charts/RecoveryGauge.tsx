"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getRecoveryScoreColor } from "@/lib/utils/recovery";

interface RecoveryGaugeProps {
  score: number;
}

export function RecoveryGauge({ score }: RecoveryGaugeProps) {
  const color = getRecoveryScoreColor(score);
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="80%"
            startAngle={180}
            endAngle={0}
            innerRadius={55}
            outerRadius={75}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#EBEEF3" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-6 text-center">
        <span className="text-3xl font-primary font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-sm text-text-secondary font-body block -mt-1">/ 100</span>
      </div>
    </div>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

export default function UsageChart({ conversions }) {
  // Generate last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i));
    const dayConversions = conversions.filter(c => 
      startOfDay(new Date(c.createdAt)).getTime() === date.getTime()
    );
    return {
      date: format(date, 'MMM d'),
      conversions: dayConversions.length,
      avgTime: 2.5 // Placeholder
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-3">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-300">
            Conversions: {payload[0].value}
          </p>
          <p className="text-amber-300">
            Avg Time: {payload[1]?.value?.toFixed(1)}s
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Usage Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis 
                dataKey="date" 
                stroke="#93c5fd"
                fontSize={12}
              />
              <YAxis 
                stroke="#93c5fd"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#3b82f6" }}
              />
              <Line 
                type="monotone" 
                dataKey="avgTime" 
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#f59e0b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 
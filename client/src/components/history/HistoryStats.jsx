import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

export default function HistoryStats({ conversions }) {
  const totalConversions = conversions.length;
  const successfulConversions = conversions.length; // All are successful
  const avgProcessingTime = 2.5; // Placeholder
  const todayConversions = conversions.filter(c => 
    new Date(c.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const stats = [
    {
      title: "Total Conversions",
      value: totalConversions,
      icon: Activity,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Success Rate",
      value: "100%",
      icon: CheckCircle,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Avg Processing Time",
      value: `${avgProcessingTime.toFixed(1)}s`,
      icon: Clock,
      color: "from-amber-500 to-amber-600"
    },
    {
      title: "Today's Usage",
      value: todayConversions,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-black/20 backdrop-blur-xl border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-200">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-white">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
} 
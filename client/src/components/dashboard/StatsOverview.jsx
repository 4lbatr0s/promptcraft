import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Clock, 
  Zap, 
  TrendingUp,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function StatsOverview({ conversions }) {
  const totalConversions = conversions.length;
  const successfulConversions = conversions.length; // All conversions are successful since they're saved to DB
  const averageProcessingTime = 2.5; // Placeholder since we don't track processing time yet
  const todayConversions = conversions.filter(c => 
    new Date(c.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const stats = [
    {
      title: "Total Conversions",
      value: totalConversions.toString(),
      icon: MessageSquare,
      color: "from-blue-500 to-blue-600",
      change: "+12%",
      description: "All time"
    },
    {
      title: "Success Rate",
      value: "100%",
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      change: "+5%",
      description: "This week"
    },
    {
      title: "Avg Processing",
      value: `${averageProcessingTime.toFixed(1)}s`,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
      change: "-0.2s",
      description: "Per request"
    },
    {
      title: "Today's Usage",
      value: todayConversions.toString(),
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      change: "+3",
      description: "Conversions"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-black/20 backdrop-blur-xl border-white/10 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
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
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                    {stat.change}
                  </Badge>
                  <span className="text-xs text-blue-200">
                    {stat.description}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
} 
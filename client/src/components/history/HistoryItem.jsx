import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Eye, 
  Trash2, 
  Copy,
  Bot,
  Zap,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const providerColors = {
  "OpenAI": "from-green-500 to-green-600",
  "Anthropic": "from-orange-500 to-orange-600",
  "Google": "from-blue-500 to-blue-600",
  "Cohere": "from-purple-500 to-purple-600",
  "default": "from-gray-500 to-gray-600"
};

export default function HistoryItem({ conversion, onDelete, onView }) {
  const providerColor = providerColors[conversion.llmProvider] || providerColors.default;
  // No status/processingTime in backend, so always success and 0s
  const isSuccess = true;
  const processingTime = 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(conversion.originalPrompt);
  };

  const truncatePrompt = (prompt, maxLength = 120) => {
    if (prompt.length <= maxLength) return prompt;
    return prompt.substring(0, maxLength) + "...";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-black/30 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 bg-gradient-to-r ${providerColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium mb-2 leading-relaxed">
                    {truncatePrompt(conversion.originalPrompt)}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge 
                      variant="outline" 
                      className={`bg-gradient-to-r ${providerColor} bg-opacity-20 text-white border-white/20`}
                    >
                      {conversion.llmProvider}
                    </Badge>
                    
                    <Badge 
                      variant="outline" 
                      className={`bg-green-500/20 text-green-300 border-green-500/30`}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Success
                    </Badge>
                    {processingTime > 0 && (
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        <Zap className="w-3 h-3 mr-1" />
                        {processingTime.toFixed(1)}s
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-blue-200">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(conversion.createdAt), "MMM d, yyyy 'at' HH:mm")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(conversion)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black/90 backdrop-blur-xl border-white/10">
                      <DropdownMenuItem
                        onClick={() => onDelete(conversion._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Conversion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 
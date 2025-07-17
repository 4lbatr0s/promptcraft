import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bot, 
  Copy, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import JsonViewer from "./JsonViewer";

export default function ChatInterface({ message, onCopy, onDownload, isStreaming }) {
  const isUser = message.type === "user";
  const isError = message.isError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <Card className={`${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
            : 'bg-black/30 backdrop-blur-xl border-white/10 text-white'
        } ${isError ? 'border-red-500/30 bg-red-900/20' : ''}`}>
          <div className="p-4">
            {isUser ? (
              <p className="text-white">{message.content}</p>
            ) : (
              <div className="space-y-3">
                {isStreaming ? (
                  <div className="flex items-center gap-2 text-blue-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing your request...</span>
                  </div>
                ) : message.jsonResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-300">JSON Generated Successfully</span>
                    </div>
                    
                    <JsonViewer 
                      json={message.jsonResult}
                      onCopy={() => onCopy(message.jsonResult)}
                      onDownload={() => onDownload(message.jsonResult, message.originalPrompt)}
                    />
                  </div>
                ) : isError ? (
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertCircle className="w-5 h-5" />
                    <span>{message.content}</span>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
            )}
          </div>
        </Card>
        
        <div className={`flex items-center gap-2 mt-1 text-xs text-blue-200 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          {format(message.timestamp, 'HH:mm')}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  );
} 
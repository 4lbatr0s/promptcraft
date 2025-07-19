import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Copy, 
  Download, 
  Sparkles, 
  Zap,
  Code,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch.js'
import urlResolver from '../lib/urlResolver.js'

// Import dashboard components
import ChatInterface from "@/components/dashboard/ChatInterface";
import JsonViewer from "@/components/dashboard/JsonViewer";
import StatsOverview from "@/components/dashboard/StatsOverview";
import PromptSuggestions from "@/components/dashboard/PromptSuggestions";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useKindeAuth()
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [conversions, setConversions] = useState([]);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const authenticatedFetch = useAuthenticatedFetch();

  useEffect(() => {
    if (isAuthenticated) {
      loadConversions();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversions = async () => {
    try {
      const response = await authenticatedFetch(urlResolver.getHistoryUrl());
      const data = await response.json();
      if (data.success) {
        setConversions(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load conversions:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setStreamingText("");
    setCurrentProvider(null);
    
    const promptToProcess = prompt;
    setPrompt("");

    const processingMessage = {
      id: Date.now() + 1,
      type: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, processingMessage]);

    try {
      const response = await authenticatedFetch(urlResolver.getConvertPromptStreamUrl(), {
        method: "POST",
        body: JSON.stringify({ prompt: promptToProcess }),
      });

      if (!response.ok) {
        throw new Error("Failed to process prompt");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalJson = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              let jsonData = line;
              if (line.startsWith("data: ")) {
                jsonData = line.slice(6);
              }

              if (jsonData.trim()) {
                try {
                  const data = JSON.parse(jsonData);
                  
                  if (data.type === "provider") {
                    setCurrentProvider(data.provider);
                  } else if (data.type === "chunk") {
                    // Update the streaming message with new content
                    setMessages(prev => prev.map(msg => 
                      msg.id === processingMessage.id 
                        ? { 
                            ...msg, 
                            content: data.fullContent || data.content,
                            isStreaming: true 
                          }
                        : msg
                    ));
                  } else if (data.type === "complete") {
                    finalJson = data.json;
                    setStreamingText("");
                    // Update final message with JSON result
                    setMessages(prev => prev.map(msg => 
                      msg.id === processingMessage.id 
                        ? { 
                            ...msg, 
                            content: "", 
                            isStreaming: false, 
                            jsonResult: finalJson 
                          }
                        : msg
                    ));
                  } else if (data.type === "saved") {
                    await loadConversions();
                  } else if (data.type === "provider_error") {
                    setMessages(prev => prev.map(msg => 
                      msg.id === processingMessage.id 
                        ? { 
                            ...msg, 
                            content: `Error with ${data.provider}: ${data.error}`, 
                            isStreaming: true 
                          }
                        : msg
                    ));
                  } else if (data.type === "error") {
                    setMessages(prev => prev.map(msg => 
                      msg.id === processingMessage.id 
                        ? { 
                            ...msg, 
                            content: `Error: ${data.error}`, 
                            isStreaming: false,
                            isError: true 
                          }
                        : msg
                    ));
                  }
                } catch (error) {
                  console.error("Parse error:", error);
                }
              }
            }
          }
        }
      }

      // Final message is now handled in the streaming loop above

    } catch (error) {
      console.error("Streaming error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === processingMessage.id 
          ? { ...msg, content: "Sorry, there was an error processing your request.", isStreaming: false, isError: true }
          : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyJson = (jsonContent) => {
    navigator.clipboard.writeText(JSON.stringify(jsonContent, null, 2));
    toast.success("JSON copied to clipboard!");
  };

  const handleDownloadJson = (jsonContent, originalPrompt) => {
    const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON downloaded successfully!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-blue-200">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to continue</h1>
          <p className="text-blue-200">You need to be authenticated to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Prompt Optimizer
            </span>
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Transform your natural language prompts into optimized JSON for any LLM
          </p>
        </motion.div>

        {/* Stats Overview */}
        <StatsOverview conversions={conversions} />

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-black/20 backdrop-blur-xl border-white/10 h-[700px] flex flex-col">
              <CardHeader className="border-b border-white/10 flex-shrink-0">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Conversation
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 min-h-0">
                <div className="h-full flex flex-col">
                  {/* Messages Area with ScrollArea */}
                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full px-4 py-4">
                      <div className="space-y-4">
                        <AnimatePresence>
                          {messages.map((message) => (
                            <ChatInterface
                              key={message.id}
                              message={message}
                              onCopy={handleCopyJson}
                              onDownload={handleDownloadJson}
                              isStreaming={message.isStreaming}
                            />
                          ))}
                        </AnimatePresence>
                        
                        {isProcessing && currentProvider && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-blue-300"
                          >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing with {currentProvider}...</span>
                          </motion.div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {/* Input Form */}
                  <div className="border-t border-white/10 p-4 flex-shrink-0">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Textarea
                          ref={textareaRef}
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Describe what you want your AI to do..."
                          className="w-full bg-white/5 border-white/20 text-white placeholder-blue-200 resize-none"
                          style={{
                            height: '80px',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            overflowY: 'auto',
                            overflowX: 'hidden'
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit(e);
                            }
                          }}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={!prompt.trim() || isProcessing}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 flex-shrink-0 h-[80px]"
                        onClick={handleSubmit}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 h-[700px] flex flex-col">
            <div className="flex-1">
              <PromptSuggestions onSuggestionClick={setPrompt} />
            </div>
            
            {/* Quick Actions */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10 flex-shrink-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-white/20 text-white hover:bg-white/5"
                  onClick={() => setPrompt("Create a chatbot that helps users with customer support")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chatbot Prompt
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-white/20 text-white hover:bg-white/5"
                  onClick={() => setPrompt("Generate creative content for social media marketing")}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Content Generator
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-white/20 text-white hover:bg-white/5"
                  onClick={() => setPrompt("Analyze and summarize technical documentation")}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Document Analyzer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
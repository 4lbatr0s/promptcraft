import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  MessageSquare, 
  Code, 
  Palette, 
  BarChart3, 
  Users
} from "lucide-react";
import { motion } from "framer-motion";

const suggestions = [
  {
    category: "Chatbot",
    icon: MessageSquare,
    color: "from-blue-500 to-blue-600",
    prompts: [
      "Create a customer support chatbot for e-commerce",
      "Build a FAQ bot for technical documentation",
      "Design a conversational AI for booking appointments"
    ]
  },
  {
    category: "Content",
    icon: Palette,
    color: "from-purple-500 to-purple-600",
    prompts: [
      "Generate creative social media captions",
      "Write engaging blog post introductions",
      "Create product descriptions for online store"
    ]
  },
  {
    category: "Analysis",
    icon: BarChart3,
    color: "from-green-500 to-green-600",
    prompts: [
      "Analyze customer feedback sentiment",
      "Summarize market research reports",
      "Extract key insights from survey data"
    ]
  },
  {
    category: "Code",
    icon: Code,
    color: "from-amber-500 to-amber-600",
    prompts: [
      "Generate API documentation from code",
      "Create unit tests for JavaScript functions",
      "Review code for security vulnerabilities"
    ]
  }
];

export default function PromptSuggestions({ onSuggestionClick }) {
  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Prompt Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded bg-gradient-to-r ${category.color} bg-opacity-20`}>
                <category.icon className="w-4 h-4 text-white" />
              </div>
              <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/20">
                {category.category}
              </Badge>
            </div>
            <div className="space-y-1">
              {category.prompts.map((prompt, promptIndex) => (
                <Button
                  key={promptIndex}
                  variant="ghost"
                  className="w-full text-left justify-start text-xs text-blue-200 hover:text-white hover:bg-white/5 h-auto p-2"
                  onClick={() => onSuggestionClick(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
} 
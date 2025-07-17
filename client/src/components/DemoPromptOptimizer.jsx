import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import demoApi from '@/lib/demoApi';

export default function DemoPromptOptimizer() {
  const [inputPrompt, setInputPrompt] = useState('');
  const [optimizedJson, setOptimizedJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleOptimize = async () => {
    if (!inputPrompt.trim()) {
      toast.error('Please enter a prompt to optimize');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await demoApi.convertPrompt(inputPrompt);
      
      // Format the response for display
      const formattedResponse = {
        optimized_prompt: result.generatedJson,
        metadata: {
          model: result.llmProvider,
          original_prompt: result.originalPrompt,
          is_demo: result.isDemo
        }
      };

      setOptimizedJson(JSON.stringify(formattedResponse, null, 2));
      toast.success('Prompt optimized successfully!');
      
    } catch (error) {
      if (error.message.includes('Demo limit reached')) {
        setShowUpgradeModal(true);
      } else {
        toast.error('Failed to optimize prompt. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(optimizedJson);
      setCopied(true);
      toast.success('JSON copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleUpgrade = () => {
    // This will trigger the login flow
    window.location.href = '/#login';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Your Natural Language Prompt
            </label>
            <Textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Describe what you want the AI to do... (e.g., 'Write a professional email to schedule a meeting')"
              className="min-h-[350px] bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
            />
          </div>
          
          <Button
            onClick={handleOptimize}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Optimizing...
              </div>
            ) : (
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Optimize Prompt
              </div>
            )}
          </Button>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-white">
              Optimized JSON Output
            </label>
            {optimizedJson && (
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="sm"
                className="text-blue-300 hover:text-white hover:bg-white/10"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            )}
          </div>
          
          <div className="bg-black/30 border border-white/10 rounded-lg p-4 min-h-[350px]">
            {optimizedJson ? (
              <pre className="text-sm text-green-300 overflow-auto whitespace-pre-wrap">
                {optimizedJson}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Your optimized JSON will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                Free Trial Complete!
              </h3>
              
              <p className="text-blue-200 mb-6">
                You've used all 3 free optimizations. Sign up now to unlock unlimited prompt optimization with advanced features!
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Sign Up for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button
                  onClick={() => setShowUpgradeModal(false)}
                  variant="ghost"
                  className="w-full text-blue-300 hover:text-white hover:bg-white/10"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
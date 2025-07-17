import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import DemoPromptOptimizer from "@/components/DemoPromptOptimizer";
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Code, 
  ShieldCheck, 
  Layers
} from 'lucide-react';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay }}
    className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center"
  >
    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-blue-200">{description}</p>
  </motion.div>
);

export default function Landing() {
  const { login, isAuthenticated, isLoading } = useKindeAuth()
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-x-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold">PromptCraft</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleLogin}
              className="text-white hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:scale-105 transition-all duration-300 font-medium px-6 py-2 rounded-lg border border-transparent hover:border-white/30 hover:shadow-lg hover:shadow-white/10 backdrop-blur-sm hover:cursor-pointer"
            >
              Login
            </Button>
            <Button
              onClick={handleLogin}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg px-6 py-2 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 border border-transparent hover:border-blue-400/30 hover:cursor-pointer"
            >
              Sign Up <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative min-h-screen flex items-center justify-center pt-24 pb-16">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 mb-6 py-2 px-4 rounded-full">
              <Zap className="w-4 h-4 mr-2" />
              Try It Now - No Sign Up Required
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Optimize Your Prompts,
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Unleash AI's Full Potential
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-blue-200 mb-4">
              Instantly convert natural language into structured JSON, ensuring reliable and robust interactions with any Large Language Model.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <DemoPromptOptimizer />
          </motion.div>
        </div>
      </main>



      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why PromptCraft?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-white" />}
              title="Instant Conversion"
              description="Transform prompts to structured JSON in milliseconds."
              delay={0.1}
            />
            <FeatureCard
              icon={<Layers className="w-8 h-8 text-white" />}
              title="Fallback Mechanism"
              description="Ensures your application remains robust even if a primary LLM fails."
              delay={0.2}
            />
            <FeatureCard
              icon={<Code className="w-8 h-8 text-white" />}
              title="Developer-Friendly"
              description="Seamlessly integrate with any project via a simple, clean JSON output."
              delay={0.3}
            />
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-white" />}
              title="Reliable & Secure"
              description="Built for production environments with security and reliability in mind."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-blue-200">
          <p>&copy; {new Date().getFullYear()} PromptCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Custom CSS for background grid pattern
const style = document.createElement('style');
style.innerHTML = `
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}
`;
document.head.appendChild(style); 
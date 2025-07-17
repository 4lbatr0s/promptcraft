import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { 
  MessageSquare, 
  User, 
  History, 
  Settings, 
  Sparkles,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Prompt Optimizer",
    url: "/dashboard",
    icon: MessageSquare,
  },
  {
    title: "History",
    url: "/history",
    icon: History,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useKindeAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar className="border-r border-white/10 bg-black/20 backdrop-blur-xl">
            <SidebarHeader className="border-b border-white/10 p-6">
              <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">PromptCraft</h2>
                  <p className="text-xs text-blue-200">AI Prompt Optimizer</p>
                </div>
              </Link>
            </SidebarHeader>
            
            <SidebarContent className="p-3">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-blue-200 uppercase tracking-wider px-3 py-2">
                  Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`mb-1 transition-all duration-200 rounded-xl hover:scale-105 ${
                            location.pathname === item.url 
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-400/30 shadow-lg' 
                              : 'text-white hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:text-white hover:shadow-md hover:border hover:border-blue-400/20'
                          }`}
                          style={{ color: 'white' }}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3 w-full text-inherit" style={{ color: 'white' }}>
                            <item.icon className={`w-5 h-5 ${location.pathname === item.url ? 'text-blue-300' : 'text-white'}`} style={{ color: location.pathname === item.url ? '#93c5fd' : 'white' }} />
                            <span className="font-medium text-inherit" style={{ color: 'white' }}>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                  {user?.given_name && user?.family_name && user.given_name !== 'undefined' && user.family_name !== 'undefined' ? (
                    <span className="text-white font-semibold text-sm">
                      {user.given_name.charAt(0).toUpperCase()}{user.family_name.charAt(0).toUpperCase()}
                    </span>
                  ) : user?.email && user.email !== 'undefined' ? (
                    <span className="text-white font-semibold text-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate" title={user?.given_name && user?.family_name && user.given_name !== 'undefined' && user.family_name !== 'undefined' ? `${user.given_name} ${user.family_name}` : user?.email && user.email !== 'undefined' ? user.email : "Welcome"}>
                    {user?.given_name && user?.family_name && user.given_name !== 'undefined' && user.family_name !== 'undefined' ? `${user.given_name} ${user.family_name}` : user?.email && user.email !== 'undefined' ? user.email : "Welcome"}
                  </p>
                  <p className="text-xs text-blue-200 truncate">
                    {isAuthenticated ? "Ready to optimize prompts" : "Please log in"}
                  </p>
                </div>
                {isAuthenticated && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout} 
                    className="text-blue-200 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-200 rounded-lg p-2 hover:shadow-md"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-6 py-4 md:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200" />
                  <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                    <h1 className="text-xl font-bold text-white">PromptCraft</h1>
                  </Link>
                </div>
                {isAuthenticated && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout} 
                    className="text-blue-200 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-200 rounded-lg p-2 hover:shadow-md hover:cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
} 
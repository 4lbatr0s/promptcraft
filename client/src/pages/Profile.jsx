import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Edit, Save, X
} from "lucide-react";
import { motion } from "framer-motion";
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch.js'
import urlResolver from '../lib/urlResolver.js'
import { format } from "date-fns";
// Import new components
import ProfileStats from "@/components/profile/ProfileStats";
import UsageChart from "@/components/profile/UsageChart";

const RecentActivity = ({ conversions }) => (
  <Card className="bg-black/20 backdrop-blur-xl border-white/10">
    <CardHeader>
      <CardTitle className="text-white flex items-center gap-2">
        <X className="w-5 h-5 text-amber-400" />
        Recent Activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {conversions.slice(0, 5).map((conversion, index) => (
          <div key={conversion._id} className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-white text-sm truncate">{conversion.originalPrompt}</p>
              <p className="text-blue-200 text-xs">
                {format(new Date(conversion.createdAt), "MMM d, yyyy 'at' HH:mm")}
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {conversion.llmProvider}
            </Badge>
          </div>
        ))}
        {conversions.length === 0 && (
          <p className="text-blue-200 text-center py-4">No recent activity</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function Profile() {
  const { user: kindeUser, isAuthenticated, isLoading, logout } = useKindeAuth()
  const [user, setUser] = useState(null);
  const [conversions, setConversions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const authenticatedFetch = useAuthenticatedFetch();

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
      loadConversions();
    }
  }, [isAuthenticated]);

  const loadUserData = async () => {
    try {
      const response = await authenticatedFetch(urlResolver.getProfileUrl());
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        setEditedUser(data.data);
      } else {
        // Fallback to Kinde user data
        setUser({
          full_name: kindeUser?.givenName + ' ' + kindeUser?.familyName,
          email: kindeUser?.email,
          role: 'User',
          created_date: new Date().toISOString()
        });
        setEditedUser({
          full_name: kindeUser?.givenName + ' ' + kindeUser?.familyName,
          email: kindeUser?.email,
          role: 'User',
          created_date: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      // Fallback to Kinde user data
      setUser({
        full_name: kindeUser?.givenName + ' ' + kindeUser?.familyName,
        email: kindeUser?.email,
        role: 'User',
        created_date: new Date().toISOString()
      });
      setEditedUser({
        full_name: kindeUser?.givenName + ' ' + kindeUser?.familyName,
        email: kindeUser?.email,
        role: 'User',
        created_date: new Date().toISOString()
      });
    } finally {
      setIsLoadingData(false);
    }
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

  const handleSave = async () => {
    try {
      const response = await authenticatedFetch(urlResolver.getProfileUrl(), {
        method: 'PUT',
        body: JSON.stringify(editedUser)
      });
      if (response.ok) {
        setUser(editedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update user data:", error);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to continue</h1>
          <p className="text-blue-200">You need to be authenticated to access your profile.</p>
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
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-blue-200">
            Manage your account and view your usage statistics
          </p>
        </motion.div>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-white">
                  {user?.full_name || kindeUser?.givenName + ' ' + kindeUser?.familyName || "User"}
                </CardTitle>
                <p className="text-blue-200 text-sm">
                  {user?.email || kindeUser?.email}
                </p>
                <Badge 
                  variant="outline" 
                  className="bg-green-500/20 text-green-300 border-green-500/30 mx-auto mt-2"
                >
                  {user?.role || "User"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-blue-200">Full Name</label>
                      <Input
                        value={editedUser.full_name || ""}
                        onChange={(e) => setEditedUser({...editedUser, full_name: e.target.value})}
                        className="bg-black/30 border-white/20 text-white mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="border-white/20 text-white hover:bg-white/5"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-blue-200">Member Since</p>
                      <p className="text-white">
                        {format(new Date(user?.created_date || new Date()), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-blue-200">Last Active</p>
                      <p className="text-white">
                        {format(new Date(), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/5"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Quick Actions */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-white hover:bg-white/5"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-white hover:bg-white/5"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-start border-red-500/30 text-red-300 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileStats conversions={conversions} />
            <UsageChart conversions={conversions} />
            <RecentActivity conversions={conversions} />
          </div>
        </div>
      </div>
    </div>
  );
} 
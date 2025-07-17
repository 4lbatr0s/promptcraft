import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'
import Layout from "./Layout.jsx";

export default function AuthenticatedLayout({ children, currentPageName }) {
  const { isAuthenticated, isLoading } = useKindeAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to landing page
  }

  return (
    <Layout currentPageName={currentPageName}>
      {children}
    </Layout>
  );
} 
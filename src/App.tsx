
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import SessionManager from "@/components/SessionManager";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SessionsPage from "./pages/SessionsPage";
import RedisService from "./services/RedisService";
import { toast } from "@/hooks/use-toast";

// Create a client
const queryClient = new QueryClient();

// Redis configuration
const redisConfig = {
  url: import.meta.env.VITE_REDIS_URL || 'redis://localhost:6379',
  password: import.meta.env.VITE_REDIS_PASSWORD,
  username: import.meta.env.VITE_REDIS_USERNAME,
};

const App = () => {
  useEffect(() => {
    // Initialize Redis connection
    const initRedis = async () => {
      try {
        const redisService = RedisService.getInstance();
        await redisService.connect(redisConfig);
        console.log("Redis service initialized successfully");
      } catch (error) {
        console.error('Failed to initialize Redis:', error);
        toast({
          title: "Redis Connection Issue",
          description: "Using local storage fallback for session management",
          variant: "destructive",
        });
      }
    };
    
    initRedis();
    
    // Cleanup function
    return () => {
      const cleanupRedis = async () => {
        try {
          const redisService = RedisService.getInstance();
          await redisService.disconnect();
        } catch (error) {
          console.error('Error disconnecting Redis:', error);
        }
      };
      
      cleanupRedis();
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <SessionManager>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/sessions" element={<SessionsPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SessionManager>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

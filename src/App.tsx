
import React, { useEffect, useState } from "react";
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
import ProfilePage from "./pages/ProfilePage";
import RedisService from "./services/RedisService";
import { toast } from "@/hooks/use-toast";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Redis configuration
const redisConfig = {
  url: import.meta.env.VITE_REDIS_URL || 'redis://localhost:6379',
  password: import.meta.env.VITE_REDIS_PASSWORD,
  username: import.meta.env.VITE_REDIS_USERNAME,
};

const App = () => {
  const [redisInitialized, setRedisInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize Redis connection
    const initRedis = async () => {
      try {
        const redisService = RedisService.getInstance();
        
        // Only attempt connection in production or if VITE_ENABLE_REDIS is set to true
        if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_REDIS === 'true') {
          await redisService.connect(redisConfig);
          console.log("Redis service initialized successfully");
        } else {
          // In development, use the browser mock directly
          await redisService.connect({
            url: 'browser-mock'
          });
          console.log("Using browser Redis mock for development");
        }
        
        setRedisInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Redis:', error);
        toast({
          title: "Redis Connection Issue",
          description: "Using local storage fallback for session management",
          variant: "destructive",
        });
        
        // Use browser mock as fallback
        try {
          const redisService = RedisService.getInstance();
          await redisService.connect({
            url: 'browser-mock'
          });
          setRedisInitialized(true);
        } catch (fallbackError) {
          console.error('Failed to initialize browser Redis mock:', fallbackError);
        }
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
  
  // Only render the app once Redis (or the fallback) is initialized
  if (!redisInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Initializing application...</p>
        </div>
      </div>
    );
  }
  
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
                <Route path="/profile" element={<ProfilePage />} />
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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import CreateRoadmap from "./pages/CreateRoadmap";
import SearchResults from "./pages/SearchResults";
import CreatePost from "./pages/CreatePost";
import MyRoadmaps from "./pages/MyRoadmaps";
import Communities from "./pages/Communities";
import NewVideos from "./pages/NewVideos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/create-roadmap" element={<ProtectedRoute><CreateRoadmap /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
          <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/roadmaps" element={<ProtectedRoute><MyRoadmaps /></ProtectedRoute>} />
          <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
          <Route path="/new-videos" element={<ProtectedRoute><NewVideos /></ProtectedRoute>} />
          <Route path="/my-posts" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/saved-posts" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

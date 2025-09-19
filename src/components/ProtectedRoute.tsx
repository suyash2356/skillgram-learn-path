import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Store the intended destination before redirecting to login
      const redirectTo = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`);
    }
  }, [user, loading, navigate, location]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, render the protected content
  if (user) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
};

export default ProtectedRoute;
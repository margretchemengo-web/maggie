import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CarFront } from 'lucide-react';

export function ProtectedRoute() {
  const { isAuthed, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <CarFront className="h-12 w-12 text-primary-500 animate-bounce" />
          <p className="text-slate-500 font-medium">Loading AutoHire Pro...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import Loader from './Loader';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                <Loader size="lg" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; // Unauthorized
    }

    return <Outlet />;
};

export default ProtectedRoute;

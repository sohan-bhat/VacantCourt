import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute: React.FC = () => {
    const { currentUser, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!currentUser) {
        return <Navigate to="/auth" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
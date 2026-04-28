import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PageMeta from './PageMeta';

const Page404: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Page Not Found"
                description="Oops! The page you are looking for does not exist. Let's get you back on track to finding an available court."
            />
            <Box
                className="not-found-container"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    minHeight: 'calc(100vh - 120px)',
                    py: 4,
                }}
            >
                <Container maxWidth="sm">
                    <ReportProblemIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        404 - Page Not Found
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </Typography>
                    <Button
                        component={RouterLink}
                        to="/"
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            px: 4,
                            py: 1.5,
                        }}
                    >
                        Go Back to Homepage
                    </Button>
                </Container>
            </Box>
        </>
    );
};

export default Page404;
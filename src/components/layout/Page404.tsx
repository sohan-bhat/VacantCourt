import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import PageMeta from './PageMeta';
import CourtGlyph from '../brand/CourtGlyph';
import { tokens } from '../../theme';

const Page404: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Page Not Found"
                description="This page doesn't exist. Head back to find an open court."
            />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    minHeight: '60vh',
                    py: 6,
                }}
            >
                <Box sx={{ width: 180, mb: 4, opacity: 0.9 }}>
                    <CourtGlyph status="unconfigured" />
                </Box>
                <Typography sx={{ fontFamily: tokens.fontMono, fontSize: '0.8125rem', color: 'text.secondary', mb: 1.5 }}>
                    404 · Out of bounds
                </Typography>
                <Typography component="h1" variant="h3" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                    This page doesn’t exist
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 420 }}>
                    The link may be broken, or the page may have moved.
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ mt: 4 }}>
                    <Button component={RouterLink} to="/dashboard" variant="contained">Find a court</Button>
                    <Button component={RouterLink} to="/" variant="outlined">Go to homepage</Button>
                </Stack>
            </Box>
        </>
    );
};

export default Page404;

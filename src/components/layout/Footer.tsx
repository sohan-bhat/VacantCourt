import { Box, Container, Typography, Stack, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
    return (
        <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', pt: 4, pb: 3, mt: 'auto' }}>
            <Container maxWidth="lg">
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'center', md: 'flex-start' }}
                    spacing={3}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <img src="/ground.png" alt="VacantCourt" style={{ height: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            VacantCourt
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={3}>
                        <Link component={RouterLink} to="/privacy" color="inherit" underline="hover" variant="body2">
                            Privacy Policy
                        </Link>
                        <Link component={RouterLink} to="/tos" color="inherit" underline="hover" variant="body2">
                            Terms of Service
                        </Link>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.15)' }} />

                <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.7 }}>
                    &copy; {new Date().getFullYear()} VacantCourt. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
}

export default Footer;

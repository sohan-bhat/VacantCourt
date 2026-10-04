import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const links = [
    { label: 'Courts', to: '/dashboard' },
    { label: 'Privacy', to: '/privacy' },
    { label: 'Terms', to: '/tos' },
];

function Footer() {
    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', mt: 'auto' }}>
            <Container maxWidth="lg">
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                    sx={{ py: 4 }}
                >
                    <Typography variant="body2" color="text.secondary">
                        &copy; {new Date().getFullYear()} VacantCourt
                    </Typography>
                    <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                        {links.map(link => (
                            <Link key={link.to} component={RouterLink} to={link.to} variant="body2" color="text.secondary">
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="mailto:officialvacantcourt@gmail.com"
                            variant="body2"
                            color="text.secondary"
                            underline="always"
                            sx={{ textDecorationStyle: 'wavy', textUnderlineOffset: '5px', textDecorationThickness: '1px' }}
                        >
                            officialvacantcourt@gmail.com
                        </Link>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}

export default Footer;

import React from 'react';
import { Container, Typography, Box, Paper, Link, Alert } from '@mui/material';
import PageMeta from '../layout/PageMeta';

const YOUR_CONTACT_EMAIL = 'officialvacantcourt@Vacant';
const YOUR_WEBSITE_URL = 'https://vacantcourt.netlify.app';

const PrivacyPolicy: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Privacy Policy"
                description="Review the VacantCourt Privacy Policy to understand how we collect, use, and protect your personal information when you use our services."
            />
            <Box sx={{ bgcolor: 'grey.100', py: 5 }}>
                <Container maxWidth="md">
                    <Paper elevation={3} sx={{ p: { xs: 3, md: 5 } }}>
                        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Privacy Policy
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Last Updated: July 3, 2025
                        </Typography>

                        <Typography paragraph>
                            Welcome to VacantCourt ("we," "us," or "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, {YOUR_WEBSITE_URL}, and use our services.
                        </Typography>

                        <Box sx={{ my: 4 }}>
                            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                                1. Information We Collect
                            </Typography>
                            <Typography paragraph>
                                We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                            </Typography>
                            <Typography component="div">
                                <ul>
                                    <li>
                                        <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and password (which is hashed and never stored in plain text), that you voluntarily give to us when you register with the Site.
                                    </li>
                                    <li>
                                        <strong>Third-Party Data:</strong> If you register using a third-party service like Google, we may receive personal information such as your name and email address from that service.
                                    </li>
                                    <li>
                                        <strong>Notification Data:</strong> When you request to be notified about a court's availability, we store a record of your user ID, email address, and the specific court you are interested in.
                                    </li>
                                    <li>
                                        <strong>Usage Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Site.
                                    </li>
                                </ul>
                            </Typography>
                        </Box>

                        <Box sx={{ my: 4 }}>
                            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                                2. How We Use Your Information
                            </Typography>
                            <Typography paragraph>
                                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                            </Typography>
                            <Typography component="div">
                                <ul>
                                    <li>Create and manage your account.</li>
                                    <li>Send you notifications about court availability as you have requested.</li>
                                    <li>Send you a password reset link if you forget your password.</li>
                                    <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                                    <li>Respond to your comments and questions and provide customer service.</li>
                                </ul>
                            </Typography>
                        </Box>

                        <Box sx={{ my: 4 }}>
                            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                                3. Disclosure of Your Information
                            </Typography>
                            <Typography paragraph>
                                We do not sell your personal information. We may share information we have collected about you in certain situations with trusted third-party service providers to perform services for us or on our behalf, including:
                            </Typography>
                            <Typography component="div">
                                <ul>
                                    <li>
                                        <strong>Firebase (Google Cloud):</strong> We use Firebase for user authentication, database hosting, and backend functions. For more information, please see the <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</Link>.
                                    </li>
                                    <li>
                                        <strong>Netlify:</strong> Our website is hosted on Netlify, which also runs our serverless functions. You can view the <Link href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">Netlify Privacy Policy</Link> for more details.
                                    </li>
                                    <li>
                                        <strong>EmailJS:</strong> We use EmailJS to send court availability notifications to your email address. We only provide EmailJS with the necessary data to send the email on our behalf. Please review the <Link href="https://www.emailjs.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">EmailJS Privacy Policy</Link>.
                                    </li>
                                </ul>
                            </Typography>
                        </Box>

                        <Box sx={{ my: 4 }}>
                            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                                4. Security of Your Information
                            </Typography>
                            <Typography paragraph>
                                We use administrative, technical, and physical security measures to help protect your personal information. All traffic to and from our website is encrypted using SSL/TLS. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                            </Typography>
                        </Box>

                        <Box sx={{ my: 4 }}>
                            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                                5. Your Rights and Choices
                            </Typography>
                            <Typography paragraph>
                                You have the right to review, update, or request deletion of your personal information. You may review and change your account information at any time by logging into your account settings (once this feature is available). You may also request to terminate your account and delete your data by contacting us at {YOUR_CONTACT_EMAIL}.
                            </Typography>
                        </Box>

                        <Box sx={{ my: 4 }}>
                            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                                6. Children's Privacy
                            </Typography>
                            <Typography paragraph>
                                Our services are not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13.
                            </Typography>
                        </Box>

                        <Box sx={{ my: 4 }}>
                            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                                7. Changes to This Privacy Policy
                            </Typography>
                            <Typography paragraph>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                            </Typography>
                        </Box>

                        <Box sx={{ my: 4 }}>
                            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                                8. Contact Us
                            </Typography>
                            <Typography paragraph>
                                If you have any questions or concerns about this Privacy Policy, please contact us at:
                                <br />
                                <Link href={`mailto:${YOUR_CONTACT_EMAIL}`}>{YOUR_CONTACT_EMAIL}</Link>
                            </Typography>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </>
    );
};

export default PrivacyPolicy;
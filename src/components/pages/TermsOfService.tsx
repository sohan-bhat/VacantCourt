import React from 'react';
import { Container, Typography, Box, Link } from '@mui/material';
import PageMeta from '../layout/PageMeta';

const YOUR_CONTACT_EMAIL = 'officialvacantcourt@gmail.com';
const YOUR_WEBSITE_URL = 'https://vacantcourt.netlify.app';
const YOUR_COMPANY_NAME = 'VacantCourt';
const GOVERNING_LAW_STATE = 'Texas';
const GOVERNING_LAW_COUNTRY = 'United States';

const TermsOfService: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Terms of Service"
                description="Read the official Terms of Service for using VacantCourt. This agreement outlines your rights and responsibilities when accessing our website and services."
            />
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    py: { xs: 6, md: 10 },
                    '& h1': { fontSize: { xs: '2.25rem', md: '3rem' }, letterSpacing: '-0.035em', mb: 1 },
                    '& h2': { fontSize: '1.25rem', fontWeight: 650, letterSpacing: '-0.015em', mt: 5, mb: 1.5 },
                    '& h3': { fontSize: '1.05rem', fontWeight: 650, mt: 3 },
                    '& p, & li': { color: 'text.secondary', lineHeight: 1.75 },
                    '& li': { mb: 1 },
                    '& strong': { color: 'text.primary', fontWeight: 600 },
                    '& ul': { pl: 2.5 },
                }}
            >
                <Container maxWidth="md" sx={{ maxWidth: { md: 760 } }}>
                    <Box component="article">
                        <Typography variant="h3" component="h1">
                            Terms of Service
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Last Updated: July 3, 2025
                        </Typography>

                        <Typography paragraph>
                            These Terms of Service ("Terms") govern your access to and use of the {YOUR_COMPANY_NAME} website at {<Link href={`${YOUR_WEBSITE_URL}`}>{YOUR_WEBSITE_URL}</Link>} and its related services (collectively, the "Service"). Please read these Terms carefully before using the Service.
                        </Typography>
                        <Typography variant="h6" component="h3" gutterBottom>
                            By accessing or using the Service, you agree to be bound by these Terms.
                        </Typography>

                        <Box component="section">
                            <Typography variant="h5" component="h2">
                                1. User Accounts
                            </Typography>
                            <Typography component="div">
                                <ul>
                                    <li>
                                        <strong>Account Creation:</strong> To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.
                                    </li>
                                    <li>
                                        <strong>Account Responsibility:</strong> You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                                    </li>
                                    <li>
                                        <strong>Account Termination:</strong> We reserve the right to suspend or terminate your account at any time, with or without cause or notice to you, for conduct that we believe violates these Terms.
                                    </li>
                                </ul>
                            </Typography>
                        </Box>

                        <Box component="section">
                            <Typography variant="h5" component="h2">
                                2. Acceptable Use
                            </Typography>
                            <Typography paragraph>
                                You agree not to use the Service for any unlawful purpose or in any way that could harm, disable, overburden, or impair the Service. Prohibited activities include, but are not limited to:
                            </Typography>
                            <Typography component="div">
                                <ul>
                                    <li>Attempting to gain unauthorized access to the Service or its related systems.</li>
                                    <li>Using any automated system, including "robots," "spiders," or "offline readers," to access the Service in a manner that sends more request messages to our servers than a human can reasonably produce in the same period.</li>
                                    <li>Engaging in any data mining, data harvesting, data extracting, or any other similar activity in relation to this Service.</li>
                                    <li>Using the Service to transmit any unsolicited advertising, junk mail, spam, or chain letters.</li>
                                </ul>
                            </Typography>
                        </Box>

                        <Box component="section">
                            <Typography variant="h5" component="h2">
                                3. Service Content and Availability
                            </Typography>
                            <Typography paragraph>
                                The information regarding court locations, availability, and other details is provided for informational purposes only. We do not guarantee the accuracy, completeness, or timeliness of this information. You are responsible for verifying any information before relying on it. The Service is provided "as is" and "as available" without any warranties of any kind.
                            </Typography>
                        </Box>

                        <Box component="section">
                            <Typography variant="h5" component="h2">
                                4. Intellectual Property
                            </Typography>
                            <Typography paragraph>
                                The Service and its original content, features, and functionality are and will remain the exclusive property of {YOUR_COMPANY_NAME} and its licensors. The Service is protected by copyright, trademark, and other laws of both the {GOVERNING_LAW_COUNTRY} and foreign countries. Our trademarks may not be used in connection with any product or service without our prior written consent.
                            </Typography>
                        </Box>

                        <Box component="section">
                            <Typography variant="h5" component="h2">
                                5. Limitation of Liability
                            </Typography>
                            <Typography paragraph sx={{ fontWeight: 'bold' }}>
                                To the fullest extent permitted by law, in no event will {YOUR_COMPANY_NAME}, nor its directors, employees, or partners, be liable to you for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the Service, whether based on warranty, contract, tort (including negligence), or any other legal theory.
                            </Typography>
                        </Box>

                        <Box component="section">
                            <Typography variant="h5" component="h2">
                                6. Governing Law
                            </Typography>
                            <Typography paragraph>
                                These Terms shall be governed and construed in accordance with the laws of the State of {GOVERNING_LAW_STATE}, {GOVERNING_LAW_COUNTRY}, without regard to its conflict of law provisions.
                            </Typography>
                        </Box>

                        <Box component="section">
                            <Typography variant="h5" component="h2">
                                7. Changes to Terms
                            </Typography>
                            <Typography paragraph>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                            </Typography>
                        </Box>

                        <Box component="section">
                            <Typography variant="h5" component="h2">
                                8. Contact Us
                            </Typography>
                            <Typography paragraph>
                                If you have any questions about these Terms, please contact us at:
                                <br />
                                <Link href={`mailto:${YOUR_CONTACT_EMAIL}`}>{YOUR_CONTACT_EMAIL}</Link>
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </>
    );
};

export default TermsOfService;
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, Container, Typography, Button, Card, 
  CardContent, useTheme, Stack
} from '@mui/material';
import {
  ShoppingCart, Brain, Smartphone, Shield, 
  Users, Star, CheckCircle
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

// Hero Video Component
const HeroVideo: React.FC<{ onGetStarted: () => void; onSignIn: () => void }> = ({ onGetStarted, onSignIn }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      width: '100%', 
      height: { xs: '300px', sm: '400px', md: '500px', lg: '600px' },
      mx: 'auto',
      mb: 4,
      position: 'relative',
      borderRadius: { xs: '8px', sm: '12px', md: '16px' },
      overflow: 'hidden',
      boxShadow: theme.shadows[8],
    }}>
      <video
        src="/hero-demo.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      
      {/* Overlay with transparent buttons */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'flex-end',
          gap: { xs: 1, sm: 2 },
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={onGetStarted}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: { xs: '1rem', sm: '1.1rem' },
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            background: 'rgba(255,255,255,0.9)',
            color: theme.palette.primary.main,
            fontWeight: 600,
            '&:hover': {
              background: 'rgba(255,255,255,1)',
            },
          }}
        >
          Get Started Free
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={onSignIn}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: { xs: '1rem', sm: '1.1rem' },
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            borderColor: 'rgba(255,255,255,0.3)',
            '&:hover': {
              background: 'rgba(255,255,255,0.2)',
              borderColor: 'rgba(255,255,255,0.5)',
            },
          }}
        >
          Sign In
        </Button>
      </Box>
    </Box>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const theme = useTheme();

  const features = [
    { icon: <Brain size={32} />, title: 'AI-Powered', description: 'Smart suggestions for your shopping lists' },
    { icon: <ShoppingCart size={32} />, title: 'Smart Organization', description: 'Organize items by categories automatically' },
    { icon: <Smartphone size={32} />, title: 'Mobile Optimized', description: 'Access anywhere, anytime on any device' },
    { icon: <Shield size={32} />, title: 'Secure & Private', description: 'Your data is protected and encrypted' },
    { icon: <Users size={32} />, title: 'Share Lists', description: 'Collaborate with family and friends' },
    { icon: <Star size={32} />, title: 'Premium Experience', description: 'Advanced features and customization' },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          minHeight: '100vh',
          textAlign: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 8
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Smart Shopping Made Simple
            </Typography>

            {/* Hero Video */}
            <HeroVideo onGetStarted={onGetStarted} onSignIn={onSignIn} />

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 6 }}>
              {[
                'Free to start',
                'No credit card required',
                'Setup in 2 minutes'
              ].map((benefit, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <CheckCircle size={16} color={theme.palette.success.main} />
                  <Typography variant="caption">{benefit}</Typography>
                </Stack>
              ))}
            </Stack>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 3,
              mt: 4 
            }}>
              {features.map((feature, index) => (
                <Card
                  key={index}
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '12px',
                        background: `${theme.palette.primary.main}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
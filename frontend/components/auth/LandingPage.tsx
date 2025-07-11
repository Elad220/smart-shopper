import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, Container, Typography, Button, Card, 
  CardContent, useTheme, Stack, Chip 
} from '@mui/material';
import {
  ShoppingCart, Brain, Smartphone, Shield, 
  Users, Star, ArrowRight, CheckCircle
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

// Animated Shopping List Illustration Component
const AnimatedShoppingIllustration: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '400px', 
      height: '300px', 
      mx: 'auto',
      mb: 4,
      position: 'relative'
    }}>
      <svg
        viewBox="0 0 400 300"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.1" />
            <stop offset="100%" stopColor={theme.palette.secondary.main} stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.background.paper} />
            <stop offset="100%" stopColor={theme.palette.background.default} />
          </linearGradient>
        </defs>
        
        {/* Animated shopping list card */}
        <motion.rect
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          x="50"
          y="20"
          width="300"
          height="200"
          rx="12"
          fill="url(#cardGradient)"
          stroke={theme.palette.divider}
          strokeWidth="2"
        />
        
        {/* Animated title */}
        <motion.text
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          x="70"
          y="50"
          fontSize="16"
          fontWeight="bold"
          fill={theme.palette.text.primary}
        >
          Shopping List
        </motion.text>
        
        {/* Animated checkboxes and items */}
        {[
          { text: "Milk", y: 80, delay: 0.7 },
          { text: "Bread", y: 110, delay: 0.9 },
          { text: "Eggs", y: 140, delay: 1.1 },
          { text: "Bananas", y: 170, delay: 1.3 }
        ].map((item, index) => (
          <g key={index}>
            {/* Checkbox */}
            <motion.rect
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: item.delay }}
              x="70"
              y={item.y - 15}
              width="16"
              height="16"
              rx="3"
              fill="none"
              stroke={theme.palette.primary.main}
              strokeWidth="2"
            />
            
            {/* Checkmark animation */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: item.delay + 0.2 }}
              d={`M 74 ${item.y - 7} L 78 ${item.y - 3} L 82 ${item.y - 11}`}
              stroke={theme.palette.success.main}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Item text */}
            <motion.text
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: item.delay + 0.1 }}
              x="100"
              y={item.y}
              fontSize="14"
              fill={theme.palette.text.primary}
            >
              {item.text}
            </motion.text>
          </g>
        ))}
        
        {/* Animated shopping cart */}
        <motion.g
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          {/* Cart body */}
          <rect
            x="320"
            y="180"
            width="60"
            height="40"
            rx="8"
            fill={theme.palette.primary.main}
            opacity="0.9"
          />
          
          {/* Cart handle */}
          <rect
            x="325"
            y="175"
            width="50"
            height="8"
            rx="4"
            fill={theme.palette.primary.dark}
          />
          
          {/* Cart wheels */}
          <circle
            cx="335"
            cy="220"
            r="6"
            fill={theme.palette.primary.dark}
          />
          <circle
            cx="365"
            cy="220"
            r="6"
            fill={theme.palette.primary.dark}
          />
          
          {/* Animated items in cart */}
          <motion.circle
            animate={{ 
              y: [0, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
            cx="340"
            cy="195"
            r="4"
            fill={theme.palette.secondary.main}
          />
          <motion.circle
            animate={{ 
              y: [0, -3, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              repeatType: "reverse",
              delay: 0.5
            }}
            cx="355"
            cy="195"
            r="3"
            fill={theme.palette.secondary.light}
          />
        </motion.g>
        
        {/* Floating AI brain icon */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
        >
          <motion.circle
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
            cx="80"
            cy="250"
            r="20"
            fill={theme.palette.secondary.main}
            opacity="0.8"
          />
          <motion.text
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
            x="75"
            y="255"
            fontSize="16"
            fill="white"
            textAnchor="middle"
          >
            🧠
          </motion.text>
        </motion.g>
        
        {/* Animated sparkles */}
        {[1, 2, 3].map((i) => (
          <motion.circle
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5
            }}
            cx={200 + i * 30}
            cy={50 + i * 20}
            r="3"
            fill={theme.palette.warning.main}
          />
        ))}
      </svg>
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
            <Chip
              label="🚀 New AI Features Available"
              color="primary"
              variant="outlined"
              sx={{ mb: 3, borderRadius: '20px' }}
            />
            
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
            
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
            >
              Transform the way you shop with AI-powered lists, intelligent suggestions, 
              and seamless organization. Never forget an item again.
            </Typography>

            {/* Animated Illustration */}
            <AnimatedShoppingIllustration />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 6 }}>
              <Button
                variant="contained"
                size="large"
                onClick={onGetStarted}
                endIcon={<ArrowRight size={20} />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  px: 4,
                  py: 1.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
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
                  fontSize: '1.1rem',
                  px: 4,
                  py: 1.5,
                }}
              >
                Sign In
              </Button>
            </Stack>

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
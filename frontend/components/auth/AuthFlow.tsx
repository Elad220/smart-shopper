import React, { useState } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import LandingPage from './LandingPage';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Header from '../layout/Header';

type AuthView = 'landing' | 'login' | 'register';

const AuthFlow: React.FC = () => {
  const [view, setView] = useState<AuthView>('landing');
  const { login, register, isLoading } = useAuth();
  const { mode, toggleMode } = useTheme();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    const result = await login(credentials);
    return result;
  };

  const handleRegister = async (data: { username: string; email: string; password: string }) => {
    const result = await register(data);
    if (result.success) {
      setView('login');
    }
    return result;
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: 'tween' as const,
    duration: 0.4
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {view !== 'landing' && (
        <Header 
          mode={mode} 
          onToggleMode={toggleMode} 
          isAuthenticated={false}
        />
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {view === 'landing' && (
            <LandingPage
              onGetStarted={() => setView('register')}
              onSignIn={() => setView('login')}
            />
          )}
          
          {view === 'login' && (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => setView('register')}
              isLoading={isLoading}
            />
          )}
          
          {view === 'register' && (
            <RegisterForm
              onRegister={handleRegister}
              onSwitchToLogin={() => setView('login')}
              isLoading={isLoading}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default AuthFlow;
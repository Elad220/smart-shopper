import React from 'react';
import { Box, useTheme, SxProps, Theme } from '@mui/material';
import { motion } from 'framer-motion';

interface ModernSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'white';
  sx?: SxProps<Theme>;
}

const ModernSpinner: React.FC<ModernSpinnerProps> = ({
  size = 'medium',
  variant = 'circular',
  color = 'primary',
  sx,
}) => {
  const theme = useTheme();

  const getSizeValue = () => {
    switch (size) {
      case 'small': return 24;
      case 'medium': return 40;
      case 'large': return 60;
      default: return 40;
    }
  };

  const getColor = () => {
    switch (color) {
      case 'primary': return theme.palette.primary.main;
      case 'secondary': return theme.palette.secondary.main;
      case 'white': return '#ffffff';
      default: return theme.palette.primary.main;
    }
  };

  const sizeValue = getSizeValue();
  const colorValue = getColor();

  if (variant === 'circular') {
    return (
      <Box
        sx={{
          display: 'inline-block',
          width: sizeValue,
          height: sizeValue,
          ...sx,
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            border: `3px solid ${colorValue}20`,
            borderTop: `3px solid ${colorValue}`,
            borderRadius: '50%',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      </Box>
    );
  }

  if (variant === 'dots') {
    const dotSize = sizeValue / 4;
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          ...sx,
        }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: colorValue,
              borderRadius: '50%',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </Box>
    );
  }

  if (variant === 'pulse') {
    return (
      <Box
        sx={{
          display: 'inline-block',
          width: sizeValue,
          height: sizeValue,
          ...sx,
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: colorValue,
            borderRadius: '50%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      </Box>
    );
  }

  if (variant === 'bars') {
    const barWidth = sizeValue / 6;
    const barHeight = sizeValue;
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'center',
          gap: barWidth / 2,
          height: sizeValue,
          ...sx,
        }}
      >
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            style={{
              width: barWidth,
              backgroundColor: colorValue,
              borderRadius: barWidth / 2,
            }}
            animate={{
              height: [barHeight * 0.4, barHeight, barHeight * 0.4],
            }}
            transition={{
              duration: 1,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: index * 0.1,
            }}
          />
        ))}
      </Box>
    );
  }

  return null;
};

// Full-screen loading overlay component
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: 'circular' | 'dots' | 'pulse' | 'bars';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  variant = 'circular',
}) => {
  const theme = useTheme();

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(0, 0, 0, 0.7)' 
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: theme.spacing(3),
      }}
    >
      <ModernSpinner size="large" variant={variant} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          color: theme.palette.text.primary,
          fontSize: '1.1rem',
          fontWeight: 500,
          textAlign: 'center',
        }}
      >
        {message}
      </motion.div>
    </motion.div>
  );
};

export default ModernSpinner;
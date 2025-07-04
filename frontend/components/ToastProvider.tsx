import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material';

const ToastProvider: React.FC = () => {
  const theme = useTheme();

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(255, 255, 255, 0.95)',
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: theme.shadows[8],
          padding: '16px',
          maxWidth: '400px',
        },

        // Default options for specific types
        success: {
          style: {
            border: `1px solid ${theme.palette.success.light}`,
            background: theme.palette.mode === 'dark'
              ? `rgba(76, 175, 80, 0.1)`
              : `rgba(76, 175, 80, 0.05)`,
          },
          iconTheme: {
            primary: theme.palette.success.main,
            secondary: 'white',
          },
        },
        error: {
          style: {
            border: `1px solid ${theme.palette.error.light}`,
            background: theme.palette.mode === 'dark'
              ? `rgba(244, 67, 54, 0.1)`
              : `rgba(244, 67, 54, 0.05)`,
          },
          iconTheme: {
            primary: theme.palette.error.main,
            secondary: 'white',
          },
        },
        loading: {
          style: {
            border: `1px solid ${theme.palette.primary.light}`,
            background: theme.palette.mode === 'dark'
              ? `rgba(33, 150, 243, 0.1)`
              : `rgba(33, 150, 243, 0.05)`,
          },
          iconTheme: {
            primary: theme.palette.primary.main,
            secondary: 'white',
          },
        },
      }}
    />
  );
};

export default ToastProvider;
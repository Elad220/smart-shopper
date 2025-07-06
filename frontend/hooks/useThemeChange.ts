import { useEffect, useState } from 'react';

export const useThemeChange = () => {
  const [themeChangeKey, setThemeChangeKey] = useState(0);

  useEffect(() => {
    const handleThemeChange = () => {
      setThemeChangeKey(prev => prev + 1);
    };

    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  return themeChangeKey;
}; 
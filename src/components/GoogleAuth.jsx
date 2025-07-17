import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from './ui/Toaster';

const GOOGLE_CLIENT_ID = '638279953614-4b9ifnqvcqgm2oeroabfvlq4tt3369jb.apps.googleusercontent.com';

const GoogleAuth = ({ onSuccess, onError }) => {
  const { login } = useAuth();

  useEffect(() => {
    // Load Google Sign-In API
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: false
      });
    }
  };

  const handleGoogleResponse = async (response) => {
    try {
      // Decode the JWT token to get user info
      const token = response.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const email = payload.email;
      
      if (!email.endsWith('@buft.edu.bd')) {
        throw new Error('Only BUFT email addresses are allowed');
      }

      const user = await login(email, null, true);
      toast.success('Login successful!');
      onSuccess(user);
    } catch (error) {
      toast.error(error.message);
      onError(error);
    }
  };

  const handleGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      // Fallback for development/testing
      const email = prompt('Enter your BUFT email (@buft.edu.bd):');
      if (email) {
        handleFallbackLogin(email);
      }
    }
  };

  const handleFallbackLogin = async (email) => {
    try {
      const user = await login(email, null, true);
      toast.success('Login successful!');
      onSuccess(user);
    } catch (error) {
      toast.error(error.message);
      onError(error);
    }
  };

  return (
    <div>
      <div id="google-signin-button"></div>
      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-buft-500"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>
    </div>
  );
};

export default GoogleAuth;
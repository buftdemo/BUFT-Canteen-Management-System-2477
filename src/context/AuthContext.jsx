import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = Cookies.get('buft_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, isGoogle = false) => {
    try {
      if (isGoogle) {
        // Validate BUFT email domain
        if (!email.endsWith('@buft.edu.bd')) {
          throw new Error('Only BUFT email addresses are allowed');
        }
        
        // Determine role based on email
        let role = 'employee';
        let name = email.split('@')[0];
        
        if (email === 'admin@buft.edu.bd' || email === 'notification@buft.edu.bd') {
          role = 'admin';
          name = email === 'admin@buft.edu.bd' ? 'Administrator' : 'Notification Admin';
        } else if (email.includes('canteen') || email.includes('staff')) {
          role = 'staff';
          name = 'Staff Member';
        }

        const userData = {
          email,
          name,
          role,
          loginMethod: 'google'
        };

        setUser(userData);
        Cookies.set('buft_user', JSON.stringify(userData), { expires: 7 });
        return userData;
      } else {
        // Manual login (Admin accounts)
        const adminAccounts = [
          { email: 'admin@buft.edu.bd', password: 'admin123', name: 'Administrator' },
          { email: 'notification@buft.edu.bd', password: 'Buft@09876', name: 'Notification Admin' }
        ];

        const validAdmin = adminAccounts.find(admin => 
          admin.email === email && admin.password === password
        );

        if (validAdmin) {
          const userData = {
            email: validAdmin.email,
            name: validAdmin.name,
            role: 'admin',
            loginMethod: 'manual'
          };
          
          setUser(userData);
          Cookies.set('buft_user', JSON.stringify(userData), { expires: 7 });
          return userData;
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('buft_user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface User {
  user_id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    address: string;
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('fuel_buddy_token');
        const savedUser = localStorage.getItem('fuel_buddy_user');
        
        console.log('Token from localStorage:', token);
        console.log('Saved user from localStorage:', savedUser);
        
        if (token && savedUser) {
          // Check if token exists and set it in apiClient
          apiClient.setToken(token);
          
          // Restore user from localStorage
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // Verify token with backend
          try {
            console.log('Attempting to verify token with backend...');
            const profile = await apiClient.getProfile() as User;
            console.log('Profile response:', profile);
            if (profile && Object.keys(profile).length > 0) {
              setUser(profile);
              localStorage.setItem('fuel_buddy_user', JSON.stringify(profile));
              console.log('Token verification successful');
            } else {
              throw new Error('Empty profile response');
            }
          } catch (e: any) {
            console.error('Token verification failed:', e);
            
            // Check if it's specifically a 401 error (token issue)
            if (e.message && (e.message.includes('401') || e.message.includes('Unauthorized') || e.message.includes('token failed'))) {
              console.log('401 error detected - clearing auth data');
              // Token is invalid/expired, clear local storage
              localStorage.removeItem('fuel_buddy_token');
              localStorage.removeItem('fuel_buddy_user');
              apiClient.removeToken();
              setUser(null);
            } else {
              // For other errors, keep the user data but show error
              console.log('Non-auth error, keeping user data:', e.message);
            }
          }
        } else {
          console.log('No token or user found in localStorage');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('fuel_buddy_token');
        localStorage.removeItem('fuel_buddy_user');
        apiClient.removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: any = await apiClient.login({ email, password });
      if (response && response.user && response.token) {
        // Set token in apiClient and localStorage
        apiClient.setToken(response.token);
        
        setUser(response.user);
        // Save user to localStorage for later use
        localStorage.setItem('fuel_buddy_user', JSON.stringify(response.user));
      } else if (response && response['user'] && response['token']) {
        // Fallback for different response formats
        apiClient.setToken(response['token']);
        setUser(response['user']);
        localStorage.setItem('fuel_buddy_user', JSON.stringify(response['user']));
      } else {
        throw new Error('Invalid response format from login API');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    address: string;
  }) => {
    try {
      const response: any = await apiClient.register(userData);
      if (response && response.user && response.token) {
        // Set token in apiClient and localStorage
        apiClient.setToken(response.token);
        
        setUser(response.user);
        // Save user to localStorage for later use
        localStorage.setItem('fuel_buddy_user', JSON.stringify(response.user));
      } else if (response && response['user'] && response['token']) {
        // Fallback for different response formats
        apiClient.setToken(response['token']);
        setUser(response['user']);
        localStorage.setItem('fuel_buddy_user', JSON.stringify(response['user']));
      } else {
        throw new Error('Invalid response format from register API');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.removeToken();
    localStorage.removeItem('fuel_buddy_token');
    localStorage.removeItem('fuel_buddy_user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

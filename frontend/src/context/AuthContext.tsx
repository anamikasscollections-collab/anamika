import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  addressType: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  addresses: Address[];
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (fullName: string, email: string, password: string, phone: string) => Promise<{ success: boolean; requiresOtp?: boolean; message: string }>;
  requestOtp: (email: string, fullName?: string, phone?: string, password?: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, otp: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  addAddress: (addressData: Partial<Address>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('anamika_customer_token'));
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data?.success) {
        setUser(res.data.data.user);
        setAddresses(res.data.data.addresses || []);
      }
    } catch (err) {
      setToken(null);
      setUser(null);
      localStorage.removeItem('anamika_customer_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token, user } = res.data.data;
        localStorage.setItem('anamika_customer_token', token);
        setToken(token);
        setUser(user);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (fullName: string, email: string, password: string, phone: string) => {
    try {
      const res = await api.post('/auth/register', { fullName, email, password, phone });
      if (res.data?.success) {
        return {
          success: true,
          requiresOtp: res.data.data?.requiresOtp,
          message: res.data.message,
        };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration failed.',
      };
    }
  };

  const requestOtp = async (email: string, fullName?: string, phone?: string, password?: string) => {
    try {
      const res = await api.post('/auth/otp/request', { email, fullName, phone, password });
      return {
        success: res.data.success,
        message: res.data.message,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send verification code',
      };
    }
  };

  const verifyOtp = async (email: string, otp: string, phone?: string) => {
    try {
      const res = await api.post('/auth/otp/verify', { email, otp, phone });
      if (res.data?.success) {
        const { token, user } = res.data.data;
        localStorage.setItem('anamika_customer_token', token);
        setToken(token);
        setUser(user);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'OTP verification failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('anamika_customer_token');
    setToken(null);
    setUser(null);
    setAddresses([]);
  };

  const addAddress = async (addressData: Partial<Address>) => {
    try {
      const res = await api.post('/auth/addresses', addressData);
      if (res.data?.success) {
        await fetchProfile();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        addresses,
        login,
        register,
        requestOtp,
        verifyOtp,
        logout,
        refreshProfile: fetchProfile,
        addAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

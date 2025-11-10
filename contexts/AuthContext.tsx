
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  idNumber: string;
  address: string;
  email: string;
  mxiBalance: number;
  usdtContributed: number;
  referralCode: string;
  referredBy?: string;
  referrals: {
    level1: number;
    level2: number;
    level3: number;
  };
  commissions: {
    total: number;
    available: number;
    withdrawn: number;
  };
  activeReferrals: number;
  canWithdraw: boolean;
  lastWithdrawalDate?: string;
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addContribution: (usdtAmount: number) => Promise<void>;
  withdrawCommission: () => Promise<boolean>;
}

interface RegisterData {
  name: string;
  idNumber: string;
  address: string;
  email: string;
  password: string;
  referralCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Error loading user:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call - In production, this would call your backend
      const storedUsers = await AsyncStorage.getItem('users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const foundUser = users.find(
          (u: any) => u.email === email && u.password === password
        );
        
        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));
          setUser(userWithoutPassword);
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Generate unique ID and referral code
      const userId = Date.now().toString();
      const referralCode = `MXI${userId.slice(-6)}`;
      
      const newUser: User = {
        id: userId,
        name: userData.name,
        idNumber: userData.idNumber,
        address: userData.address,
        email: userData.email,
        mxiBalance: 0,
        usdtContributed: 0,
        referralCode,
        referredBy: userData.referralCode,
        referrals: {
          level1: 0,
          level2: 0,
          level3: 0,
        },
        commissions: {
          total: 0,
          available: 0,
          withdrawn: 0,
        },
        activeReferrals: 0,
        canWithdraw: false,
        joinedDate: new Date().toISOString(),
      };

      // Store user
      const storedUsers = await AsyncStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      users.push({ ...newUser, password: userData.password });
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      // Set as current user
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.log('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Update in users list
      const storedUsers = await AsyncStorage.getItem('users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          await AsyncStorage.setItem('users', JSON.stringify(users));
        }
      }
    } catch (error) {
      console.log('Update user error:', error);
    }
  };

  const addContribution = async (usdtAmount: number) => {
    if (!user) return;
    
    // Calculate MXI tokens (1 MXI = 10 USDT)
    const mxiTokens = usdtAmount / 10;
    
    const updates: Partial<User> = {
      mxiBalance: user.mxiBalance + mxiTokens,
      usdtContributed: user.usdtContributed + usdtAmount,
    };
    
    await updateUser(updates);
  };

  const withdrawCommission = async (): Promise<boolean> => {
    if (!user || !user.canWithdraw) return false;
    
    try {
      const updates: Partial<User> = {
        commissions: {
          ...user.commissions,
          available: 0,
          withdrawn: user.commissions.withdrawn + user.commissions.available,
        },
        lastWithdrawalDate: new Date().toISOString(),
      };
      
      await updateUser(updates);
      return true;
    } catch (error) {
      console.log('Withdrawal error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        addContribution,
        withdrawCommission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

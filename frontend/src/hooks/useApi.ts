import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getProfile();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const updateProfile = async (userData: any) => {
    try {
      const updatedProfile = await apiClient.updateProfile(userData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  return { profile, loading, error, updateProfile };
}

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getOrders() as any[];
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  const createOrder = async (orderData: any) => {
    try {
      const newOrder = await apiClient.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const updatedOrder = await apiClient.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(order => 
        order._id === orderId ? updatedOrder : order
      ));
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      throw err;
    }
  };

  return { orders, loading, error, createOrder, updateOrderStatus };
}

export function useFuelStations(params?: { lat?: number; lng?: number; radius?: number }) {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getFuelStations(params) as any[];
        setStations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch fuel stations');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [params?.lat, params?.lng, params?.radius]);

  return { stations, loading, error };
}

export function useLoyaltyPoints(userId?: string) {
  const [points, setPoints] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        setLoading(true);
        const [pointsData, transactionsData] = await Promise.all([
          apiClient.getLoyaltyPoints(userId),
          apiClient.getLoyaltyTransactions(userId)
        ]);
        setPoints(pointsData);
        setTransactions(transactionsData as any[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch loyalty data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchLoyaltyData();
    }
  }, [userId]);

  const earnPoints = async (orderId: string, orderAmount: number) => {
    try {
      const result = await apiClient.earnLoyaltyPoints(orderId, orderAmount);
      setPoints(prev => prev ? { ...prev, ...(result as any) } : result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to earn points');
      throw err;
    }
  };

  const redeemPoints = async (pointsToRedeem: number, orderId?: string) => {
    try {
      const result = await apiClient.redeemLoyaltyPoints(pointsToRedeem, orderId) as { remainingPoints: number };
      setPoints(prev => prev ? { ...prev, availablePoints: result.remainingPoints } : null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem points');
      throw err;
    }
  };

  return { points, transactions, loading, error, earnPoints, redeemPoints };
}

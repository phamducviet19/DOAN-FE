import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { PcBuild } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface PCBuildContextType {
  builds: PcBuild[];
  loading: boolean;
  error: string | null;
  fetchBuilds: () => Promise<void>;
  createBuild: (name: string, product_ids: number[]) => Promise<PcBuild | null>;
  updateBuild: (id: number, name: string, product_ids: number[]) => Promise<PcBuild | null>;
  deleteBuild: (id: number) => Promise<void>;
  getBuildById: (id: number) => Promise<PcBuild | null>;
}

const PCBuildContext = createContext<PCBuildContextType | undefined>(undefined);

export const PCBuildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [builds, setBuilds] = useState<PcBuild[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchBuilds = useCallback(async () => {
    if (!isAuthenticated) {
      setBuilds([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get<PcBuild[]>('/pcbuild');
      setBuilds(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error("Failed to fetch PC builds:", err);
      setError(err.message || 'Failed to fetch PC builds.');
      setBuilds([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBuilds();
  }, [fetchBuilds]);

  const createBuild = async (name: string, product_ids: number[]): Promise<PcBuild | null> => {
    try {
      setLoading(true);
      const newBuild = await api.post<PcBuild>('/pcbuild', { name, product_ids });
      await fetchBuilds(); // Refresh the list
      return newBuild;
    } catch (err: any) {
      setError(err.message || 'Failed to create build.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBuild = async (id: number, name: string, product_ids: number[]): Promise<PcBuild | null> => {
    try {
      setLoading(true);
      const updatedBuild = await api.put<PcBuild>(`/pcbuild/${id}`, { name, product_ids });
      await fetchBuilds(); // Refresh the list
      return updatedBuild;
    } catch (err: any) {
      setError(err.message || 'Failed to update build.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteBuild = async (id: number) => {
    try {
      await api.delete(`/pcbuild/${id}`);
      setBuilds(prev => prev.filter(build => build.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete build.');
    }
  };

  const getBuildById = async (id: number): Promise<PcBuild | null> => {
    try {
      setLoading(true);
      const build = await api.get<PcBuild>(`/pcbuild/${id}`);
      return build;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch build details.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    builds,
    loading,
    error,
    fetchBuilds,
    createBuild,
    updateBuild,
    deleteBuild,
    getBuildById
  };

  return <PCBuildContext.Provider value={value}>{children}</PCBuildContext.Provider>;
};

export const usePCBuild = () => {
  const context = useContext(PCBuildContext);
  if (context === undefined) {
    throw new Error('usePCBuild must be used within a PCBuildProvider');
  }
  return context;
};

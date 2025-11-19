import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { CompareItem, Product } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface CompareContextType {
  compareList: CompareItem[];
  loading: boolean;
  addToCompare: (product: Product) => Promise<void>;
  removeFromCompare: (productId: number) => Promise<void>;
  isInCompare: (productId: number) => boolean;
  groupedCompareList: Record<string, CompareItem[]>;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const [groupedCompareList, setGroupedCompareList] = useState<Record<string, CompareItem[]>>({});
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const fetchCompareList = useCallback(async () => {
    if (!isAuthenticated) {
        setCompareList([]);
        setGroupedCompareList({});
        return;
    };
    setLoading(true);
    try {
      // FIX: Use 'any' to handle inconsistent API responses and check for a 'data' wrapper.
      const response = await api.get<any>('/compare');
      const dataToProcess = (response && response.data && typeof response.data === 'object') ? response.data : response;
      
      let sanitizedData: Record<string, CompareItem[]> = {};
      // Ensure the response is a non-null object and not an array
      if (typeof dataToProcess === 'object' && dataToProcess !== null && !Array.isArray(dataToProcess)) {
        // Filter out any key-value pairs where the value is not an array to prevent runtime errors.
        sanitizedData = Object.fromEntries(
          Object.entries(dataToProcess).filter(([, value]) => Array.isArray(value))
        ) as Record<string, CompareItem[]>;
      }
      
      const flatList = Object.values(sanitizedData).flat();
      setCompareList(flatList);
      setGroupedCompareList(sanitizedData);
    } catch (err) {
      console.error("Failed to fetch compare list:", err);
      // The API might return a 404 or an error message for an empty list, handle gracefully.
      setCompareList([]);
      setGroupedCompareList({});
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCompareList();
  }, [fetchCompareList]);

  const isInCompare = (productId: number): boolean => {
    return compareList.some(item => item.id === productId);
  };

  const addToCompare = async (product: Product) => {
    if(isInCompare(product.id)) {
        removeFromCompare(product.id);
        return;
    }

    try {
        const itemsInSameCategory = compareList.filter(
            item => item.category_id === product.category_id
        );

        if (itemsInSameCategory.length >= 3) {
            const categoryName = itemsInSameCategory[0]?.Category?.name;
            const message = categoryName 
                ? `You can only compare up to 3 products in the "${categoryName}" category.`
                : `You can only compare up to 3 products in the same category.`;
            alert(message);
            return;
        }

        await api.post('/compare', { productId: product.id });
        await fetchCompareList();
    } catch (err: any) {
      alert(err.message || 'Failed to add item to compare list.');
    }
  };

  const removeFromCompare = async (productId: number) => {
    try {
      await api.delete(`/compare/${productId}`);
      await fetchCompareList();
    } catch (err: any) {
      alert(err.message || 'Failed to remove item from compare list.');
    }
  };

  const value = {
    compareList,
    loading,
    addToCompare,
    removeFromCompare,
    isInCompare,
    groupedCompareList,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
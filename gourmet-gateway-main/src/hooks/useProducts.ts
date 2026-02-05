// frontend/src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/products`);
      return data.data || data;
    },
    staleTime: 5 * 60 * 1000, // Les données restent "fraîches" pendant 5 min
  });
}

export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/products/category/${category}`);
      return data.data || data;
    },
    enabled: !!category,
  });
}
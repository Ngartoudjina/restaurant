// ============================================
// TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'starter' | 'main' | 'dessert' | 'drink' | 'side';
  image: string;
  allergens?: string[];
  dietary: string[];
  popular?: boolean;
  available: boolean;
  ingredients?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  password?: string; // Optionnel côté frontend
  firstName: string;
  lastName: string;
  phone: string;
  role: 'client' | 'admin';
  addresses: Address[];
  createdAt: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  zipCode: string;
  default: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  type: 'delivery' | 'takeaway' | 'dine-in';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress?: Address;
  scheduledFor: number;
  createdAt: number;
}

export interface Reservation {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

// ============================================
// MOCK DATA (pour tests et UI)
// ============================================

export const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Marie Dupont',
    rating: 5,
    comment: 'Une expérience culinaire exceptionnelle ! Le filet de bœuf Rossini était divin.',
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jean-Pierre Martin',
    rating: 5,
    comment: 'Service impeccable et plats raffinés. Le homard thermidor est à tomber.',
    createdAt: Date.now() - 86400000 * 14
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Sophie Bernard',
    rating: 4,
    comment: 'Cadre magnifique et cuisine de qualité. Je recommande vivement !',
    createdAt: Date.now() - 86400000 * 21
  }
];

// Codes promo
export const promoCodes: Record<string, number> = {
  'BIENVENUE10': 10,
  'FIDELE20': 20,
  'GOURMET15': 15
};

// Créneaux horaires pour réservations
export const timeSlots = [
  '12:00', '12:30', '13:00', '13:30', '14:00',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
];

// Catégories (pour filtres UI)
export const categories = [
  { id: 'all', name: 'Tous' },
  { id: 'starter', name: 'Entrées' },
  { id: 'main', name: 'Plats' },
  { id: 'dessert', name: 'Desserts' },
  { id: 'drink', name: 'Boissons' },
  { id: 'side', name: 'Accompagnements' }
];

// Filtres diététiques (pour filtres UI)
export const dietaryFilters = [
  { id: 'vegetarian', name: 'Végétarien' },
  { id: 'vegan', name: 'Végan' },
  { id: 'gluten-free', name: 'Sans gluten' },
  { id: 'halal', name: 'Halal' },
  { id: 'spicy', name: 'Épicé' },
  { id: 'organic', name: 'Bio' }
];

// Helper functions
export const getCategoryName = (categoryId: string): string => {
  return categories.find(c => c.id === categoryId)?.name || categoryId;
};

export const getDietaryName = (dietaryId: string): string => {
  return dietaryFilters.find(d => d.id === dietaryId)?.name || dietaryId;
};
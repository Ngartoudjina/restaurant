import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Calendar, 
  Utensils, 
  Users, 
  TrendingUp,
  ChefHat,
  DollarSign,
  Clock,
  Loader2,
  Mail
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Order, Reservation, Product } from '@/lib/data';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Framer Motion variants used across the admin page
const motionVariants = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.06,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 320, damping: 28 },
    },
  },
  pop: {
    hidden: { opacity: 0, scale: 0.98 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 28 } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.18 } },
  },
};

export default function Admin() {
  const { user, isLoading, isAdmin } = useAuth();
  const { toast } = useToast();

  // States
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  interface Message {
    id: string;
    name: string;
    email: string;
    message: string;
    read?: boolean;
    replied?: boolean;
    createdAt?: Date | { toDate?: () => Date };
  }

  const [messages, setMessages] = useState<Message[]>([]);
  
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'main' as 'starter' | 'main' | 'dessert' | 'drink',
    dietary: [] as string[],
    allergens: [] as string[],
    ingredients: [] as string[],
    popular: false,
    available: true,
    image: null as File | null,
  });

  // ============================================
  // FETCH FUNCTIONS (Avant useEffect!)
  // ============================================

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      
      // Essayer de récupérer depuis l'API
      try {
        const response = await api.get('/orders');
        const ordersData = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
        setOrders(ordersData);
      } catch (apiErr) {
        // Si l'API échoue, utiliser localStorage en fallback
        console.warn('API indisponible, utilisation du localStorage', apiErr);
        const localOrders: Order[] = JSON.parse(localStorage.getItem('legourmet_orders') || '[]');
        setOrders(localOrders);
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commandes',
        variant: 'destructive',
      });
    } finally {
      setLoadingOrders(false);
    }
  }, [toast]);

  const fetchReservations = useCallback(async () => {
    try {
      setLoadingReservations(true);
      
      // Essayer de récupérer depuis l'API
      try {
        const response = await api.get('/reservations');
        const reservationsData = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
        setReservations(reservationsData);
      } catch (apiErr) {
        // Si l'API échoue, utiliser localStorage en fallback
        console.warn('API indisponible, utilisation du localStorage', apiErr);
        const localReservations: Reservation[] = JSON.parse(localStorage.getItem('legourmet_reservations') || '[]');
        setReservations(localReservations);
      }
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les réservations',
        variant: 'destructive',
      });
    } finally {
      setLoadingReservations(false);
    }
  }, [toast]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await api.get('/products');
      const productsData = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      setProducts(productsData);
      console.log('✅ Produits chargés:', productsData.length);
    } catch (error) {
      console.error('❌ Erreur chargement produits:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les produits',
        variant: 'destructive',
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [toast]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoadingMessages(true);
      const response = await api.get('/messages', {
        params: { limit: 50 }
      });

      const msgs = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
      setMessages(msgs);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages',
        variant: 'destructive',
      });
    } finally {
      setLoadingMessages(false);
    }
  }, [toast]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (user && isAdmin) {
      fetchOrders();
      fetchReservations();
      fetchProducts();
      fetchMessages();
    }
  }, [user, isAdmin, fetchOrders, fetchReservations, fetchProducts, fetchMessages]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      // Update local state
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: status as Order['status'] } : o
      ));

      toast({
        title: 'Succès',
        description: 'Statut mis à jour',
      });
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });

      // Update local state
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: status as Order['status'] } : o
      ));

      toast({
        title: 'Succès',
        description: 'Statut mis à jour',
      });
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category as 'starter' | 'main' | 'dessert' | 'drink',
      dietary: product.dietary || [],
      allergens: product.allergens || [],
      ingredients: product.ingredients || [],
      popular: product.popular || false,
      available: product.available,
      image: null,
    });
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Supprimer ce plat définitivement ?')) return;

    try {
      await api.delete(`/products/${productId}`);

      setProducts(products.filter(p => p.id !== productId));

      toast({
        title: 'Succès',
        description: 'Produit supprimé',
      });
    } catch (error) {
      console.error('Erreur suppression produit:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le produit',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setModalLoading(true);

    // Créer FormData
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price.toString());
    data.append('category', formData.category);
    data.append('dietary', JSON.stringify(formData.dietary));
    data.append('allergens', JSON.stringify(formData.allergens));
    data.append('ingredients', JSON.stringify(formData.ingredients));
    data.append('popular', formData.popular.toString());
    data.append('available', formData.available.toString());

    if (formData.image) {
      data.append('image', formData.image);
    }

    if (editingProduct) {
      // Update - Le token est ajouté automatiquement par l'intercepteur
      await api.put(`/products/${editingProduct.id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: 'Succès',
        description: 'Produit modifié',
      });
    } else {
      // Create
      await api.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: 'Succès',
        description: 'Produit créé',
      });
    }

    // Refresh products
    fetchProducts();

    // Reset form
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'main',
      dietary: [],
      allergens: [],
      ingredients: [],
      popular: false,
      available: true,
      image: null,
    });

  } catch (error: unknown) {
    console.error('Erreur sauvegarde produit:', error);
    const axiosError = error as { response?: { data?: { error?: string } } };
    const errorMsg = axiosError?.response?.data?.error || 'Impossible de sauvegarder le produit';
    toast({
      title: 'Erreur',
      description: errorMsg,
      variant: 'destructive',
    });
  } finally {
    setModalLoading(false);
  }
};

  // ============================================
  // CALCULATIONS
  // ============================================

  const todayOrders = orders.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.createdAt).toDateString() === today;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

  // Statistiques supplémentaires
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  
  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.available).length;
  
  const successRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0;
  const cancelRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0;

  // Données pour les graphes
  const revenueByDay = (() => {
    const data: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toDateString();
    });
    
    last7Days.forEach(day => {
      data[day] = 0;
    });
    
    orders.forEach(order => {
      const day = new Date(order.createdAt).toDateString();
      if (data[day] !== undefined) {
        data[day] += order.total;
      }
    });
    
    return last7Days.map(day => ({
      date: new Date(day).toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue: Math.round(data[day])
    }));
  })();

  const ordersByStatus = [
    { name: 'Livrées', value: deliveredOrders, color: '#10b981' },
    { name: 'En attente', value: pendingOrders, color: '#eab308' },
    { name: 'Préparation', value: orders.filter(o => o.status === 'preparing').length, color: '#a855f7' },
    { name: 'Prêtes', value: orders.filter(o => o.status === 'ready').length, color: '#3b82f6' },
    { name: 'Annulées', value: cancelledOrders, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const categoryRevenue = (() => {
    const data: Record<string, number> = {};
    products.forEach(p => {
      data[p.category] = (data[p.category] || 0) + (p.price * 2); // Estimation
    });
    return Object.entries(data).map(([category, revenue]) => ({
      category,
      revenue: Math.round(revenue)
    }));
  })();

  const getStatusBadge = (status: Order['status']) => {
    const styles: Record<Order['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status];
  };

  // ============================================
  // RENDER
  // ============================================

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gold" />
          <p>Chargement...</p>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <motion.section variants={motionVariants.pop as any} initial="hidden" animate="show" className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">Administration</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenue, {user?.firstName ?? 'Admin'}
              </p>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Commandes
              </TabsTrigger>
              <TabsTrigger value="reservations" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Réservations
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Statistiques
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Messages
              </TabsTrigger>
            </TabsList>

            {/* DASHBOARD TAB */}
            <TabsContent value="dashboard">
              <motion.div
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                variants={motionVariants.container}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={motionVariants.item as any} whileHover={{ y: -6 }} whileTap={{ scale: 0.995 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-gold" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Commandes du jour</p>
                          <p className="text-2xl font-bold">{todayOrders.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={motionVariants.item as any} whileHover={{ y: -6 }} whileTap={{ scale: 0.995 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">CA du jour</p>
                          <p className="text-2xl font-bold">{todayRevenue.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={motionVariants.item as any} whileHover={{ y: -6 }} whileTap={{ scale: 0.995 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Réservations</p>
                          <p className="text-2xl font-bold">{reservations.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={motionVariants.item as any} whileHover={{ y: -6 }} whileTap={{ scale: 0.995 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Produits</p>
                          <p className="text-2xl font-bold">{products.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Commandes récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold" />
                    </div>
                  ) : orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Aucune commande</p>
                    ) : (
                    <motion.div variants={motionVariants.container} initial="hidden" animate="show" className="space-y-4">
                      {orders.slice(0, 5).map(order => (
                        <motion.div
                          key={order.id}
                          variants={motionVariants.item as any}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">#{order.id.slice(-6)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} article{order.items.length > 1 ? 's' : ''} -{' '}
                              {order.total.toLocaleString()} FCFA
                            </p>
                          </div>
                          <Badge className={getStatusBadge(order.status)}>{order.status}</Badge>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ORDERS TAB */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Toutes les commandes</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-gold" />
                    </div>
                  ) : orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Aucune commande</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border border-border rounded-lg p-4">
                          <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
                            <div>
                              <p className="font-medium">Commande #{order.id.slice(-6)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={order.status}
                                onValueChange={(value) =>
                                  updateOrderStatus(order.id, value as Order['status'])
                                }
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">En attente</SelectItem>
                                  <SelectItem value="confirmed">Confirmée</SelectItem>
                                  <SelectItem value="preparing">En préparation</SelectItem>
                                  <SelectItem value="ready">Prête</SelectItem>
                                  <SelectItem value="delivered">Livrée</SelectItem>
                                  <SelectItem value="cancelled">Annulée</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-1 mb-4">
                            {order.items.map(item => (
                              <p key={item.productId} className="text-sm text-muted-foreground">
                                {item.quantity}x {item.name} -{' '}
                                {(item.price * item.quantity).toLocaleString()} FCFA
                              </p>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-border">
                            <span className="text-sm">
                              {order.type === 'delivery'
                                ? 'Livraison'
                                : order.type === 'takeaway'
                                ? 'À emporter'
                                : 'Sur place'}
                            </span>
                            <span className="font-bold text-lg text-gold">
                              {order.total.toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* RESERVATIONS TAB */}
            <TabsContent value="reservations">
              <Card>
                <CardHeader>
                  <CardTitle>Réservations</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingReservations ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-gold" />
                    </div>
                  ) : reservations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Aucune réservation</p>
                  ) : (
                    <div className="space-y-4">
                      {reservations.map(res => (
                        <div key={res.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{res.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {res.email} • {res.phone}
                              </p>
                            </div>
                            <Badge
                              className={
                                res.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : res.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {res.status}
                            </Badge>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(res.date).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {res.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {res.guests} pers.
                            </span>
                          </div>
                          {res.specialRequests && (
                            <p className="mt-2 text-sm italic text-muted-foreground">
                              Note: {res.specialRequests}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* MENU TAB */}
            <TabsContent value="menu">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Gestion du Menu</CardTitle>
                  <Button
                    onClick={() => {
                      setEditingProduct(null);
                      setFormData({
                        name: '',
                        description: '',
                        price: 0,
                        category: 'main',
                        dietary: [],
                        allergens: [],
                        ingredients: [],
                        popular: false,
                        available: true,
                        image: null,
                      });
                      setShowModal(true);
                    }}
                    className="bg-gold text-black hover:bg-gold-dark"
                  >
                    Ajouter un plat
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingProducts ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-gold" />
                    </div>
                  ) : products.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Aucun produit</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map(product => (
                        <div
                          key={product.id}
                          className="border border-border rounded-lg overflow-hidden"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                            }}
                          />
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{product.name}</h3>
                              <span className="text-gold font-bold">
                                {product.price.toLocaleString()} FCFA
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {product.description}
                            </p>
                            <div className="flex gap-2 mb-2">
                              {product.popular && (
                                <Badge variant="secondary" className="text-xs">
                                  Populaire
                                </Badge>
                              )}
                              {!product.available && (
                                <Badge variant="destructive" className="text-xs">
                                  Indisponible
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                Modifier
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDelete(product.id)}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* MODAL ADD/EDIT PRODUCT */}
              <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Modifier le plat' : 'Ajouter un plat'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="price">Prix (FCFA) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: Number(e.target.value) })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        required
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            category: value as 'starter' | 'main' | 'dessert' | 'drink',
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Entrées</SelectItem>
                          <SelectItem value="main">Plats</SelectItem>
                          <SelectItem value="dessert">Desserts</SelectItem>
                          <SelectItem value="drink">Boissons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="image">Image {editingProduct ? '(laisser vide pour garder l\'actuelle)' : '*'}</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.files?.[0] || null })
                        }
                        required={!editingProduct}
                      />
                      {editingProduct && editingProduct.image && (
                        <img
                          src={editingProduct.image}
                          alt="Aperçu"
                          className="mt-2 h-20 w-20 object-cover rounded"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="popular"
                          checked={formData.popular}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, popular: checked as boolean })
                          }
                        />
                        <Label htmlFor="popular" className="cursor-pointer">
                          Populaire
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="available"
                          checked={formData.available}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, available: checked as boolean })
                          }
                        />
                        <Label htmlFor="available" className="cursor-pointer">
                          Disponible
                        </Label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                    <Button
                    type="submit"
                    disabled={modalLoading}
                    className="bg-gold text-black hover:bg-gold-dark"
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : editingProduct ? (
                      'Modifier'
                    ) : (
                      'Ajouter'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    disabled={modalLoading}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* STATS TAB */}
        <TabsContent value="stats">
          <div className="space-y-6">
            {/* Section 1: Commandes */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-gold" />
                Statistiques des Commandes
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Total Commandes</p>
                    <p className="text-3xl font-bold text-gold">{totalOrders}</p>
                    <p className="text-xs text-muted-foreground mt-2">Toutes périodes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Livrées</p>
                    <p className="text-3xl font-bold text-green-600">{deliveredOrders}</p>
                    <p className="text-xs text-green-600 mt-2">Taux: {successRate}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">En attente</p>
                    <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
                    <p className="text-xs text-muted-foreground mt-2">À traiter</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Annulées</p>
                    <p className="text-3xl font-bold text-red-600">{cancelledOrders}</p>
                    <p className="text-xs text-red-600 mt-2">Taux: {cancelRate}%</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section 2: Chiffre d'affaires */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-gold" />
                Chiffre d'Affaires
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">CA Total</p>
                    <p className="text-3xl font-bold text-gold">
                      {totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">FCFA</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">CA Aujourd'hui</p>
                    <p className="text-3xl font-bold text-green-600">
                      {todayRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">FCFA</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Moyenne par commande</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {Math.round(averageOrderValue).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">FCFA</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section 3: Réservations */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-gold" />
                Statistiques des Réservations
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Total Réservations</p>
                    <p className="text-3xl font-bold text-gold">{totalReservations}</p>
                    <p className="text-xs text-muted-foreground mt-2">Toutes périodes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Confirmées</p>
                    <p className="text-3xl font-bold text-green-600">{confirmedReservations}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {totalReservations > 0 ? ((confirmedReservations / totalReservations) * 100).toFixed(0) : 0}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">En attente</p>
                    <p className="text-3xl font-bold text-yellow-600">{pendingReservations}</p>
                    <p className="text-xs text-muted-foreground mt-2">À confirmer</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section 4: Graphes */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-gold" />
                Graphiques
              </h2>
              
              {/* Graphe 1: Revenus sur 7 jours */}
              <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Évolution des revenus (7 derniers jours)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#999" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D97706' }}
                          formatter={(value) => `${(value as number).toLocaleString()} FCFA`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#D97706" 
                          strokeWidth={3}
                          dot={{ fill: '#F59E0B', r: 5 }}
                          activeDot={{ r: 7 }}
                          name="Revenus"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Graphe 2: Commandes par statut */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Distribution des commandes</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={ordersByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#D97706"
                          dataKey="value"
                        >
                          {ordersByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D97706' }}
                          formatter={(value) => `${value} commandes`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Graphe 3: Revenus par catégorie */}
              {categoryRevenue.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenus estimés par catégorie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="category" stroke="#999" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D97706' }}
                          formatter={(value) => `${(value as number).toLocaleString()} FCFA`}
                        />
                        <Legend />
                        <Bar 
                          dataKey="revenue" 
                          fill="#D97706" 
                          name="Revenus"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Section 5: Menu */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Utensils className="h-6 w-6 text-gold" />
                Statistiques du Menu
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Produits Total</p>
                    <p className="text-3xl font-bold text-gold">{totalProducts}</p>
                    <p className="text-xs text-muted-foreground mt-2">Articles disponibles</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">Disponibles</p>
                    <p className="text-3xl font-bold text-green-600">{availableProducts}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {totalProducts > 0 ? ((availableProducts / totalProducts) * 100).toFixed(0) : 0}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section 6: Résumé général */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-gold" />
                Vue d'ensemble
              </h2>
              <Card>
                <CardContent className="p-8">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="border-r border-gold/20">
                      <p className="text-sm text-muted-foreground mb-2">Commandes d'aujourd'hui</p>
                      <p className="text-2xl font-bold text-gold">{todayOrders.length}</p>
                    </div>
                    <div className="border-r border-gold/20">
                      <p className="text-sm text-muted-foreground mb-2">Panier moyen</p>
                      <p className="text-2xl font-bold text-gold">
                        {todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length).toLocaleString() : 0} FCFA
                      </p>
                    </div>
                    <div className="border-r border-gold/20">
                      <p className="text-sm text-muted-foreground mb-2">Taux de succès</p>
                      <p className="text-2xl font-bold text-green-600">{successRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Taux d'annulation</p>
                      <p className="text-2xl font-bold text-red-600">{cancelRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* MESSAGES TAB */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages des visiteurs</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMessages ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Aucun message</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((m: Message) => (
                    <div key={m.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-base">{m.name}</p>
                          <p className="text-sm text-muted-foreground">{m.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {m.createdAt ? new Date(
                              m.createdAt.toDate ? m.createdAt.toDate() : 
                              (typeof m.createdAt === 'object' && m.createdAt._seconds ? m.createdAt._seconds * 1000 : m.createdAt)
                            ).toLocaleString('fr-FR') : 'Date inconnue'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!m.read && (
                            <Badge className="bg-blue-100 text-blue-800">Non lu</Badge>
                          )}
                          {m.replied && (
                            <Badge className="bg-green-100 text-green-800">Répondu</Badge>
                          )}
                        </div>
                      </div>
                      <div className="bg-accent/30 p-3 rounded mb-3 text-sm text-foreground whitespace-pre-wrap">
                        {m.message}
                      </div>
                      <div className="flex gap-2">
                        {!m.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await api.patch(`/messages/${m.id}/read`, {});
                                toast({ title: 'Marqué comme lu' });
                                fetchMessages();
                              } catch (err) {
                                console.error('Erreur marquer lu:', err);
                                toast({
                                  title: 'Erreur',
                                  description: 'Impossible de marquer comme lu',
                                  variant: 'destructive'
                                });
                              }
                            }}
                          >
                            Marquer comme lu
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (!confirm('Supprimer ce message ?')) return;
                            try {
                              await api.delete(`/messages/${m.id}`);
                              toast({ title: 'Message supprimé' });
                              fetchMessages();
                            } catch (err) {
                              console.error('Erreur suppression:', err);
                              toast({
                                title: 'Erreur',
                                description: 'Impossible de supprimer le message',
                                variant: 'destructive'
                              });
                            }
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </motion.section>
</Layout>
  );
}
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  zipCode: string;
  default: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'client' | 'admin';
  addresses: Address[];
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isAdmin: boolean;
  getToken: () => Promise<string | null>; // ← AJOUT
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Écouter les changements d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              role: userData.role || 'client',
              addresses: userData.addresses || [],
              createdAt: userData.createdAt?.toMillis?.() || Date.now()
            });
          }
          setFirebaseUser(firebaseUser);
        } catch (error) {
          console.error('Erreur lors de la récupération des données:', error);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fonction pour récupérer le token
  const getToken = async (): Promise<string | null> => {
    if (!firebaseUser) {
      console.warn('Aucun utilisateur connecté');
      return null;
    }

    try {
      const token = await firebaseUser.getIdToken();
      return token;
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: firebaseUser.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role || 'client',
          addresses: userData.addresses || [],
          createdAt: userData.createdAt?.toMillis?.() || Date.now()
        });

        // Sauvegarder le token dans localStorage
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('authToken', token);
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      const newUser: Omit<User, 'id'> = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: 'client',
        addresses: [],
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: serverTimestamp()
      });

      setUser({ ...newUser, id: firebaseUser.uid });

      // Sauvegarder le token dans localStorage
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('authToken', token);

      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('authToken'); // ← Nettoyer le token
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!user || !firebaseUser) return;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, updates);

      setUser({ ...user, ...updates });

      if (updates.firstName || updates.lastName) {
        await updateProfile(firebaseUser, {
          displayName: `${updates.firstName || user.firstName} ${updates.lastName || user.lastName}`
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
        getToken // ← Exposer la fonction
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
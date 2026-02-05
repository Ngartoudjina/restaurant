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

// Type pour l'utilisateur dans Firestore
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

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  zipCode: string;
  default: boolean;
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
        // Récupérer les données utilisateur depuis Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({
            ...userData,
            id: firebaseUser.uid
          });
        }
        setFirebaseUser(firebaseUser);
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Inscription
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const firebaseUser = userCredential.user;

      // Mettre à jour le profil Firebase
      await updateProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Créer le document utilisateur dans Firestore
      const newUser: User = {
        id: firebaseUser.uid,
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

      setUser(newUser);
      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      
      // Gestion des erreurs Firebase
      if (error.code === 'auth/email-already-in-use') {
        console.error('Cet email est déjà utilisé');
      } else if (error.code === 'auth/weak-password') {
        console.error('Le mot de passe doit contenir au moins 6 caractères');
      }
      
      return false;
    }
  };

  // Connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Récupérer les données utilisateur
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser({
          ...userData,
          id: firebaseUser.uid
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        console.error('Email ou mot de passe incorrect');
      }
      
      return false;
    }
  };

  // Déconnexion
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Mise à jour de l'utilisateur
  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!user || !firebaseUser) return;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, updates);

      // Mettre à jour le state local
      setUser({ ...user, ...updates });

      // Mettre à jour le displayName si nécessaire
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
        isAdmin
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
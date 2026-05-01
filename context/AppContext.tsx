import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { db, connector } from '../utils/powersync';
import { supabase } from '../utils/supabase';
import { 
  sampleProfile, 
} from '../utils/sampleData';

// ─── Data Types ──────────────────────────────

export interface UserProfile {
  name: string;
  currency: string;
  monthlyIncome: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  cycle: string;
  nextBillingDate: string;
  icon: string;
  active: boolean;
}

export interface VaultDocument {
  id: string;
  name: string;
  category: string;
  fileUri: string;
  fileType: string;
  expiryDate: string | null;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  type: string;
  completed: boolean;
  linkedSubscriptionId: string | null;
}

// ─── App State ───────────────────────────────

export interface AppState {
  profile: UserProfile;
  expenses: Expense[];
  subscriptions: Subscription[];
  documents: VaultDocument[];
  reminders: Reminder[];
  isLoaded: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  biometricsEnabled: boolean;
  appPin: string | null;
}

const initialState: AppState = {
  profile: {
    name: 'User',
    currency: '₱',
    monthlyIncome: 0,
    createdAt: new Date().toISOString(),
  },
  expenses: [],
  subscriptions: [],
  documents: [],
  reminders: [],
  isLoaded: false,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  biometricsEnabled: false,
  appPin: null,
};

// ─── Actions ─────────────────────────────────

type Action =
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'SET_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_DATA'; payload: Partial<AppState> }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SET_BIOMETRICS'; payload: boolean }
  | { type: 'SET_PIN'; payload: string | null }
  | { type: 'CLEAR_ALL_DATA' };

// ─── Reducer ─────────────────────────────────

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload, isLoaded: true };
    case 'SET_DATA':
      return { ...state, ...action.payload };
    case 'COMPLETE_ONBOARDING':
      return { ...state, hasCompletedOnboarding: true };
    case 'LOGIN':
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      return { ...initialState, isLoaded: true, hasCompletedOnboarding: state.hasCompletedOnboarding };
    case 'SET_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'SET_BIOMETRICS':
      return { ...state, biometricsEnabled: action.payload };
    case 'SET_PIN':
      return { ...state, appPin: action.payload };
    case 'CLEAR_ALL_DATA':
      AsyncStorage.removeItem('@centria_onboarded');
      SecureStore.deleteItemAsync('centria_biometrics');
      SecureStore.deleteItemAsync('centria_pin');
      return { 
        ...initialState, 
        isLoaded: true, 
        hasCompletedOnboarding: false,
        isAuthenticated: false,
        profile: {
          name: 'User',
          currency: '₱',
          monthlyIncome: 0,
          createdAt: new Date().toISOString()
        }
      };
    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 1. Initial Load & PowerSync Initialization
  useEffect(() => {
    (async () => {
      if (db) {
        await db.init();
      }
      
      const [onboarded, bioEnabled, savedPin] = await Promise.all([
        AsyncStorage.getItem('@centria_onboarded'), // Keeping this in AsyncStorage for now as it's not sensitive
        SecureStore.getItemAsync('centria_biometrics'),
        SecureStore.getItemAsync('centria_pin'),
      ]);

      if (onboarded === 'true') {
        dispatch({ type: 'COMPLETE_ONBOARDING' });
      }
      if (bioEnabled === 'true') {
        dispatch({ type: 'SET_BIOMETRICS', payload: true });
      }
      if (savedPin) {
        dispatch({ type: 'SET_PIN', payload: savedPin });
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        dispatch({ type: 'LOGIN' });
        if (db) {
          db.connect(connector).catch(console.error);
        }
      }
      
      dispatch({ type: 'LOAD_STATE', payload: {} });
    })();
  }, []);

  // 2. Auth Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        dispatch({ type: 'LOGIN' });
        if (db) {
          db.connect(connector).catch(console.error);
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
        if (db) {
          db.disconnectAndClear().catch(console.error);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // 3. Real-Time Data Watcher (Offline-First Magic)
  // Instead of manual fetches, we WATCH the local SQLite database for changes
  useEffect(() => {
    // Tarsi-style: Watchers run for every local user immediately.
    // if (!state.isAuthenticated) return; // REMOVED
    if (!db) return;

    // Watch Expenses
    const expenseSub = db.watch('SELECT * FROM expenses ORDER BY date DESC', [], {
      onResult: (result) => {
        const rows = [];
        for (let i = 0; i < result.rows.length; i++) {
          rows.push(result.rows.item(i));
        }
        dispatch({ type: 'SET_DATA', payload: { expenses: rows } });
      },
    });

    // Watch Subscriptions
    const subSub = db.watch('SELECT * FROM subscriptions', [], {
      onResult: (result) => {
        const rows = [];
        for (let i = 0; i < result.rows.length; i++) {
          const s = result.rows.item(i);
          rows.push({
            ...s,
            nextBillingDate: s.next_billing_date
          });
        }
        dispatch({ type: 'SET_DATA', payload: { subscriptions: rows } });
      },
    });

    // Watch Reminders
    const reminderSub = db.watch('SELECT * FROM reminders', [], {
      onResult: (result) => {
        const rows = [];
        for (let i = 0; i < result.rows.length; i++) {
          const r = result.rows.item(i);
          rows.push({
            ...r,
            linkedSubscriptionId: r.linked_subscription_id,
            completed: !!r.completed
          });
        }
        dispatch({ type: 'SET_DATA', payload: { reminders: rows } });
      },
    });

    // Watch Documents
    const docSub = db.watch('SELECT * FROM documents', [], {
      onResult: (result) => {
        const rows = [];
        for (let i = 0; i < result.rows.length; i++) {
          const d = result.rows.item(i);
          rows.push({
            ...d,
            fileUri: d.file_path,
            fileType: d.file_type,
            expiryDate: d.expiry_date
          });
        }
        dispatch({ type: 'SET_DATA', payload: { documents: rows } });
      },
    });

    // Watch Profile
    const profileSub = db.watch('SELECT * FROM profiles', [], {
      onResult: (result) => {
        if (result.rows.length > 0) {
          const p = result.rows.item(0);
          dispatch({ type: 'SET_PROFILE', payload: {
            name: p.name,
            currency: p.currency,
            monthlyIncome: p.monthly_income,
            createdAt: p.created_at,
          }});
        }
      },
    });

    return () => {
      expenseSub?.close();
      subSub?.close();
      reminderSub?.close();
      docSub?.close();
      profileSub?.close();
    };
  }, []); // Run forever locally

  useEffect(() => {
    if (!state.isLoaded) return;
    if (state.hasCompletedOnboarding) {
      AsyncStorage.setItem('@centria_onboarded', 'true');
    }
  }, [state.hasCompletedOnboarding, state.isLoaded]);

  useEffect(() => {
    if (!state.isLoaded) return;
    SecureStore.setItemAsync('centria_biometrics', state.biometricsEnabled.toString());
  }, [state.biometricsEnabled, state.isLoaded]);

  useEffect(() => {
    if (!state.isLoaded) return;
    if (state.appPin) {
      SecureStore.setItemAsync('centria_pin', state.appPin);
    } else {
      SecureStore.deleteItemAsync('centria_pin');
    }
  }, [state.appPin, state.isLoaded]);

  return (
    <AppContext.Provider value={{ state, dispatch, db }}>
      {children}
    </AppContext.Provider>
  );
}

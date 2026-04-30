import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
}

const initialState: AppState = {
  profile: sampleProfile,
  expenses: [],
  subscriptions: [],
  documents: [],
  reminders: [],
  isLoaded: false,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
};

// ─── Actions ─────────────────────────────────

type Action =
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'SET_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_DATA'; payload: Partial<AppState> }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
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
    case 'CLEAR_ALL_DATA':
      return { ...initialState, isLoaded: true, hasCompletedOnboarding: state.hasCompletedOnboarding };
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
      await db.init();
      
      const onboarded = await AsyncStorage.getItem('@centria_onboarded');
      if (onboarded === 'true') {
        dispatch({ type: 'COMPLETE_ONBOARDING' });
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        dispatch({ type: 'LOGIN' });
        db.connect(connector).catch(console.error);
      }
      
      dispatch({ type: 'LOAD_STATE', payload: {} });
    })();
  }, []);

  // 2. Auth Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        dispatch({ type: 'LOGIN' });
        db.connect(connector).catch(console.error);
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
        db.disconnectAndClear().catch(console.error);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // 3. Real-Time Data Watcher (Offline-First Magic)
  // Instead of manual fetches, we WATCH the local SQLite database for changes
  useEffect(() => {
    if (!state.isAuthenticated) return;

    // Watch Expenses
    const expenseSub = db.watch('SELECT * FROM expenses ORDER BY date DESC', [], {
      onResult: (result) => {
        dispatch({ type: 'SET_DATA', payload: { expenses: result.rows._array } });
      },
    });

    // Watch Subscriptions
    const subSub = db.watch('SELECT * FROM subscriptions', [], {
      onResult: (result) => {
        dispatch({ type: 'SET_DATA', payload: { subscriptions: result.rows._array } });
      },
    });

    // Watch Reminders
    const reminderSub = db.watch('SELECT * FROM reminders', [], {
      onResult: (result) => {
        dispatch({ type: 'SET_DATA', payload: { reminders: result.rows._array } });
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
      profileSub?.close();
    };
  }, [state.isAuthenticated]);

  useEffect(() => {
    if (state.hasCompletedOnboarding) {
      AsyncStorage.setItem('@centria_onboarded', 'true');
    }
  }, [state.hasCompletedOnboarding]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

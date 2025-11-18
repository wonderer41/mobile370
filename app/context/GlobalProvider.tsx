import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getCurrentUser, Profile } from "../lib/database";

interface GlobalContextType {
  isLogged: boolean;
  setIsLogged: (value: boolean) => void;
  user: Profile | null;
  setUser: (user: Profile | null) => void;
  loading: boolean;
}

interface GlobalProviderProps {
  children: ReactNode;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};

const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getCurrentUser()
      .then(async (res) => {
        if (res) {
          // User has a profile
          setIsLogged(true);
          setUser(res);
        } else {
          // No profile found, check if there's an authenticated user who needs a profile created
          try {
            // First check if there's an authenticated user
            const { supabase } = await import("../lib/supabase");
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user && user.email_confirmed_at) {
              // User is authenticated and email is confirmed, but no profile exists
              console.log('Authenticated user without profile, creating profile...');
              const { createProfileAfterConfirmation } = await import("../lib/database");
              const profile = await createProfileAfterConfirmation();
              if (profile) {
                setIsLogged(true);
                setUser(profile);
                return;
              }
            }
            
            // No authenticated user or profile creation failed
            setIsLogged(false);
            setUser(null);
          } catch (error) {
            // Error checking auth status or creating profile
            console.log('Auth check error:', error);
            setIsLogged(false);
            setUser(null);
          }
        }
      })
      .catch((error) => {
        console.log('GlobalProvider error:', error);
        setIsLogged(false);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export default GlobalProvider
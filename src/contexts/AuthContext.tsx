import { Session } from "@supabase/supabase-js";
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import Purchases, { CustomerInfo } from "react-native-purchases";

interface AuthContextType {
  session: Session | null;
  setSession: Dispatch<SetStateAction<Session | null>>;
  isOnline: boolean | null;
  isProUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const APIKeys = {
  apple: "appl_gwbtLmaQvxoHsyGTjTgYuxyakov",
  google: "your_revenuecat_google_api_key",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(false);
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });

    unsubscribe();
  }, []);

  useEffect(() => {
    const configurePurchase = async () => {
      if (Platform.OS == "ios") {
        await Purchases.configure({ apiKey: APIKeys.apple });
      } else {
        await Purchases.configure({ apiKey: APIKeys.google });
      }
    };
    configurePurchase();
  }, []);

  useEffect(() => {
    const setup = async () => {
      const userId = session?.user.id;
      // console.log('userId: ', userId);
      if (userId) {
        const { customerInfo } = await Purchases.logIn(userId);
        setIsProUser(!!customerInfo.entitlements.active["pro"]);
        // if (!isProUser) {
        //   await supabase.from("entries").delete().eq("user_id", userId); // proを解約したユーザーのデータは一定期間保存後、削除。
        // }
      } else {
        setIsProUser(false);
      }
    };
    setup();
  }, [session]);

  useEffect(() => {
    const listener = async (customerInfo: CustomerInfo) => {
      setIsProUser(!!customerInfo.entitlements.active["pro"]);
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  const value = { session, setSession, isOnline, isProUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
};

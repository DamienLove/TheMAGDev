import { useState, useEffect } from 'react';
import { Purchases, PurchasesPackage, CustomerInfo, LogLevel } from '@revenuecat/purchases-js';

const API_KEY = 'test_BHHkqGNfzPCVziEbXBIwPxupzTJ'; // Using the key you provided

export const useRevenueCat = () => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesPackage[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Create a timeout promise that resolves after 3 seconds
      const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
      
      const rcInit = async () => {
        try {
            Purchases.setLogLevel(LogLevel.Verbose);
            await Purchases.configure(API_KEY, "my_app_user_id"); // Ideally use real user ID

            const info = await Purchases.getCustomerInfo();
            setCustomerInfo(info);
            checkEntitlements(info);

            const offerings = await Purchases.getOfferings();
            if (offerings.current) {
            setCurrentOffering(offerings.current.availablePackages);
            }
        } catch (e) {
            console.error("RevenueCat Init Error:", e);
        }
      };

      // Race the actual init against the timeout
      await Promise.race([rcInit(), timeout]);
      
      // Always stop loading after the race finishes (either success, error, or timeout)
      setLoading(false);
    };

    init();
  }, []);

  const checkEntitlements = (info: CustomerInfo) => {
    // "TheMAG.dev Pro" entitlement check as requested
    if (info.entitlements.active['TheMAG․dev Pro']) {
      setIsPro(true);
    } else {
      setIsPro(false);
    }
  };

  const purchasePackage = async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(customerInfo);
      checkEntitlements(customerInfo);
      return true;
    } catch (e) {
      console.error("Purchase Error:", e);
      return false;
    }
  };

  return { isPro, currentOffering, purchasePackage, loading, customerInfo };
};

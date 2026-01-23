// This file contains the React Native specific implementation you requested.
// It is NOT used in the current Web application but is saved here for your reference
// if you port this project to React Native.

/*
import { Platform } from 'react-native';
import { useEffect } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

export default function App() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    // Platform-specific API keys
    const iosApiKey = 'test_BHHkqGNfzPCVziEbXBIwPxupzTJ';
    const androidApiKey = 'test_BHHkqGNfzPCVziEbXBIwPxupzTJ';

    if (Platform.OS === 'ios') {
       Purchases.configure({apiKey: iosApiKey});
    } else if (Platform.OS === 'android') {
       Purchases.configure({apiKey: androidApiKey});
    }
  }, []);
}

export async function checkEntitlement() {
  try {
      const customerInfo = await Purchases.getCustomerInfo();

      if(typeof customerInfo.entitlements.active['TheMAG․dev Pro'] !== "undefined") {
        // Grant user access to entitlement
        console.log("User is Pro");
        return true;
      }
      return false;

  } catch (e) {
    // Error fetching customer info
    console.error(e);
    return false;
  }
}

// Make sure to configure a Paywall in the Dashboard first.
export async function presentPaywall(): Promise<boolean> {
    
    // Present paywall for current offering:
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
    
    switch (paywallResult) {
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
            return false;
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
            return true;
        default:
            return false;
    }
}
*/

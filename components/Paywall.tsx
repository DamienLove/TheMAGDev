import React from 'react';
import { PurchasesPackage } from '@revenuecat/purchases-js';

interface PaywallProps {
  packages: PurchasesPackage[];
  onPurchase: (pkg: PurchasesPackage) => void;
  onClose: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ packages, onPurchase, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-4xl w-full relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          <span className="material-symbols-rounded">close</span>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Unlock TheMAG.dev Pro</h2>
          <p className="text-zinc-400">Get unlimited access to all developer tools and cloud resources.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.identifier} className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500 transition-colors flex flex-col">
              <h3 className="text-lg font-bold text-white mb-1">{pkg.product.title}</h3>
              <p className="text-2xl font-bold text-indigo-400 mb-4">
                {pkg.product.priceString}
              </p>
              <button
                onClick={() => onPurchase(pkg)}
                className="mt-auto w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition-colors"
              >
                Subscribe
              </button>
            </div>
          ))}
          
          {packages.length === 0 && (
            <div className="col-span-full text-center text-zinc-500 py-10">
              Loading products... (Ensure 'TheMAG.dev Pro' entitlement is configured in RevenueCat)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Paywall;

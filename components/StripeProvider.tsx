"use client"

import { useEffect, useState } from 'react';

interface StripeProviderProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    Stripe: any;
  }
}

export default function StripeProvider({ children }: StripeProviderProps) {
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        setStripeLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Stripe.js');
      };
      document.head.appendChild(script);
    } else if (window.Stripe) {
      setStripeLoaded(true);
    }
  }, []);

  return <>{children}</>;
}
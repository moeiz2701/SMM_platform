// app/client/profileCompletion/layout.tsx
'use client'


import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);


export default function ProfileCompletionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}

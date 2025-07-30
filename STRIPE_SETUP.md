# Stripe Payment Integration Setup

This guide explains how to set up and use the Stripe payment integration in the SMM Platform.

## Prerequisites

1. **Stripe Account**: Create a free account at [stripe.com](https://stripe.com)
2. **API Keys**: Get your publishable and secret keys from the Stripe Dashboard

## Environment Configuration

1. Copy `.env.example` to `.env.local` (for Next.js) and `.env` (for backend)
2. Add your Stripe keys:

```env
# Frontend (.env.local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Backend (.env)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## Features Implemented

### 🔒 Secure Payment Processing
- **Stripe Elements**: Real-time card validation and formatting
- **PCI Compliance**: No sensitive card data stored locally
- **Secure Tokenization**: Payment methods stored as Stripe tokens

### 💳 Payment Form Features
- **Real-time Validation**: Instant feedback on card input
- **Card Brand Detection**: Automatic detection of Visa, Mastercard, etc.
- **Error Handling**: Clear error messages for invalid inputs
- **Loading States**: Visual feedback during processing

### 🎯 Integration Points

#### 1. Profile Completion Form
- **Location**: `/client/profileCompletion` (Step 4)
- **Features**: 
  - Card holder name input
  - Stripe Elements card input
  - Real-time validation
  - Payment method creation

#### 2. Profile Display Page
- **Location**: `/client/profile`
- **Features**:
  - Masked card display (`**** **** **** 1234`)
  - Card brand and expiry display
  - Payment method management

#### 3. Backend API
- **Endpoint**: `POST /api/v1/clients/:id/payment-method`
- **Features**:
  - Stripe payment method processing
  - Customer management
  - Secure metadata storage

## Usage Instructions

### For Users
1. **Complete Profile**: Fill out the 4-step profile creation form
2. **Add Payment**: Enter card details in Step 4 using the secure Stripe form
3. **Validation**: Real-time feedback ensures card details are correct
4. **Completion**: Payment method is securely stored and linked to profile

### For Developers

#### Frontend Integration
```typescript
// Stripe is automatically loaded and initialized
// Card element is mounted to #stripe-card-element
// Real-time validation provides user feedback
```

#### Backend Integration
```javascript
// Payment method creation
const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

// Store safe metadata only
client.paymentInfo = {
  stripePaymentMethodId: paymentMethod.id,
  cardLast4: paymentMethod.card.last4,
  cardBrand: paymentMethod.card.brand,
  // ... other safe fields
};
```

## Security Features

### ✅ What We Store (Safe)
- Stripe Payment Method ID
- Last 4 digits of card
- Card brand (Visa, Mastercard, etc.)
- Expiry month/year
- Card holder name

### ❌ What We DON'T Store (Sensitive)
- Full card numbers
- CVV codes
- Raw card data
- Unencrypted payment information

## Testing

### Test Card Numbers
Use these test cards in development:

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
American Express: 3782 822463 10005
Declined: 4000 0000 0000 0002
```

### Test Flow
1. Start the development server
2. Navigate to `/client/profileCompletion`
3. Complete steps 1-3 with test data
4. In step 4, use test card numbers
5. Verify payment method is created and stored

## Troubleshooting

### Common Issues

1. **"Stripe not loaded"**
   - Check internet connection
   - Verify Stripe.js script loads correctly
   - Check browser console for errors

2. **"Invalid publishable key"**
   - Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
   - Ensure key starts with `pk_test_` or `pk_live_`

3. **Payment method creation fails**
   - Check backend `STRIPE_SECRET_KEY` is set
   - Verify API endpoint is accessible
   - Check server logs for Stripe API errors

### Debug Mode
Enable debug logging by adding to your environment:
```env
DEBUG=stripe:*
```

## Production Deployment

### Before Going Live
1. **Replace test keys** with live Stripe keys
2. **Enable webhooks** for payment status updates
3. **Test thoroughly** with real card numbers
4. **Review security** settings in Stripe Dashboard

### Live Keys
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
```

## Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Elements Guide**: [stripe.com/docs/stripe-js](https://stripe.com/docs/stripe-js)
- **Payment Methods API**: [stripe.com/docs/api/payment_methods](https://stripe.com/docs/api/payment_methods)

## Architecture Overview

```
Frontend (Next.js)
├── Stripe.js Library (CDN)
├── Stripe Elements (Card Input)
├── Payment Method Creation
└── API Calls to Backend

Backend (Node.js/Express)
├── Stripe Node.js Library
├── Payment Method Processing
├── Customer Management
└── Secure Metadata Storage

Database (MongoDB)
└── Safe Payment Metadata Only
```

This integration provides a secure, user-friendly payment experience while maintaining PCI compliance through Stripe's infrastructure.
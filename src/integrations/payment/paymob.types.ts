export interface PaymobBillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  apartment: string;
  floor: string;
  street: string;
  building: string;
  shipping_method: string;
  postal_code: string;
  city: string;
  country: string;
  state: string;
}

export interface PaymobCheckoutInput {
  paymentId: string;
  amountCents: number;
  currencyCode: string;
  method: 'card' | 'applePay';
  billingData: PaymobBillingData;
}

export interface PaymobCheckout {
  providerOrderId: string;
  iframeUrl: string;
}

export interface Plan {
  name: string;
  price: number;
  period: string;
  features: string[];
  note?: string;
  yearlyPrice?: number;
  storage?: number;
  currency?: string;
}

export interface Service {
  id: string;
  name: string;
  provider: string;
  currency?: string;
  cancelUrl?: string;
  plans: Plan[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  services: Service[];
}

export interface SubscriptionData {
  lastUpdated: string;
  categories: Category[];
}

export interface MySubscription {
  serviceId: string;
  planName: string;
  price: number;
  currency?: string;
  yearlyPrice?: number;
  paymentDay?: number;
  memo?: string;
}

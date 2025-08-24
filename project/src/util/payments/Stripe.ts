// Credits
export type CreditTypes = "1X_L1" | "1X_L2";
export type CreditProductsType = {
  [key in CreditTypes]?: {
    title: string;
  };
};
export const credit_products: CreditProductsType = {
  "1X_L1": {
    title: "5 Credits",
  },
  "1X_L2": {
    title: "10 Credits",
  },
};

// Subscriptions
export type SubscriptionTypes = "1M_L1" | "1M_L2" | "1M_L3";
type SubscriptionProductsType = {
  [key in SubscriptionTypes]?: {
    title: string;
  };
};
export const subscription_products: SubscriptionProductsType = {
  "1M_L1": { title: "1 Month | Level 1" },
  "1M_L2": { title: "1 Month | Level 2" },
  "1M_L3": { title: "1 Month | Level 3" },
};

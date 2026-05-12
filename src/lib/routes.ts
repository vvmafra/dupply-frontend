export const ROUTES = {
  home: "/",
  login: "/login",
  selectProfile: "/select-profile",

  seller: {
    dashboard: "/seller",
    validation: "/seller/validation",
    receivables: {
      list: "/seller/receivables",
      new: "/seller/receivables/new",
      detail: (id: string) => `/seller/receivables/${id}`,
    },
  },

  investor: {
    dashboard: "/investor",
    marketplace: {
      list: "/investor/marketplace",
      detail: (id: string) => `/investor/marketplace/${id}`,
    },
    positions: "/investor/positions",
  },

  admin: {
    dashboard: "/admin",
    validations: "/admin/validations",
    receivables: "/admin/receivables",
    transactions: "/admin/transactions",
  },

  confirmation: (id: string) => `/confirmation/${id}`,
} as const;

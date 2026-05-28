export const ROUTES = {
  home: "/",
  login: "/login",
  sellerRegistration: "/register/seller",
  sellerRegistrationComplete: "/register/seller/complete",
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

  analyst: {
    dashboard: "/analyst",
    sellers: {
      list: "/analyst/sellers",
      detail: (id: string) => `/analyst/sellers/${id}`,
    },
    receivables: {
      list: "/analyst/receivables",
      detail: (id: string) => `/analyst/receivables/${id}`,
    },
  },

  admin: {
    dashboard: "/admin",
    validations: "/admin/validations",
    receivables: "/admin/receivables",
    transactions: "/admin/transactions",
    sellers: {
      list: "/admin/sellers",
      detail: (id: string) => `/admin/sellers/${id}`,
    },
  },

  confirmation: {
    path: "/confirmation/:id",
    detail: (id: string) => `/confirmation/${id}`,
  },
} as const;

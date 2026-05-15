export const ROUTES = {
  home: "/",
  login: "/login",
  sellerRegistration: "/register/seller",
  selectProfile: "/select-profile",

  seller: {
    dashboard: "/seller",
    validation: "/seller/validation",
    duplicatas: {
      list: "/seller/duplicatas",
      new: "/seller/duplicatas/new",
    },
  },

  analyst: {
    dashboard: "/analyst",
    sellers: {
      list: "/analyst/sellers",
      detail: (id: string) => `/analyst/sellers/${id}`,
    },
    duplicatas: {
      list: "/analyst/duplicatas",
      detail: (id: string) => `/analyst/duplicatas/${id}`,
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

  confirmation: (id: string) => `/confirmation/${id}`,
} as const;

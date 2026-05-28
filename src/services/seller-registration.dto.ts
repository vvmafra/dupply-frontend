export type RegisterSellerRequestDTO = {
  email: string;
  password: string;
  name: string;
  role: "seller";
};

/** 201 — extends login token body with seller id */
export type RegisterSellerResponseDTO = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
  sellerId: string;
};

export type RegisterErrorBodyDTO = {
  error:
    | "email_already_exists"
    | "validation_error"
    | "unauthorized"
    | string;
  message?: string;
};

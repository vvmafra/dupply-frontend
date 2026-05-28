export type AuthTokenResponseDTO = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
};

export type AuthErrorBodyDTO = {
  error: string;
  message?: string;
};

export type AccountResponseDTO = {
  id: string;
  email: string;
  role: "seller" | "payer" | "risk_analyst" | "risk_analyst_agent" | "admin";
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

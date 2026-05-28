import { z } from "zod";

export const authLoginSchema = z.object({
  email: z.string().trim().min(1, "Informe um e-mail válido").email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe sua senha"),
});

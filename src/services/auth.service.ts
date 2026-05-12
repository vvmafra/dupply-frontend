import { sleep } from "@/lib/utils";
import type { UserProfile } from "@/domain/auth/auth.types";

export async function mockLogin(email: string, _password: string): Promise<{ success: boolean }> {
  await sleep(800);
  if (!email) return { success: false };
  return { success: true };
}

export async function selectProfile(_profile: UserProfile): Promise<{ success: boolean }> {
  await sleep(300);
  return { success: true };
}

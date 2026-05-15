import { sleep } from "@/lib/utils";
import type { SellerRegistrationFormValues } from "@/domain/seller/seller-registration.schema";

export async function registerSeller(
  _payload: SellerRegistrationFormValues
): Promise<{ success: boolean }> {
  await sleep(900);
  return { success: true };
}

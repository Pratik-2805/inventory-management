"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getPurchaseReturns() {
  try {
    const res = await fetch(`${API_URL}/returns`, { cache: "no-store" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch purchase returns");
    }
    return await res.json();
  } catch (error: unknown) {
    console.error("getPurchaseReturns error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch purchase returns";
    return { success: false, error: msg };
  }
}

export async function createPurchaseReturn(formData: unknown) {
  try {
    const res = await fetch(`${API_URL}/returns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to file purchase return");
    }

    revalidatePath("/purchase-returns");
    revalidatePath("/inventory");
    revalidatePath("/stock-ledger");
    revalidatePath("/");

    return data;
  } catch (error: unknown) {
    console.error("createPurchaseReturn error:", error);
    const msg = error instanceof Error ? error.message : "Failed to file purchase return";
    return { success: false, error: msg };
  }
}

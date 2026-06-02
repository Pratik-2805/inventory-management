"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getPurchaseBills() {
  try {
    const res = await fetch(`${API_URL}/purchases`, { cache: "no-store" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch purchase bills");
    }
    return await res.json();
  } catch (error: unknown) {
    console.error("getPurchaseBills error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch purchase bills";
    return { success: false, error: msg };
  }
}

export async function createPurchaseBill(formData: unknown) {
  try {
    const res = await fetch(`${API_URL}/purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create purchase bill");
    }

    revalidatePath("/stock-in");
    revalidatePath("/inventory");
    revalidatePath("/stock-ledger");
    revalidatePath("/");

    return data;
  } catch (error: unknown) {
    console.error("createPurchaseBill error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create purchase bill";
    return { success: false, error: msg };
  }
}

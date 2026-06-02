"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getInventoryValuationAction() {
  try {
    const res = await fetch(`${API_URL}/inventory/valuation`, { cache: "no-store" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch inventory valuation");
    }
    return await res.json();
  } catch (error: unknown) {
    console.error("getInventoryValuationAction error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch inventory valuation";
    return { success: false, error: msg };
  }
}

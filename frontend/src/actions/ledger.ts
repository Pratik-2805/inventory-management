"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getStockMovements(filters?: {
  productId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const params = new URLSearchParams();
    if (filters?.productId) params.append("productId", filters.productId);
    if (filters?.movementType) params.append("movementType", filters.movementType);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const queryString = params.toString();
    const url = queryString ? `${API_URL}/ledger/movements?${queryString}` : `${API_URL}/ledger/movements`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch stock movements");
    }
    return await res.json();
  } catch (error: unknown) {
    console.error("getStockMovements error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch stock movements";
    return { success: false, error: msg };
  }
}

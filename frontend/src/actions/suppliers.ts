"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getSuppliers(searchQuery?: string) {
  try {
    const url = searchQuery
      ? `${API_URL}/suppliers?searchQuery=${encodeURIComponent(searchQuery)}`
      : `${API_URL}/suppliers`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch suppliers");
    }
    return await res.json();
  } catch (error: unknown) {
    console.error("getSuppliers error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch suppliers";
    return { success: false, error: msg };
  }
}

export async function createSupplier(formData: unknown) {
  try {
    const res = await fetch(`${API_URL}/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create supplier");
    }

    revalidatePath("/suppliers");
    return data;
  } catch (error: unknown) {
    console.error("createSupplier error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create supplier";
    return { success: false, error: msg };
  }
}

export async function updateSupplier(id: string, formData: unknown) {
  try {
    const res = await fetch(`${API_URL}/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to update supplier");
    }

    revalidatePath("/suppliers");
    return data;
  } catch (error: unknown) {
    console.error("updateSupplier error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update supplier";
    return { success: false, error: msg };
  }
}

export async function deleteSupplier(id: string) {
  try {
    const res = await fetch(`${API_URL}/suppliers/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to delete supplier");
    }

    revalidatePath("/suppliers");
    return data;
  } catch (error: unknown) {
    console.error("deleteSupplier error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete supplier";
    return { success: false, error: msg };
  }
}

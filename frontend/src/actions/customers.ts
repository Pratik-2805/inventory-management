"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getCustomers(searchQuery?: string) {
  try {
    const url = searchQuery
      ? `${API_URL}/customers?searchQuery=${encodeURIComponent(searchQuery)}`
      : `${API_URL}/customers`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch customers");
    }
    return await res.json();
  } catch (error: unknown) {
    console.error("getCustomers error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch customers";
    return { success: false, error: msg };
  }
}

export async function createCustomer(formData: unknown) {
  try {
    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create customer");
    }

    revalidatePath("/customers");
    return data;
  } catch (error: unknown) {
    console.error("createCustomer error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create customer";
    return { success: false, error: msg };
  }
}

export async function updateCustomer(id: string, formData: unknown) {
  try {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to update customer");
    }

    revalidatePath("/customers");
    return data;
  } catch (error: unknown) {
    console.error("updateCustomer error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update customer";
    return { success: false, error: msg };
  }
}

export async function deleteCustomer(id: string) {
  try {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to delete customer");
    }

    revalidatePath("/customers");
    return data;
  } catch (error: unknown) {
    console.error("deleteCustomer error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete customer";
    return { success: false, error: msg };
  }
}

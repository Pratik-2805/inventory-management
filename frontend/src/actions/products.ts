"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getProducts(options?: {
  searchQuery?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const params = new URLSearchParams();
    if (options?.searchQuery) params.append("searchQuery", options.searchQuery);
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_URL}/products?${queryString}` : `${API_URL}/products`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch products");
    }
    return await res.json();
  } catch (error: unknown) {
    console.error("getProducts error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch products";
    return { success: false, error: msg };
  }
}

export async function createProduct(formData: unknown) {
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create product");
    }

    revalidatePath("/products");
    return data;
  } catch (error: unknown) {
    console.error("createProduct error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create product";
    return { success: false, error: msg };
  }
}

export async function updateProduct(id: string, formData: unknown) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to update product");
    }

    revalidatePath("/products");
    return data;
  } catch (error: unknown) {
    console.error("updateProduct error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update product";
    return { success: false, error: msg };
  }
}

export async function deleteProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to delete product");
    }

    revalidatePath("/products");
    return data;
  } catch (error: unknown) {
    console.error("deleteProduct error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete product";
    return { success: false, error: msg };
  }
}

"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getDeliveryPartners(searchQuery?: string) {
  try {
    const url = searchQuery
      ? `${API_URL}/delivery-partners?searchQuery=${encodeURIComponent(searchQuery)}`
      : `${API_URL}/delivery-partners`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch delivery partners");
    }
    return await res.json();
  } catch (error: unknown) {
    console.error("getDeliveryPartners error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch delivery partners";
    return { success: false, error: msg };
  }
}

export async function createDeliveryPartner(formData: unknown) {
  try {
    const res = await fetch(`${API_URL}/delivery-partners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create delivery partner");
    }

    revalidatePath("/delivery-partners");
    return data;
  } catch (error: unknown) {
    console.error("createDeliveryPartner error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create delivery partner";
    return { success: false, error: msg };
  }
}

export async function updateDeliveryPartner(id: string, formData: unknown) {
  try {
    const res = await fetch(`${API_URL}/delivery-partners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to update delivery partner");
    }

    revalidatePath("/delivery-partners");
    return data;
  } catch (error: unknown) {
    console.error("updateDeliveryPartner error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update delivery partner";
    return { success: false, error: msg };
  }
}

export async function deleteDeliveryPartner(id: string) {
  try {
    const res = await fetch(`${API_URL}/delivery-partners/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to delete delivery partner");
    }

    revalidatePath("/delivery-partners");
    return data;
  } catch (error: unknown) {
    console.error("deleteDeliveryPartner error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete delivery partner";
    return { success: false, error: msg };
  }
}

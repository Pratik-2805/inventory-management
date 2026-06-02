import { z } from "zod";

// GSTIN format: 2 numbers, 5 letters, 4 numbers, 1 letter, 1 alphanumeric, 'Z', 1 alphanumeric
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

export const supplierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  code: z.string().min(2, "Supplier Code must be at least 2 characters").max(10, "Supplier Code cannot exceed 10 characters").toUpperCase(),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters long"),
});

export const productSchema = z.object({
  sku: z.string().min(3, "SKU must be at least 3 characters").toUpperCase(),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  hsnCode: z.string().min(4, "HSN Code must be at least 4 digits").regex(/^[0-9]+$/, "HSN Code must contain only numbers"),
  gstRate: z.number().min(0, "GST Rate cannot be negative").max(100, "GST Rate cannot exceed 100"),
});

export const purchaseItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID selection"),
  quantity: z.number().int().gt(0, "Quantity must be greater than 0"),
  rate: z.number().gt(0, "Rate must be greater than 0"),
});

export const purchaseBillSchema = z.object({
  supplierId: z.string().uuid("Please select a valid supplier"),
  deliveryPartnerId: z.string().uuid("Invalid delivery partner selected").optional().nullable().or(z.literal("")),
  trackingNumber: z.string().optional().nullable(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().or(z.date()).transform((val) => new Date(val)),
  transportCharges: z.number().min(0, "Transport charges cannot be negative").default(0),
  items: z.array(purchaseItemSchema).min(1, "At least one item is required in a purchase bill"),
});

export const deliveryPartnerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  phone: z.string().optional().nullable().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  type: z.enum(["TRANSPORT", "LOCAL"]).default("TRANSPORT"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
}).transform((val) => ({
  ...val,
  phone: val.phone === "" ? null : val.phone,
  email: val.email === "" ? null : val.email,
}));

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters long"),
});

export const purchaseReturnItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID selection"),
  quantity: z.number().int().gt(0, "Quantity must be greater than 0"),
  rate: z.number().gt(0, "Rate must be greater than 0"),
  reason: z.enum([
    "Stitching Defect",
    "Fabric Damage",
    "Color Mismatch",
    "Size Mismatch",
    "Wrong Item",
    "Other"
  ]),
});

export const purchaseReturnSchema = z.object({
  supplierId: z.string().uuid("Please select a valid supplier"),
  purchaseBillId: z.string().uuid("Please select a valid purchase bill"),
  returnDate: z.string().or(z.date()).transform((val) => new Date(val)),
  reason: z.string().optional(),
  items: z.array(purchaseReturnItemSchema).min(1, "At least one item is required for purchase return"),
});

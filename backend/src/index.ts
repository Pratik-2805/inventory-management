import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./lib/db";
import { getInventoryValuation } from "./services/inventory";
import {
  customerSchema,
  deliveryPartnerSchema,
  productSchema,
  purchaseBillSchema,
  purchaseReturnSchema,
  supplierSchema,
} from "./lib/validators";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Customers API
// ----------------------------------------------------

app.get("/api/customers", async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.searchQuery as string | undefined;
    const customers = await prisma.customer.findMany({
      where: searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery, mode: "insensitive" } },
              { email: { contains: searchQuery, mode: "insensitive" } },
              { phone: { contains: searchQuery, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: customers });
  } catch (error: any) {
    console.error("getCustomers error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch customers" });
  }
});

app.post("/api/customers", async (req: Request, res: Response) => {
  try {
    const validated = customerSchema.parse(req.body);
    const customer = await prisma.customer.create({
      data: validated,
    });
    res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    console.error("createCustomer error:", error);
    if (error && typeof error === "object" && "errors" in error) {
      const errList = error.errors;
      return res.status(400).json({ success: false, error: errList[0]?.message || "Validation failed" });
    }
    res.status(400).json({ success: false, error: error.message || "Failed to create customer" });
  }
});

app.put("/api/customers/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = customerSchema.parse(req.body);
    const customer = await prisma.customer.update({
      where: { id },
      data: validated,
    });
    res.json({ success: true, data: customer });
  } catch (error: any) {
    console.error("updateCustomer error:", error);
    if (error && typeof error === "object" && "errors" in error) {
      const errList = error.errors;
      return res.status(400).json({ success: false, error: errList[0]?.message || "Validation failed" });
    }
    res.status(400).json({ success: false, error: error.message || "Failed to update customer" });
  }
});

app.delete("/api/customers/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("deleteCustomer error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to delete customer" });
  }
});

// ----------------------------------------------------
// Delivery Partners API
// ----------------------------------------------------

app.get("/api/delivery-partners", async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.searchQuery as string | undefined;
    const partners = await prisma.deliveryPartner.findMany({
      where: searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery, mode: "insensitive" } },
              { email: { contains: searchQuery, mode: "insensitive" } },
              { phone: { contains: searchQuery, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: partners });
  } catch (error: any) {
    console.error("getDeliveryPartners error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch delivery partners" });
  }
});

app.post("/api/delivery-partners", async (req: Request, res: Response) => {
  try {
    const validated = deliveryPartnerSchema.parse(req.body);
    const partner = await prisma.deliveryPartner.create({
      data: validated,
    });
    res.status(201).json({ success: true, data: partner });
  } catch (error: any) {
    console.error("createDeliveryPartner error:", error);
    if (error && typeof error === "object" && "errors" in error) {
      const errList = error.errors;
      return res.status(400).json({ success: false, error: errList[0]?.message || "Validation failed" });
    }
    res.status(400).json({ success: false, error: error.message || "Failed to create delivery partner" });
  }
});

app.put("/api/delivery-partners/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = deliveryPartnerSchema.parse(req.body);
    const partner = await prisma.deliveryPartner.update({
      where: { id },
      data: validated,
    });
    res.json({ success: true, data: partner });
  } catch (error: any) {
    console.error("updateDeliveryPartner error:", error);
    if (error && typeof error === "object" && "errors" in error) {
      const errList = error.errors;
      return res.status(400).json({ success: false, error: errList[0]?.message || "Validation failed" });
    }
    res.status(400).json({ success: false, error: error.message || "Failed to update delivery partner" });
  }
});

app.delete("/api/delivery-partners/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linkedBills = await prisma.purchaseBill.count({
      where: { deliveryPartnerId: id },
    });
    if (linkedBills > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete delivery partner. They are linked to existing purchase bills.",
      });
    }
    await prisma.deliveryPartner.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("deleteDeliveryPartner error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to delete delivery partner" });
  }
});

// ----------------------------------------------------
// Inventory Valuation API
// ----------------------------------------------------

app.get("/api/inventory/valuation", async (req: Request, res: Response) => {
  try {
    const data = await getInventoryValuation();
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("getInventoryValuationAction error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch inventory valuation" });
  }
});

// ----------------------------------------------------
// Stock Ledger / Movements API
// ----------------------------------------------------

app.get("/api/ledger/movements", async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId as string | undefined;
    const movementType = req.query.movementType as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (movementType) {
      where.movementType = movementType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: movements });
  } catch (error: any) {
    console.error("getStockMovements error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch stock movements" });
  }
});

// ----------------------------------------------------
// Products API
// ----------------------------------------------------

app.get("/api/products", async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.searchQuery as string | undefined;
    const page = parseInt(req.query.page as string || "1");
    const limit = parseInt(req.query.limit as string || "10");
    const skip = (page - 1) * limit;

    const where = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" as const } },
            { sku: { contains: searchQuery, mode: "insensitive" as const } },
            { brand: { contains: searchQuery, mode: "insensitive" as const } },
            { category: { contains: searchQuery, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("getProducts error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch products" });
  }
});

app.post("/api/products", async (req: Request, res: Response) => {
  try {
    const validated = productSchema.parse(req.body);

    const existing = await prisma.product.findUnique({
      where: { sku: validated.sku },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: `SKU '${validated.sku}' already exists.` });
    }

    const product = await prisma.product.create({
      data: validated,
    });
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    console.error("createProduct error:", error);
    if (error && typeof error === "object" && "errors" in error) {
      const errList = error.errors;
      return res.status(400).json({ success: false, error: errList[0]?.message || "Validation failed" });
    }
    res.status(400).json({ success: false, error: error.message || "Failed to create product" });
  }
});

app.put("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = productSchema.parse(req.body);

    const existing = await prisma.product.findFirst({
      where: {
        sku: validated.sku,
        id: { not: id },
      },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: `SKU '${validated.sku}' is already in use by another product.` });
    }

    const product = await prisma.product.update({
      where: { id },
      data: validated,
    });
    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error("updateProduct error:", error);
    if (error && typeof error === "object" && "errors" in error) {
      const errList = error.errors;
      return res.status(400).json({ success: false, error: errList[0]?.message || "Validation failed" });
    }
    res.status(400).json({ success: false, error: error.message || "Failed to update product" });
  }
});

app.delete("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movementCount = await prisma.stockMovement.count({
      where: { productId: id },
    });

    if (movementCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete product. It has associated stock movements in the ledger.",
      });
    }

    await prisma.product.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to delete product" });
  }
});

// ----------------------------------------------------
// Purchases API
// ----------------------------------------------------

app.get("/api/purchases", async (req: Request, res: Response) => {
  try {
    const bills = await prisma.purchaseBill.findMany({
      include: {
        supplier: true,
        deliveryPartner: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { invoiceDate: "desc" },
    });
    res.json({ success: true, data: bills });
  } catch (error: any) {
    console.error("getPurchaseBills error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch purchase bills" });
  }
});

app.post("/api/purchases", async (req: Request, res: Response) => {
  try {
    const validated = purchaseBillSchema.parse(req.body);
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.purchaseBill.findFirst({
        where: {
          supplierId: validated.supplierId,
          invoiceNumber: { equals: validated.invoiceNumber, mode: "insensitive" },
        },
      });

      if (existing) {
        throw new Error(
          `Invoice number '${validated.invoiceNumber}' already exists for this supplier.`
        );
      }

      const productIds = validated.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      let computedTaxable = 0;
      let computedCgst = 0;
      let computedSgst = 0;
      let computedIgst = 0;

      const gstType = (req.body?.gstType as string) || "CGST_SGST";
      const billItemsData = [];

      for (const item of validated.items) {
        const prod = productMap.get(item.productId);
        if (!prod) {
          throw new Error(`Product with ID '${item.productId}' not found.`);
        }

        const amount = item.quantity * item.rate;
        computedTaxable += amount;

        const itemGst = amount * (prod.gstRate / 100);
        if (gstType === "IGST") {
          computedIgst += itemGst;
        } else {
          computedCgst += itemGst / 2;
          computedSgst += itemGst / 2;
        }

        billItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          rate: item.rate,
          amount: amount,
        });
      }

      const grandTotal =
        computedTaxable +
        computedCgst +
        computedSgst +
        computedIgst +
        validated.transportCharges;

      const bill = await tx.purchaseBill.create({
        data: {
          supplierId: validated.supplierId,
          deliveryPartnerId: validated.deliveryPartnerId || null,
          trackingNumber: validated.trackingNumber || null,
          invoiceNumber: validated.invoiceNumber,
          invoiceDate: validated.invoiceDate,
          taxableAmount: computedTaxable,
          cgst: computedCgst,
          sgst: computedSgst,
          igst: computedIgst,
          transportCharges: validated.transportCharges,
          grandTotal: grandTotal,
          items: {
            create: billItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      for (const billItem of bill.items) {
        await tx.stockMovement.create({
          data: {
            productId: billItem.productId,
            movementType: "PURCHASE",
            quantity: billItem.quantity,
            referenceType: "PURCHASE_BILL",
            referenceId: bill.id,
            remarks: `Purchased via Invoice #${bill.invoiceNumber}`,
          },
        });
      }

      return bill;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error("createPurchaseBill error transaction rollback:", error);
    res.status(400).json({ success: false, error: error.message || "Failed to create purchase bill" });
  }
});

// ----------------------------------------------------
// Returns API
// ----------------------------------------------------

app.get("/api/returns", async (req: Request, res: Response) => {
  try {
    const returns = await prisma.purchaseReturn.findMany({
      include: {
        supplier: true,
        purchaseBill: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { returnDate: "desc" },
    });
    res.json({ success: true, data: returns });
  } catch (error: any) {
    console.error("getPurchaseReturns error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch purchase returns" });
  }
});

app.post("/api/returns", async (req: Request, res: Response) => {
  try {
    const validated = purchaseReturnSchema.parse(req.body);
    const result = await prisma.$transaction(async (tx) => {
      const bill = await tx.purchaseBill.findUnique({
        where: { id: validated.purchaseBillId },
        include: { items: true },
      });

      if (!bill) {
        throw new Error("Target Purchase Bill not found.");
      }

      const billItemMap = new Map(bill.items.map((i) => [i.productId, i.quantity]));

      const existingReturns = await tx.purchaseReturn.findMany({
        where: { purchaseBillId: validated.purchaseBillId },
        include: { items: true },
      });

      const returnedTotalsMap = new Map<string, number>();
      for (const ret of existingReturns) {
        for (const item of ret.items) {
          returnedTotalsMap.set(
            item.productId,
            (returnedTotalsMap.get(item.productId) || 0) + item.quantity
          );
        }
      }

      let totalAmount = 0;
      const returnItemsData = [];

      for (const item of validated.items) {
        const purchasedQty = billItemMap.get(item.productId) || 0;
        if (purchasedQty === 0) {
          throw new Error("Cannot return a product that was not part of the original invoice.");
        }

        const alreadyReturnedQty = returnedTotalsMap.get(item.productId) || 0;
        const remainingQty = purchasedQty - alreadyReturnedQty;

        if (item.quantity > remainingQty) {
          throw new Error(
            `Quantity to return (${item.quantity}) exceeds remaining purchase quantity (${remainingQty}) for this product.`
          );
        }

        const amount = item.quantity * item.rate;
        totalAmount += amount;

        returnItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          rate: item.rate,
          amount: amount,
          reason: item.reason,
        });
      }

      const purchaseReturn = await tx.purchaseReturn.create({
        data: {
          supplierId: validated.supplierId,
          purchaseBillId: validated.purchaseBillId,
          returnDate: validated.returnDate,
          reason: validated.reason || "Defective goods return",
          totalAmount: totalAmount,
          items: {
            create: returnItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      for (const retItem of purchaseReturn.items) {
        await tx.stockMovement.create({
          data: {
            productId: retItem.productId,
            movementType: "PURCHASE_RETURN",
            quantity: -retItem.quantity,
            referenceType: "PURCHASE_RETURN",
            referenceId: purchaseReturn.id,
            remarks: `Returned: ${retItem.reason}. Ref Invoice #${bill.invoiceNumber}`,
          },
        });
      }

      return purchaseReturn;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error("createPurchaseReturn error transaction rollback:", error);
    res.status(400).json({ success: false, error: error.message || "Failed to file purchase return" });
  }
});

// ----------------------------------------------------
// Suppliers API
// ----------------------------------------------------

app.get("/api/suppliers", async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.searchQuery as string | undefined;
    const suppliers = await prisma.supplier.findMany({
      where: searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery, mode: "insensitive" } },
              { gstin: { contains: searchQuery, mode: "insensitive" } },
              { email: { contains: searchQuery, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: suppliers });
  } catch (error: any) {
    console.error("getSuppliers error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch suppliers" });
  }
});

app.post("/api/suppliers", async (req: Request, res: Response) => {
  try {
    const validated = supplierSchema.parse(req.body);
    const existing = await prisma.supplier.findFirst({
      where: { gstin: { equals: validated.gstin, mode: "insensitive" } },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: "A supplier with this GSTIN already exists." });
    }

    const supplier = await prisma.supplier.create({
      data: validated,
    });
    res.status(201).json({ success: true, data: supplier });
  } catch (error: any) {
    console.error("createSupplier error:", error);
    if (error && typeof error === "object" && "errors" in error) {
      const errList = error.errors;
      return res.status(400).json({ success: false, error: errList[0]?.message || "Validation failed" });
    }
    res.status(400).json({ success: false, error: error.message || "Failed to create supplier" });
  }
});

app.put("/api/suppliers/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = supplierSchema.parse(req.body);
    const existing = await prisma.supplier.findFirst({
      where: {
        gstin: { equals: validated.gstin, mode: "insensitive" },
        id: { not: id },
      },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: "Another supplier with this GSTIN already exists." });
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: validated,
    });
    res.json({ success: true, data: supplier });
  } catch (error: any) {
    console.error("updateSupplier error:", error);
    if (error && typeof error === "object" && "errors" in error) {
      const errList = error.errors;
      return res.status(400).json({ success: false, error: errList[0]?.message || "Validation failed" });
    }
    res.status(400).json({ success: false, error: error.message || "Failed to update supplier" });
  }
});

app.delete("/api/suppliers/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const linkedBills = await prisma.purchaseBill.count({
      where: { supplierId: id },
    });

    if (linkedBills > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete supplier. They have associated purchase invoices. Delete the invoices first.",
      });
    }

    await prisma.supplier.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("deleteSupplier error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to delete supplier" });
  }
});

// ----------------------------------------------------
// Dashboard Stats API
// ----------------------------------------------------
app.get("/api/dashboard", async (req: Request, res: Response) => {
  try {
    const [totalProducts, totalSuppliers, inventoryItems] = await Promise.all([
      prisma.product.count(),
      prisma.supplier.count(),
      getInventoryValuation()
    ]);

    const currentInventoryValue = inventoryItems.reduce((sum, item) => sum + item.valuation, 0);
    const lowStockCount = inventoryItems.filter((item) => item.currentStock <= 5).length;

    const recentMovements = await prisma.stockMovement.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
      },
    });

    const recentBills = await prisma.purchaseBill.findMany({
      take: 5,
      orderBy: { invoiceDate: "desc" },
      include: {
        supplier: true,
      },
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalSuppliers,
        currentInventoryValue,
        lowStockCount,
        recentMovements,
        recentBills
      }
    });
  } catch (error: any) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch dashboard data" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

import prisma from "../lib/db";

/**
 * Calculates the current stock for a specific product based on stock ledger movements.
 * Formula: SUM(PURCHASE + CUSTOMER_RETURN) - SUM(SALE + PURCHASE_RETURN + DAMAGE) + ADJUSTMENT
 */
export async function getProductStock(productId: string): Promise<number> {
  const movements = await prisma.stockMovement.findMany({
    where: { productId },
    select: { movementType: true, quantity: true },
  });

  let currentStock = 0;
  for (const m of movements) {
    const qty = Math.abs(m.quantity);
    switch (m.movementType) {
      case "PURCHASE":
      case "CUSTOMER_RETURN":
        currentStock += qty;
        break;
      case "SALE":
      case "PURCHASE_RETURN":
      case "DAMAGE":
        currentStock -= qty;
        break;
      case "ADJUSTMENT":
        currentStock += m.quantity; // Adjustments are signed
        break;
    }
  }

  return currentStock;
}

/**
 * Gets the latest purchase rate for a product.
 * Returns 0 if the product has never been purchased.
 */
export async function getLatestPurchaseRate(productId: string): Promise<number> {
  const latestItem = await prisma.purchaseItem.findFirst({
    where: { productId },
    orderBy: { purchaseBill: { invoiceDate: "desc" } },
    select: { rate: true },
  });

  return latestItem?.rate ?? 0;
}

/**
 * Retrieves the complete inventory valuation list.
 * Columns: SKU, Product Name, Category, Brand, Current Stock, Latest Purchase Rate, Valuation
 */
export async function getInventoryValuation() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      sku: true,
      name: true,
      brand: true,
      category: true,
      stockMovements: {
        select: {
          movementType: true,
          quantity: true,
        },
      },
      purchaseItems: {
        take: 1,
        orderBy: {
          purchaseBill: {
            invoiceDate: "desc",
          },
        },
        select: {
          rate: true,
        },
      },
    },
  });

  return products.map((product) => {
    // Calculate stock
    let stock = 0;
    for (const m of product.stockMovements) {
      const qty = Math.abs(m.quantity);
      switch (m.movementType) {
        case "PURCHASE":
        case "CUSTOMER_RETURN":
          stock += qty;
          break;
        case "SALE":
        case "PURCHASE_RETURN":
        case "DAMAGE":
          stock -= qty;
          break;
        case "ADJUSTMENT":
          stock += m.quantity;
          break;
      }
    }

    // Get latest rate
    const latestRate = product.purchaseItems[0]?.rate ?? 0;
    const valuation = stock * latestRate;

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      category: product.category,
      currentStock: stock,
      latestRate,
      valuation: valuation,
    };
  });
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "@/actions/products";
import { Plus, Search, Edit2, Trash2, Tag, Layers, Percent, ShieldAlert, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  hsnCode: string;
  gstRate: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    brand: "",
    category: "",
    hsnCode: "",
    gstRate: 18, // default standard GST
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchProducts = useCallback(async (query = "", pageNum = 1) => {
    setLoading(true);
    const res = await getProducts({
      searchQuery: query,
      page: pageNum,
      limit: 10
    });
    if (res.success && res.data && res.pagination) {
      setProducts(res.data);
      setPage(res.pagination.page);
      setTotalPages(res.pagination.totalPages);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts(searchQuery, page);
  }, [page, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchProducts(searchQuery, 1);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "gstRate" ? parseFloat(value) || 0 : value,
    }));
  };

  const openAddModal = () => {
    setIsEdit(false);
    setFormData({
      sku: "",
      name: "",
      brand: "",
      category: "",
      hsnCode: "",
      gstRate: 18,
    });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setIsEdit(true);
    setCurrentId(product.id);
    setFormData({
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      category: product.category,
      hsnCode: product.hsnCode,
      gstRate: product.gstRate,
    });
    setError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const dataToSend = {
      ...formData,
      sku: formData.sku.toUpperCase().trim(),
    };

    const res = isEdit 
      ? await updateProduct(currentId, dataToSend)
      : await createProduct(dataToSend);

    setSubmitting(false);

    if (res.success) {
      setSuccessMessage(isEdit ? "Product updated successfully!" : "Product created successfully!");
      setModalOpen(false);
      fetchProducts(searchQuery, page);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setError(res.error || "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    const res = await deleteProduct(id);
    if (res.success) {
      setSuccessMessage("Product deleted successfully!");
      fetchProducts(searchQuery, page);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(res.error || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-muted-foreground">
            Manage your universal product inventory master records.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          {successMessage}
        </div>
      )}

      {/* Filter / Search bar */}
      <div className="glass-panel p-4 rounded-xl flex items-center gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products by SKU, name, brand, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <button type="submit" className="btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Content Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">Brand / Category</th>
                <th className="px-6 py-4 font-semibold">HSN Code</th>
                <th className="px-6 py-4 font-semibold">GST Rate</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No products found. Click &quot;Add Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-indigo-600/10 text-indigo-500 text-xs font-mono font-bold rounded-md">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{product.brand}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Layers className="h-3.5 w-3.5" />
                        <span>{product.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {product.hsnCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        <Percent className="h-3 w-3 text-muted-foreground" />
                        <span>{product.gstRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary p-2 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary p-2 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {isEdit ? "Edit Product" : "Add Product"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                Close
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    name="sku"
                    required
                    placeholder="e.g. E-SH-9213"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="input-field font-mono uppercase"
                    disabled={isEdit} // SKU shouldn't be editable typically
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. YOGINI"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    required
                    placeholder="e.g. Abhivadan Fashion"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    required
                    placeholder="e.g. Shirts"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    name="hsnCode"
                    required
                    placeholder="e.g. 6205"
                    value={formData.hsnCode}
                    onChange={handleInputChange}
                    className="input-field font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    GST Rate (%)
                  </label>
                  <select
                    name="gstRate"
                    value={formData.gstRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, gstRate: parseFloat(e.target.value) }))}
                    className="input-field"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Garments/Base)</option>
                    <option value={12}>12% (Standard Lower)</option>
                    <option value={18}>18% (Standard)</option>
                    <option value={28}>28% (Luxury)</option>
                  </select>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary min-w-[100px] flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

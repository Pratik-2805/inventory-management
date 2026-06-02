"use client";

import { useEffect, useState } from "react";
import { 
  getSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier 
} from "@/actions/suppliers";
import { Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, ShieldAlert, Loader2, User, FileText } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    gstin: "",
    phone: "",
    email: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchSuppliers = async (query = "") => {
    setLoading(true);
    const res = await getSuppliers(query);
    if (res.success && res.data) {
      setSuppliers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuppliers(searchQuery);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setIsEdit(false);
    setFormData({
      name: "",
      gstin: "",
      phone: "",
      email: "",
      address: "",
    });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setIsEdit(true);
    setCurrentId(supplier.id);
    setFormData({
      name: supplier.name,
      gstin: supplier.gstin,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
    });
    setError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    // Capitalize GSTIN for validation and consistency
    const dataToSend = {
      ...formData,
      gstin: formData.gstin.toUpperCase(),
    };

    const res = isEdit 
      ? await updateSupplier(currentId, dataToSend)
      : await createSupplier(dataToSend);

    setSubmitting(false);

    if (res.success) {
      setSuccessMessage(isEdit ? "Supplier updated successfully!" : "Supplier created successfully!");
      setModalOpen(false);
      fetchSuppliers(searchQuery);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setError(res.error || "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    
    const res = await deleteSupplier(id);
    if (res.success) {
      setSuccessMessage("Supplier deleted successfully!");
      fetchSuppliers(searchQuery);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(res.error || "Failed to delete supplier");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Suppliers</h2>
          <p className="text-sm text-muted-foreground">
            Manage your product suppliers and their tax details.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
          Add Supplier
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
              placeholder="Search suppliers by name, GSTIN, or email..."
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
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">GSTIN</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold">Address</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                      Loading suppliers...
                    </div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No suppliers found. Click &quot;Add Supplier&quot; to create one.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {supplier.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-indigo-600/10 text-indigo-500 text-xs font-mono font-bold rounded-full">
                        {supplier.gstin}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{supplier.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{supplier.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(supplier)}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete Supplier"
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
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden animate-modal">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground tracking-tight">
                {isEdit ? "✏️ Edit Supplier Profile" : "🏭 Add New Supplier"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold hover:bg-muted p-1 px-2.5 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group space-y-1">
                <label className="form-label">Supplier Name</label>
                <div className="input-icon-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Senseo Ethnic LLP"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group space-y-1">
                  <label className="form-label">GSTIN</label>
                  <div className="input-icon-wrapper">
                    <FileText className="input-icon" />
                    <input
                      type="text"
                      name="gstin"
                      required
                      maxLength={15}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      value={formData.gstin}
                      onChange={handleInputChange}
                      className="input-field font-mono uppercase"
                    />
                  </div>
                </div>
                <div className="form-group space-y-1">
                  <label className="form-label">Phone Number</label>
                  <div className="input-icon-wrapper">
                    <Phone className="input-icon" />
                    <input
                      type="text"
                      name="phone"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group space-y-1">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. contact@supplier.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-group space-y-1">
                <label className="form-label">Address</label>
                <div className="input-icon-wrapper">
                  <MapPin className="input-icon" />
                  <textarea
                    name="address"
                    required
                    rows={3}
                    placeholder="Street address, City, State, ZIP"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field resize-none"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-border mt-6">
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
                  className="btn-primary min-w-[110px]"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Details"
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

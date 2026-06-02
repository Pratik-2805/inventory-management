"use client";

import { useEffect, useState } from "react";
import { 
  getDeliveryPartners, 
  createDeliveryPartner, 
  updateDeliveryPartner, 
  deleteDeliveryPartner 
} from "@/actions/delivery-partners";
import { Plus, Search, Edit2, Trash2, Mail, Phone, ShieldAlert, Loader2, Compass } from "lucide-react";

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    status: "ACTIVE",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPartners = async (query = "") => {
    setLoading(true);
    const res = await getDeliveryPartners(query);
    if (res.success && res.data) {
      setPartners(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPartners(searchQuery);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      phone: "",
      email: "",
      status: "ACTIVE",
    });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (partner: DeliveryPartner) => {
    setIsEdit(true);
    setCurrentId(partner.id);
    setFormData({
      name: partner.name,
      phone: partner.phone,
      email: partner.email,
      status: partner.status,
    });
    setError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = isEdit 
      ? await updateDeliveryPartner(currentId, formData)
      : await createDeliveryPartner(formData);

    setSubmitting(false);

    if (res.success) {
      setSuccessMessage(isEdit ? "Delivery partner updated!" : "Delivery partner created!");
      setModalOpen(false);
      fetchPartners(searchQuery);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setError(res.error || "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery partner?")) return;
    
    const res = await deleteDeliveryPartner(id);
    if (res.success) {
      setSuccessMessage("Delivery partner deleted!");
      fetchPartners(searchQuery);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert(res.error || "Failed to delete delivery partner");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Delivery Partners</h2>
          <p className="text-sm text-muted-foreground">
            Manage logistics/courier delivery partners used to transport stock.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
          Add Delivery Partner
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
              placeholder="Search delivery partners by name, phone or email..."
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
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                      Loading delivery partners...
                    </div>
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No delivery partners found. Click &quot;Add Delivery Partner&quot; to create one.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <Compass className="h-4 w-4 text-muted-foreground" />
                        <span>{partner.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        partner.status === "ACTIVE" 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                      }`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{partner.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{partner.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(partner)}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Partner"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete Partner"
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
          <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {isEdit ? "Edit Delivery Partner" : "Add Delivery Partner"}
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Partner Name / Company
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Blue Dart, Delhivery"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    placeholder="e.g. 1800200300"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. support@courier.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
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

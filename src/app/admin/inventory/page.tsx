'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  X,
  ShieldCheck,
  TrendingDown,
  ShoppingBag,
  Dumbbell
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  category: string;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR';
  purchaseDate?: string | null;
  warrantyExpiry?: string | null;
  maintenanceFrequencyDays: number;
  lastServicedDate?: string | null;
  nextServiceDate?: string | null;
  notes?: string | null;
  maintenanceLogs?: Array<{
    id: string;
    issueDescription: string;
    cost: number;
    status: string;
    createdAt: string;
    loggedBy?: { name: string };
  }>;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  sku?: string | null;
  isActive: boolean;
}

const CONDITION_COLORS = {
  EXCELLENT: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  GOOD: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  FAIR: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  NEEDS_REPAIR: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
};

export default function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState<'EQUIPMENT' | 'PRODUCTS'>('EQUIPMENT');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showLogMaintenanceModal, setShowLogMaintenanceModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Forms
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    category: 'Strength',
    condition: 'EXCELLENT',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: '',
    maintenanceFrequencyDays: 90,
    notes: '',
  });

  const [productForm, setProductForm] = useState({
    name: '',
    category: 'SUPPLEMENT',
    price: '',
    costPrice: '',
    stockQuantity: '',
    reorderLevel: '5',
    sku: '',
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    issueDescription: '',
    cost: '',
    status: 'REPORTED',
    notes: '',
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/inventory');
      if (res.ok) {
        const data = await res.json();
        setEquipment(data.equipment || []);
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentForm),
      });
      if (res.ok) {
        setShowAddEquipmentModal(false);
        setEquipmentForm({
          name: '',
          category: 'Strength',
          condition: 'EXCELLENT',
          purchaseDate: new Date().toISOString().split('T')[0],
          warrantyExpiry: '',
          maintenanceFrequencyDays: 90,
          notes: '',
        });
        fetchInventory();
      }
    } catch (err) {
      console.error('Add equipment error:', err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'PRODUCT', ...productForm }),
      });
      if (res.ok) {
        setShowAddProductModal(false);
        setProductForm({
          name: '',
          category: 'SUPPLEMENT',
          price: '',
          costPrice: '',
          stockQuantity: '',
          reorderLevel: '5',
          sku: '',
        });
        fetchInventory();
      }
    } catch (err) {
      console.error('Add product error:', err);
    }
  };

  const handleLogMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MAINTENANCE_LOG',
          equipmentId: selectedEquipment.id,
          ...maintenanceForm,
        }),
      });
      if (res.ok) {
        setShowLogMaintenanceModal(false);
        setSelectedEquipment(null);
        setMaintenanceForm({ issueDescription: '', cost: '', status: 'REPORTED', notes: '' });
        fetchInventory();
      }
    } catch (err) {
      console.error('Log maintenance error:', err);
    }
  };

  const handleAdjustStock = async (productId: string, adjustment: number) => {
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PRODUCT_STOCK',
          id: productId,
          stockAdjustment: adjustment,
        }),
      });
      if (res.ok) {
        fetchInventory();
      }
    } catch (err) {
      console.error('Adjust stock error:', err);
    }
  };

  // Metrics
  const totalEquipment = equipment.length;
  const goodOrExcellent = equipment.filter((e) => e.condition === 'EXCELLENT' || e.condition === 'GOOD').length;
  const operationalRate = totalEquipment > 0 ? Math.round((goodOrExcellent / totalEquipment) * 100) : 100;
  const repairCount = equipment.filter((e) => e.condition === 'NEEDS_REPAIR').length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.reorderLevel).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Equipment & Stock</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Floor & Cafe
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track barbell sets, machines, service cycles, and cafe/supplement inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'EQUIPMENT' ? (
            <button
              onClick={() => setShowAddEquipmentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </button>
          ) : (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Floor Equipment</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalEquipment} Units</div>
          <div className="text-xs text-emerald-400 mt-1">Full gym inventory</div>
        </div>

        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Operational Rate</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400 mt-2">{operationalRate}%</div>
          <div className="text-xs text-slate-400 mt-1">Excellent / Good condition</div>
        </div>

        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Needs Attention</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">{repairCount}</div>
          <div className="text-xs text-rose-400 mt-1">Pending maintenance</div>
        </div>

        <div className="bg-[#0D1322] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Low Stock Alerts</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{lowStockCount} Items</div>
          <div className="text-xs text-amber-400 mt-1">At or below reorder level</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('EQUIPMENT')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'EQUIPMENT'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Gym Floor Equipment ({equipment.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'PRODUCTS'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Cafe & Supplement Stock ({products.length})</span>
        </button>
      </div>

      {/* Equipment View */}
      {activeTab === 'EQUIPMENT' && (
        <div className="space-y-4">
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : equipment.length === 0 ? (
            <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              No equipment logged yet. Click &ldquo;Add Equipment&rdquo; to register machines and free weights.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipment.map((item) => {
                const conditionClass = CONDITION_COLORS[item.condition] || CONDITION_COLORS.GOOD;

                return (
                  <div
                    key={item.id}
                    className="bg-[#0D1322] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-base leading-tight">{item.name}</h4>
                          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                            {item.category}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${conditionClass}`}>
                          {item.condition.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-1.5 mt-4 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <div className="flex justify-between">
                          <span>Service Frequency:</span>
                          <span className="text-slate-200 font-medium">Every {item.maintenanceFrequencyDays} days</span>
                        </div>
                        {item.lastServicedDate && (
                          <div className="flex justify-between">
                            <span>Last Serviced:</span>
                            <span className="text-slate-200 font-medium">{item.lastServicedDate}</span>
                          </div>
                        )}
                        {item.warrantyExpiry && (
                          <div className="flex justify-between">
                            <span>Warranty Until:</span>
                            <span className="text-slate-200 font-medium">{item.warrantyExpiry}</span>
                          </div>
                        )}
                        {item.notes && <p className="text-[11px] text-slate-500 italic mt-1">&ldquo;{item.notes}&rdquo;</p>}
                      </div>

                      {/* Recent Maintenance Logs */}
                      {item.maintenanceLogs && item.maintenanceLogs.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Recent Service Log:</span>
                          <div className="text-xs text-slate-300 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                            <div className="font-medium truncate">{item.maintenanceLogs[0].issueDescription}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Cost: ₹{item.maintenanceLogs[0].cost} • Status: {item.maintenanceLogs[0].status}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedEquipment(item);
                          setShowLogMaintenanceModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Log Service
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Products & Cafe Tab */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-4">
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#12192c] text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product Name</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Sale Price (₹)</th>
                    <th className="px-4 py-3 font-semibold">Stock In Hand</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Quick Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map((p) => {
                    const isLow = p.stockQuantity <= p.reorderLevel;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{p.name}</div>
                          {p.sku && <div className="text-[11px] text-slate-500 font-mono">{p.sku}</div>}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-400 uppercase font-semibold">
                          {p.category}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-white">
                          ₹{p.price.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-base font-black ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {p.stockQuantity}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">/ min {p.reorderLevel}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          {isLow ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold border border-rose-500/40 bg-rose-500/10 text-rose-400">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                              Adequate
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleAdjustStock(p.id, -1)}
                              disabled={p.stockQuantity <= 0}
                              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 font-black text-sm flex items-center justify-center transition-all"
                              title="Sold 1"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => handleAdjustStock(p.id, 1)}
                              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-black text-sm flex items-center justify-center transition-all"
                              title="Restocked +1"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => handleAdjustStock(p.id, 10)}
                              className="px-2 h-7 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs rounded-lg flex items-center justify-center transition-all"
                              title="Restocked +10 batch"
                            >
                              +10
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Add New Gym Equipment</h3>
              <button onClick={() => setShowAddEquipmentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Equipment / Machine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rogue Olympic Power Rack #2"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={equipmentForm.category}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, category: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Strength">Strength Machines</option>
                    <option value="Free Weights">Free Weights / Barbells</option>
                    <option value="Cardio">Cardio / Treadmills</option>
                    <option value="Accessories">Accessories & Bands</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Condition</label>
                  <select
                    value={equipmentForm.condition}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, condition: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="EXCELLENT">Brand New / Excellent</option>
                    <option value="GOOD">Good Condition</option>
                    <option value="FAIR">Fair Condition</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Service Cycle (Days)</label>
                  <input
                    type="number"
                    value={equipmentForm.maintenanceFrequencyDays}
                    onChange={(e) =>
                      setEquipmentForm({ ...equipmentForm, maintenanceFrequencyDays: parseInt(e.target.value) || 90 })
                    }
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    value={equipmentForm.warrantyExpiry}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, warrantyExpiry: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notes / Serial No.</label>
                <input
                  type="text"
                  placeholder="e.g. Serial #RF-2024-998"
                  value={equipmentForm.notes}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, notes: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEquipmentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 text-sm font-bold rounded-xl"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Add Cafe / Stock Product</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whey Isolate Shake 30g Protein"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Sale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="180"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Stock Units *</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SUPPLEMENT">Supplement / Protein</option>
                    <option value="BEVERAGE">Beverage / Cold Brew</option>
                    <option value="MERCHANDISE">Apparel & Merch</option>
                    <option value="ACCESSORY">Lifting Straps / Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Reorder Alert Level</label>
                  <input
                    type="number"
                    value={productForm.reorderLevel}
                    onChange={(e) => setProductForm({ ...productForm, reorderLevel: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 text-sm font-bold rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Maintenance Modal */}
      {showLogMaintenanceModal && selectedEquipment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Log Maintenance Service</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedEquipment.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowLogMaintenanceModal(false);
                  setSelectedEquipment(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogMaintenance} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Issue / Service Done *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Replaced cable pulley wire and lubricated track guide rods"
                  value={maintenanceForm.issueDescription}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, issueDescription: e.target.value })}
                  className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Service Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={maintenanceForm.cost}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Service Status</label>
                  <select
                    value={maintenanceForm.status}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, status: e.target.value })}
                    className="w-full bg-[#12192C] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="RESOLVED">Resolved (Mark Equipment Good)</option>
                    <option value="IN_PROGRESS">In Progress / Parts Ordered</option>
                    <option value="REPORTED">Reported / Awaiting Technician</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogMaintenanceModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 text-sm font-bold rounded-xl"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

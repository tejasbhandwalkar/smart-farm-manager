import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Package,
  TrendingUp,
  MapPin,
  Store,
  Fuel,
  Wheat,
  ShieldAlert,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { FarmDB } from '../services/db';
import { InventoryItem, InventoryCategory } from '../types';

export const InventoryPage: React.FC = () => {
  const { t } = useTranslation();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'all'>('all');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('fertilizer');
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [unit, setUnit] = useState('पोती (Bags)');
  const [costPerUnit, setCostPerUnit] = useState<number | ''>(1450);
  const [minStockAlert, setMinStockAlert] = useState<number | ''>(5);
  const [storageLocation, setStorageLocation] = useState('शेतातील मुख्य गोदाम');
  const [supplier, setSupplier] = useState('किसान कृषी सेवा केंद्र');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await FarmDB.getInventory();
      setItems(data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemName('');
    setCategory('fertilizer');
    setQuantity(10);
    setUnit('पोती (Bags)');
    setCostPerUnit(1450);
    setMinStockAlert(5);
    setStorageLocation('शेतातील मुख्य गोदाम');
    setSupplier('किसान कृषी सेवा केंद्र');
    setNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setItemName(item.item_name);
    setCategory(item.category);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setCostPerUnit(item.cost_per_unit);
    setMinStockAlert(item.min_stock_alert ?? 0);
    setStorageLocation(item.storage_location || '');
    setSupplier(item.supplier || '');
    setNotes(item.notes || '');
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmText = t('common.confirm_delete') || `तुम्हाला खात्री आहे का '${name}' साठ्यातून हटवायचे?`;
    if (window.confirm(confirmText)) {
      await FarmDB.deleteInventoryItem(id);
      await loadData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    setSaving(true);
    const q = Number(quantity) || 0;
    const cpu = Number(costPerUnit) || 0;
    const payload = {
      item_name: itemName.trim(),
      category,
      quantity: q,
      unit: unit.trim() || 'नग',
      cost_per_unit: cpu,
      total_value: q * cpu,
      min_stock_alert: Number(minStockAlert) || 0,
      storage_location: storageLocation.trim() || undefined,
      supplier: supplier.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (editingItem) {
        await FarmDB.updateInventoryItem(editingItem.id, payload);
      } else {
        await FarmDB.addInventoryItem(payload);
      }
      setModalOpen(false);
      setEditingItem(null);
      await loadData();
    } catch (err) {
      console.error('Failed to save inventory item', err);
      alert('साठा जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered items
  const filteredItems = items.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.storage_location && item.storage_location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Summary Metrics
  const totalItemsCount = items.length;
  const totalValuation = items.reduce((sum, item) => sum + (item.total_value ?? (item.quantity * item.cost_per_unit)), 0);
  const lowStockCount = items.filter(item => item.min_stock_alert && item.quantity <= item.min_stock_alert).length;

  const getCategoryMeta = (cat: InventoryCategory) => {
    switch (cat) {
      case 'fertilizer':
        return {
          label: t('inventory.cat_fertilizer'),
          icon: Boxes,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dotColor: 'bg-emerald-500',
        };
      case 'seed':
        return {
          label: t('inventory.cat_seed'),
          icon: Wheat,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
          dotColor: 'bg-amber-500',
        };
      case 'pesticide':
        return {
          label: t('inventory.cat_pesticide'),
          icon: ShieldAlert,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          dotColor: 'bg-purple-500',
        };
      case 'fuel':
        return {
          label: t('inventory.cat_fuel'),
          icon: Fuel,
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-500',
        };
      case 'tools':
        return {
          label: t('inventory.cat_tools'),
          icon: Wrench,
          badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
          dotColor: 'bg-orange-500',
        };
      default:
        return {
          label: t('inventory.cat_other'),
          icon: Package,
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
          dotColor: 'bg-slate-500',
        };
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('inventory.title')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {t('inventory.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>{t('inventory.add_item')}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Items */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              {t('inventory.total_items')}
            </span>
            <span className="text-2xl font-black text-slate-900">
              {totalItemsCount}
            </span>
          </div>
        </div>

        {/* Total Stock Value */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              {t('inventory.total_valuation')}
            </span>
            <span className="text-2xl font-black text-slate-900">
              ₹{totalValuation.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`p-5 rounded-3xl border shadow-sm flex items-center space-x-4 transition-colors ${
          lowStockCount > 0 ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              {t('inventory.low_stock_items')}
            </span>
            <span className={`text-2xl font-black ${
              lowStockCount > 0 ? 'text-amber-700' : 'text-slate-900'
            }`}>
              {lowStockCount}
            </span>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('inventory.search_placeholder') || 'वस्तूचे नाव किंवा पुरवठादार शोधा...'}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          {(['all', 'fertilizer', 'seed', 'pesticide', 'fuel', 'tools', 'other'] as const).map(catKey => {
            const isSelected = selectedCategory === catKey;
            let label = t('inventory.cat_all');
            if (catKey !== 'all') {
              label = getCategoryMeta(catKey).label;
            }

            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory Items Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">{t('common.loading')}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">कोणतीही वस्तू सापडली नाही</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            नवीन खत, बियाणे किंवा डिझेल साठा जोडण्यासाठी वर दिलेल्या "नवीन वस्तू साठ्यात जोडा" बटणावर क्लिक करा.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const meta = getCategoryMeta(item.category);
            const CategoryIcon = meta.icon;
            const isLowStock = item.min_stock_alert !== undefined && item.quantity <= item.min_stock_alert;
            const itemTotal = item.total_value ?? (item.quantity * item.cost_per_unit);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                {/* Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${meta.badgeColor}`}>
                      <CategoryIcon className="w-3.5 h-3.5" />
                      <span>{meta.label}</span>
                    </span>

                    {/* Action buttons: Edit & Delete */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title={t('common.edit')}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.item_name)}
                        title={t('common.delete')}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.item_name}
                    </h3>
                  </div>

                  {/* Low Stock Warning Banner */}
                  {isLowStock && (
                    <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl px-2.5 py-1.5 text-xs font-bold flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{t('inventory.low_stock_warning')}</span>
                    </div>
                  )}

                  {/* Stock Quantity Highlight */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        {t('inventory.quantity')}
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        {item.quantity} <span className="text-xs font-bold text-slate-600">{item.unit}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        {t('inventory.total_value')}
                      </span>
                      <span className="text-base font-bold text-emerald-700">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Details metadata */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t('inventory.cost_per_unit')}:</span>
                      <span className="font-semibold text-slate-700">₹{item.cost_per_unit} / {item.unit}</span>
                    </div>

                    {item.storage_location && (
                      <div className="flex items-center space-x-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.storage_location}</span>
                      </div>
                    )}

                    {item.supplier && (
                      <div className="flex items-center space-x-1 text-slate-600">
                        <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.supplier}</span>
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50/70 p-2 rounded-xl mt-1">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card footer date */}
                {item.min_stock_alert !== undefined && item.min_stock_alert > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{t('inventory.min_stock_alert')}:</span>
                    <span className="font-bold text-slate-600">{item.min_stock_alert} {item.unit}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Inventory Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Boxes className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingItem ? t('inventory.edit_item') : t('inventory.add_item')}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    {editingItem ? 'साठ्यातील नोंदी अद्ययावत करा' : 'गोदाम साठ्यात नवीन घटक प्रविष्ट करा'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              
              {/* Item Name */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('inventory.item_name')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="उदा. युरिया खत (Urea 45kg) / डिझेल / 10:26:26"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('inventory.category')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as InventoryCategory)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                >
                  <option value="fertilizer">खते (Fertilizers)</option>
                  <option value="seed">बियाणे (Seeds)</option>
                  <option value="pesticide">कीटकनाशके व टॉनिक (Pesticides)</option>
                  <option value="fuel">डिझेल / इंधन (Fuel)</option>
                  <option value="tools">औजारे व साधने (Tools)</option>
                  <option value="other">इतर साहित्य (Other)</option>
                </select>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('inventory.quantity')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('inventory.unit')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="उदा. पोती, लिटर, किलो, नग"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cost per unit & Min stock alert */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('inventory.cost_per_unit')} (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={costPerUnit}
                    onChange={e => setCostPerUnit(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="1450"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('inventory.min_stock_alert')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={minStockAlert}
                    onChange={e => setMinStockAlert(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Storage location & Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('inventory.storage_location')}
                  </label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={e => setStorageLocation(e.target.value)}
                    placeholder="उदा. शेत गोदाम रॅक A"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('inventory.supplier')}
                  </label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    placeholder="उदा. किसान कृषी केंद्र"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('inventory.notes')}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="उदा. रब्बी हंगामासाठी खरेदी केलेले खत..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Total Calculation Preview */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between text-emerald-900 font-semibold">
                <span>अंदाजे एकूण साठा मूल्य:</span>
                <span className="text-sm font-bold">
                  ₹{((Number(quantity) || 0) * (Number(costPerUnit) || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saving ? 'जतन होत आहे...' : t('common.save')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

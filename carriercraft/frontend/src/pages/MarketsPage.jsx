import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { marketsApi } from '../services/api';
import { Search, Plus, ChevronRight, Globe, Pencil, X } from 'lucide-react';

function MarketFormModal({ isOpen, onClose, onSave, title, initialData = {} }) {
  const [cName, setCName] = useState(initialData.countryName || '');
  const [cCode, setCCode] = useState(initialData.countryCode || '');
  const [opName, setOpName] = useState(initialData.operatorName || '');
  const [opCode, setOpCode] = useState(initialData.operatorCode || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCName(initialData.countryName || '');
    setCCode(initialData.countryCode || '');
    setOpName(initialData.operatorName || '');
    setOpCode(initialData.operatorCode || '');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cName.trim() || !cCode.trim() || !opName.trim() || !opCode.trim()) return;
    setSaving(true);
    try {
      await onSave({
        countryName: cName.trim(),
        countryCode: cCode.trim().toUpperCase(),
        operatorName: opName.trim(),
        operatorCode: opCode.trim().toUpperCase(),
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country name</label>
              <input
                type="text"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                placeholder="India"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country code</label>
              <input
                type="text"
                value={cCode}
                onChange={(e) => setCCode(e.target.value.toUpperCase())}
                placeholder="IN"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operator name</label>
              <input
                type="text"
                value={opName}
                onChange={(e) => setOpName(e.target.value)}
                placeholder="Airtel"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operator code</label>
              <input
                type="text"
                value={opCode}
                onChange={(e) => setOpCode(e.target.value.toUpperCase())}
                placeholder="AIRTEL"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Tracking IDs will look like: {(cCode || 'IN').toUpperCase()}-{(opCode || 'AIRTEL').toUpperCase()}-12
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs shadow-blue-200"
            >
              {saving ? 'Saving...' : title.includes('New') ? 'Create market' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MarketsPage() {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingMarket, setEditingMarket] = useState(null);

  const loadMarkets = async () => {
    try {
      const res = await marketsApi.getMarkets();
      if (res?.data) setMarkets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMarkets(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return markets;
    const q = search.toLowerCase();
    return markets.filter(
      (m) =>
        (m.countryName || '').toLowerCase().includes(q) ||
        (m.operatorName || '').toLowerCase().includes(q) ||
        (m.countryCode || '').toLowerCase().includes(q) ||
        (m.operatorCode || '').toLowerCase().includes(q)
    );
  }, [markets, search]);

  const handleCreate = async (dto) => {
    await marketsApi.createMarket(dto);
    loadMarkets();
    navigate(`/markets/${dto.countryCode}/${dto.operatorCode}`);
  };

  const handleUpdate = async (dto) => {
    if (!editingMarket) return;
    await marketsApi.updateMarket(editingMarket.countryCode, editingMarket.operatorCode, dto);
    loadMarkets();
  };

  return (
    <Layout title="Markets">
      <div className="p-8 flex flex-col gap-6 max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-900">Markets</h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse countries and operators, then manage campaigns under each market
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 flex items-center gap-2 shadow-xs shadow-blue-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New market</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by country or operator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Markets Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-mono uppercase text-slate-600 font-semibold">
                <th className="py-3 px-6">COUNTRY</th>
                <th className="py-3 px-6">OPERATOR</th>
                <th className="py-3 px-6">CODES</th>
                <th className="py-3 px-6 text-right">CAMPAIGNS</th>
                <th className="py-3 px-6 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-sm">
                    Loading markets...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    No markets found. Click <strong>+ New market</strong> to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((market) => (
                  <tr
                    key={`${market.countryCode}-${market.operatorCode}`}
                    onClick={() => navigate(`/markets/${market.countryCode}/${market.operatorCode}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      <span className="inline-flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <span>{market.countryName}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-700">{market.operatorName}</td>
                    <td className="py-3.5 px-6">
                      <code className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {market.countryCode}-{market.operatorCode}
                      </code>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-slate-600 font-semibold">
                      {market.campaignCount}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          title="Edit market"
                          onClick={() => setEditingMarket(market)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <MarketFormModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreate}
        title="New market"
      />

      <MarketFormModal
        isOpen={!!editingMarket}
        onClose={() => setEditingMarket(null)}
        onSave={handleUpdate}
        title="Edit market"
        initialData={editingMarket || {}}
      />
    </Layout>
  );
}

export default MarketsPage;

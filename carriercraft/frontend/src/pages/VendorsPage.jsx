import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { partnersApi } from '../services/api';

export function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [postbackUrl, setPostbackUrl] = useState('https://network.com/postback?clickid={click_id}&payout={payout}&campid={campid}');

  const loadVendors = async () => {
    try {
      const res = await partnersApi.listVendors();
      if (res?.data) setVendors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await partnersApi.createVendor({ name, code, postbackUrl });
    setShowAdd(false);
    setName(''); setCode('');
    loadVendors();
  };

  return (
    <Layout title="Vendors & Traffic Partners">
      <div className="p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-900">Traffic Vendors & Networks</h1>
            <p className="text-sm text-slate-500 mt-1">Manage advertising networks, sub-affiliates, and Server-to-Server (S2S) postback templates.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 flex items-center gap-2 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Traffic Vendor</span>
          </button>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center font-mono text-sm border border-blue-100">
                      {v.code}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-slate-900">{v.name}</h3>
                      <span className="text-xs font-mono text-slate-500">ID: #{v.id}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    ACTIVE
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Postback URL Template</span>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 break-all">
                    {v.postback_url || 'No postback URL configured'}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Sub-Affiliates:</span>
                  <span className="font-semibold text-slate-800">{v.affiliates?.length || 0} Registered</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Vendor */}
        {showAdd && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-4">Add Traffic Vendor</h3>
              <form onSubmit={handleAdd} className="flex flex-col gap-3">
                <input placeholder="Vendor Name (e.g. PropellerAds)" value={name} onChange={(e) => setName(e.target.value)} required className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" />
                <input placeholder="Vendor Code (e.g. ADM01)" value={code} onChange={(e) => setCode(e.target.value)} required className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm uppercase" />
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">Postback URL with {`{click_id}`} and {`{payout}`}</label>
                  <textarea rows={3} value={postbackUrl} onChange={(e) => setPostbackUrl(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono" />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700">Save Vendor</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

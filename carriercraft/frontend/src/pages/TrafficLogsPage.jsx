import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { analyticsApi } from '../services/api';

export function TrafficLogsPage() {
  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [waterfall, setWaterfall] = useState(null);
  const [loadingWaterfall, setLoadingWaterfall] = useState(false);

  const loadVisits = async () => {
    try {
      const res = await analyticsApi.listVisits({ limit: 50 });
      if (res?.data) setVisits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleInspect = async (visitId) => {
    setSelectedVisit(visitId);
    setLoadingWaterfall(true);
    try {
      const res = await analyticsApi.getWaterfall(visitId);
      if (res?.data) setWaterfall(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWaterfall(false);
    }
  };

  return (
    <Layout title="Traffic Logs & Waterfall Inspector">
      <div className="p-8 flex flex-col gap-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">Traffic Logs & Telemetry</h1>
          <p className="text-sm text-slate-500 mt-1">Audit real-time incoming ad clicks, Header Enrichment resolutions, and carrier transition waterfalls.</p>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono text-slate-400 uppercase bg-slate-50">
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Visit ID</th>
                <th className="py-3 px-6">Campaign</th>
                <th className="py-3 px-6">Phone (MSISDN)</th>
                <th className="py-3 px-6">HE Detected</th>
                <th className="py-3 px-6">Vendor / Click</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-mono text-xs text-slate-500">
                    {new Date(v.created_at).toLocaleTimeString()}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-xs text-slate-800 font-semibold">{v.id}</td>
                  <td className="py-3.5 px-6 font-medium text-slate-900">{v.campaign_name}</td>
                  <td className="py-3.5 px-6 font-mono text-xs text-slate-700">{v.msisdn || '—'}</td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      v.he_resolved ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {v.he_resolved ? 'YES (1-Click)' : 'NO (WiFi)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-slate-600 font-mono">
                    {v.vendor_name || 'Direct'} {v.click_id && `(${v.click_id})`}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                      v.status === 'SUBSCRIBED'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleInspect(v.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-xs font-mono font-semibold transition-colors"
                    >
                      Waterfall
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Waterfall Modal */}
        {selectedVisit && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] shadow-xl border border-slate-200 flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">Session Waterfall Timeline</h3>
                  <span className="text-xs font-mono text-blue-700 font-semibold">{selectedVisit}</span>
                </div>
                <button onClick={() => setSelectedVisit(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto flex flex-col gap-3">
                {loadingWaterfall ? (
                  <div className="p-8 text-center text-sm text-slate-500">Loading timeline events...</div>
                ) : (
                  <>
                    <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-700 grid grid-cols-2 gap-2">
                      <div><span className="text-slate-400">IP:</span> {waterfall?.visit?.user_ip || '127.0.0.1'}</div>
                      <div><span className="text-slate-400">Click ID:</span> {waterfall?.visit?.click_id || 'N/A'}</div>
                      <div><span className="text-slate-400">HE Status:</span> {waterfall?.visit?.he_resolved ? 'Resolved' : 'WiFi Fallback'}</div>
                      <div><span className="text-slate-400">Final:</span> <span className="text-blue-700 font-bold">{waterfall?.visit?.status}</span></div>
                    </div>

                    <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mt-2">Waterfall Events</h4>
                    <div className="flex flex-col gap-2 pl-2 border-l-2 border-blue-200">
                      {waterfall?.events?.map((ev, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-blue-800">{ev.event_type}</span>
                            <span className="text-[10px] font-mono text-slate-400">{new Date(ev.created_at).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

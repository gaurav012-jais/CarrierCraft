import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { postbacksApi } from '../services/api';

export function PostbacksPage() {
  const [postbacks, setPostbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPostbacks = async () => {
    try {
      const res = await postbacksApi.list(50);
      if (res?.data) setPostbacks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostbacks();
  }, []);

  const handleRetry = async (id) => {
    try {
      await postbacksApi.retry(id);
      loadPostbacks();
    } catch (err) {
      alert('Retry error: ' + err.message);
    }
  };

  return (
    <Layout title="Postbacks & S2S Audit Hub">
      <div className="p-8 flex flex-col gap-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">Postbacks & S2S Audit Hub</h1>
          <p className="text-sm text-slate-500 mt-1">Audit outgoing Server-to-Server affiliate postbacks, response codes, and manual delivery retries.</p>
        </div>

        {/* Postbacks Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono text-slate-400 uppercase bg-slate-50">
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Vendor</th>
                <th className="py-3 px-6">Click ID</th>
                <th className="py-3 px-6">Outbound Postback URL</th>
                <th className="py-3 px-6">HTTP Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {postbacks.length > 0 ? (
                postbacks.map((pb) => (
                  <tr key={pb.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-500">
                      {new Date(pb.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-900">{pb.vendor_name || 'Vendor'}</td>
                    <td className="py-3.5 px-6 font-mono text-xs text-blue-700 font-bold">{pb.click_id}</td>
                    <td className="py-3.5 px-6 text-xs font-mono text-slate-600 max-w-xs truncate" title={pb.request_url}>
                      {pb.request_url}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                        pb.is_success
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {pb.http_status || 'ERR'} {pb.is_success ? 'DELIVERED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {!pb.is_success && (
                        <button
                          onClick={() => handleRetry(pb.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-mono font-semibold border border-blue-200 flex items-center gap-1 ml-auto"
                        >
                          <span className="material-symbols-outlined text-[14px]">replay</span>
                          <span>Retry</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 text-sm">
                    No conversion postbacks logged yet. Complete a subscription test in the <strong>Live Funnel Lab</strong>!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

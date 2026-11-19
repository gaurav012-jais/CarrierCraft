import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { analyticsApi } from '../services/api';
import { ArrowLeft, Clock, ShieldCheck, Activity, CheckCircle, AlertCircle, Globe } from 'lucide-react';

export function SessionDetailPage() {
  const { visitId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getWaterfall(visitId)
      .then(res => { if (res?.data) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [visitId]);

  if (loading) {
    return (
      <Layout title="Session Waterfall Trace">
        <div className="p-8 text-center text-slate-500 font-mono text-sm">Tracing visit session waterfall...</div>
      </Layout>
    );
  }

  if (!data?.visit) {
    return (
      <Layout title="Session Waterfall Trace">
        <div className="p-8 text-center text-red-500 font-mono text-sm">Session visit ID not found.</div>
      </Layout>
    );
  }

  const { visit, events = [], telecomCalls = [], postbacks = [] } = data;

  return (
    <Layout title={`Session Trace: ${visit.id}`}>
      <div className="p-8 flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Back Link */}
        <div>
          <Link to="/logs" className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Traffic Logs</span>
          </Link>
        </div>

        {/* Visit Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-base font-bold text-slate-900">{visit.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                visit.status === 'SUBSCRIBED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {visit.status}
              </span>
              {visit.he_resolved && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  HE DETECTED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Campaign: <strong className="text-slate-800">{visit.campaign_name}</strong> · Click ID: <strong className="text-blue-600">{visit.click_id || 'N/A'}</strong>
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <div>IP: {visit.user_ip || '127.0.0.1'}</div>
            <div>Time: {new Date(visit.created_at).toLocaleString()}</div>
          </div>
        </div>

        {/* Session Waterfall Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="font-heading font-bold text-base text-slate-900 mb-6">Session Execution Waterfall Timeline</h2>

          <div className="relative pl-6 border-l-2 border-blue-200 flex flex-col gap-6">
            {/* Step 1: Visit Created */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-xs" />
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900">1. Landing Click & Visit Minted</span>
                  <span className="text-[11px] font-mono text-slate-400">{new Date(visit.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-600">
                  User landed with network tracking tag <code className="text-blue-700 bg-blue-50 px-1 rounded">{visit.tracking_campid}</code>.
                </p>
              </div>
            </div>

            {/* Step 2: HE or Phone Detection */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-xs" />
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900">2. Network Identity & HE Check</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {visit.he_resolved ? 'Success' : 'Wi-Fi / Manual'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {visit.he_resolved ? `Carrier SIM header resolved phone: ${visit.msisdn}` : 'No carrier header present (Wi-Fi subscriber).'}
                </p>
              </div>
            </div>

            {/* Step 3: Outbound Telecom API Calls */}
            {telecomCalls.map((call, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-xs" />
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-900">3.{idx + 1} Telecom Call: {call.call_type}</span>
                    <span className="text-[10px] font-mono text-slate-400">{call.latency_ms}ms</span>
                  </div>
                  <span className="text-xs font-mono text-blue-700 block break-all mb-1">{call.endpoint_url}</span>
                  <span className="text-[11px] font-mono text-slate-500">HTTP Status: {call.http_status} · Outcome: {call.is_success ? 'Success' : 'Failed'}</span>
                </div>
              </div>
            ))}

            {/* Step 4: S2S Vendor Postback */}
            {postbacks.map((pb, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-xs" />
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-900">4.{idx + 1} S2S Vendor Postback Delivered</span>
                    <span className="text-[10px] font-mono text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      HTTP {pb.http_status}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-blue-700 block break-all">{pb.request_url}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

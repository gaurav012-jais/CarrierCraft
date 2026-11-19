import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { analyticsApi } from '../services/api';

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKpis = async () => {
    try {
      const res = await analyticsApi.getDashboard();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
    const timer = setInterval(fetchKpis, 5000); // 5s auto-refresh
    return () => clearInterval(timer);
  }, []);

  const kpis = data?.kpis || {
    totalVisits: 0,
    heHits: 0,
    heRate: '0.0%',
    conversions: 0,
    conversionRate: '0.00%',
    grossRevenue: '$0.00',
  };

  return (
    <Layout title="Executive Live Telemetry">
      <div className="flex flex-col w-full">
        {/* Sub-header / Live Context Ribbon */}
        <div className="px-8 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading font-bold text-xl text-slate-900 tracking-tight">Executive Live Telemetry</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                LIVE 5s STREAM
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-600 font-medium border border-slate-200">99.98% SLA</span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1 font-mono">
              <span>Active Telco Interconnects:</span>
              <span className="font-semibold text-blue-700">Etisalat UAE (5G)</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-blue-700">STC KSA</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-blue-700">Safaricom</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-blue-700">Zain MENA</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchKpis}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Sync Now</span>
            </button>
          </div>
        </div>

        {/* Bento Grid KPI Cards */}
        <div className="p-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Ingress Visits */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">Total Ingress Hits</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-heading font-bold text-3xl text-slate-900">{kpis.totalVisits.toLocaleString()}</span>
                    <span className="text-xs font-mono font-semibold text-blue-600">+14.2%</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <span className="material-symbols-outlined text-[22px]">speed</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Peak Traffic</span>
                <span className="font-semibold text-slate-800">142 req/s</span>
              </div>
            </div>

            {/* Card 2: Header Enrichment (HE) Rate */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500"></div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">HE Auto-Detect Rate</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-heading font-bold text-3xl text-slate-900">{kpis.heRate}</span>
                    <span className="text-xs font-mono font-semibold text-sky-600">{kpis.heHits} hits</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
                  <span className="material-symbols-outlined text-[22px]">sim_card</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>1-Click Readiness</span>
                <span className="font-semibold text-sky-700">OPTIMAL</span>
              </div>
            </div>

            {/* Card 3: Conversions */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">Total Subscribers</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-heading font-bold text-3xl text-slate-900">{kpis.conversions.toLocaleString()}</span>
                    <span className="text-xs font-mono font-semibold text-indigo-600">CR: {kpis.conversionRate}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Avg Billing Value</span>
                <span className="font-semibold text-indigo-700">3.50 AED</span>
              </div>
            </div>

            {/* Card 4: Gross Revenue */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700"></div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">Est. Gross Revenue</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-heading font-bold text-3xl text-slate-900">{kpis.grossRevenue}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 border border-blue-100">
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Payout Status</span>
                <span className="font-semibold text-blue-700">RECONCILED</span>
              </div>
            </div>
          </div>

          {/* Live Recent Conversions Feed */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <h3 className="font-heading font-bold text-sm text-slate-900">Live Carrier Conversions Stream</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Auto-updating feed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-mono text-slate-600 uppercase bg-slate-50">
                    <th className="py-3 px-6">Timestamp</th>
                    <th className="py-3 px-6">Campaign</th>
                    <th className="py-3 px-6">Operator</th>
                    <th className="py-3 px-6">Subscriber MSISDN</th>
                    <th className="py-3 px-6">Vendor</th>
                    <th className="py-3 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {data?.recentConversions?.length > 0 ? (
                    data.recentConversions.map((conv) => (
                      <tr key={conv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-6 font-mono text-xs text-slate-500">
                          {new Date(conv.created_at).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-6 font-medium text-slate-900">{conv.campaign_name}</td>
                        <td className="py-3 px-6">
                          <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                            {conv.operator_code}
                          </span>
                        </td>
                        <td className="py-3 px-6 font-mono text-xs text-slate-700">{conv.msisdn}</td>
                        <td className="py-3 px-6 text-slate-600">{conv.vendor_name || 'Direct'}</td>
                        <td className="py-3 px-6 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            SUBSCRIBED
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-600 text-sm">
                        No live conversions yet. Use the <strong>Live Funnel Lab</strong> in sidebar to trigger a test conversion!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

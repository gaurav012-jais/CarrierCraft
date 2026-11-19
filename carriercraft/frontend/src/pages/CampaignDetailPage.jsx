import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { campaignsApi } from '../services/api';
import { CampaignApiConfigModal } from '../components/campaigns/CampaignApiConfigModal';
import { VendorAssignModal } from '../components/campaigns/VendorAssignModal';
import { VerificationModesSelector } from '../components/campaigns/VerificationModesSelector';
import { FlowPageNodes } from '../components/campaigns/FlowPageNodes';
import { LivePreviewModal } from '../components/campaigns/LivePreviewModal';
import {
  ExternalLink, ArrowLeft, Pencil, Lock, Unlock, Save,
  Layers, Users, Sliders, Shield, FileText, CheckCircle2, X
} from 'lucide-react';

export function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flow Builder states
  const [activeTab, setActiveTab] = useState('canvas'); // canvas | stats | vendors | capping | api | logs
  const [verificationMode, setVerificationMode] = useState('OTP_ONLY');
  const [landingOption, setLandingOption] = useState('API_EXPOSE');
  const [isLocked, setIsLocked] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modals
  const [showApiModal, setShowApiModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const loadData = async () => {
    try {
      const res = await campaignsApi.get(id);
      if (res?.data) {
        const c = res.data;
        setCampaign(c);
        setVerificationMode(c.verification_mode || 'OTP_ONLY');
        setLandingOption(c.funnel_layout === 'api_expose' ? 'API_EXPOSE' : 'HOME');
        setIsLive(Boolean(c.is_active));
        setNameDraft(c.name || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleSaveFlow = async () => {
    setSaving(true);
    try {
      await campaignsApi.update(id, {
        verificationMode,
        funnelLayout: landingOption === 'API_EXPOSE' ? 'api_expose' : 'classic',
        isActive: isLive,
      });
      alert('Flow saved successfully!');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save flow');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!nameDraft.trim()) return;
    try {
      await campaignsApi.update(id, { name: nameDraft.trim() });
      setShowEditName(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update name');
    }
  };

  if (loading) {
    return (
      <Layout title="Campaign Detail">
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading campaign details...</div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout title="Campaign Not Found">
        <div className="p-12 text-center text-slate-600">
          <p className="mb-4">Campaign #{id} not found.</p>
          <button onClick={() => navigate('/markets')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm">
            Back to markets
          </button>
        </div>
      </Layout>
    );
  }

  const cCode = campaign.country_code || 'IN';
  const opCode = campaign.operator_code || 'XZ12';
  const trackingCampid = campaign.tracking_id || `${cCode}-${opCode}-${campaign.id}`;
  const previewUrl = `/subscription?country=${cCode}&operator=${opCode}&tracking_campid=${trackingCampid}`;

  return (
    <Layout title={`Flow builder - ${campaign.name}`}>
      <div className="p-8 flex flex-col gap-6 max-w-6xl mx-auto">
        {/* TOP TAB NAVIGATION BAR */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'canvas'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Flow Canvas
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Vendor Stats (1)
            </button>
            <button
              onClick={() => setShowVendorModal(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              Vendors
            </button>
            <button
              onClick={() => alert(`Capping Settings:\nMetric: ${campaign.capping_metric || 'CONVERSIONS'}\nDaily Cap: ${campaign.daily_cap || 1000}`)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-all"
            >
              <span>Capping</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </button>
            <button
              onClick={() => setShowApiModal(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              API
            </button>
            <button
              onClick={() => navigate('/logs')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              Logs
            </button>
          </div>

          {/* PREVIEW BUTTON */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(previewUrl, '_blank')}
              title="Open Live Funnel in new tab"
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setShowPreviewModal(true)}
              title="Test Live Funnel Drawer"
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Test Lab
            </button>
          </div>
        </div>

        {/* SUBHEADER & BREADCRUMBS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/markets/${cCode}/${opCode}`)}
              className="text-xs text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <span className="text-slate-300">|</span>
            <div>
              <p className="text-[11px] text-slate-400">
                <Link to="/markets" className="hover:text-blue-600">Markets</Link>
                {' / '}
                <Link to={`/markets/${cCode}/${opCode}`} className="hover:text-blue-600">
                  {campaign.country_name || cCode}
                </Link>
                {' / '}
                <span>{campaign.operator_name || opCode}</span>
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="font-heading font-bold text-lg text-slate-900">{campaign.name}</h2>
                <button
                  onClick={() => setShowEditName(true)}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE / LIVE TOGGLE */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Active
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Live</span>
              <button
                type="button"
                onClick={() => setIsLive(!isLive)}
                className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  isLive ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                    isLive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* FLOW BUILDER CONTROLS HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-xl text-slate-900">Flow builder</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {isLocked ? 'Locked' : 'Editable'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              START configures checks before the first page (HE / blocklist / checksub). END marks funnel outcomes. Edit page content from any page node.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isLocked ? <Unlock className="w-3.5 h-3.5 text-blue-600" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isLocked ? 'Unlock Flow' : 'Lock Flow'}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveFlow}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 shadow-xs shadow-blue-200 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save flow'}</span>
            </button>
          </div>
        </div>

        {/* VERIFICATION MODES & LANDING PAGE 7-CARD & 3-CARD GRIDS */}
        <VerificationModesSelector
          currentMode={verificationMode}
          landingOption={landingOption}
          isLocked={isLocked}
          onModeChange={(m) => setVerificationMode(m)}
          onLandingChange={(l) => setLandingOption(l)}
          onResetLayout={() => alert('Layout reset to standard.')}
          onResetPages={() => alert('Page templates reset to default.')}
        />

        {/* FLOW GRAPH / PAGE NODES & START BOX */}
        <FlowPageNodes campaign={campaign} />
      </div>

      {/* MODALS */}
      <CampaignApiConfigModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        campaignId={campaign.id}
      />

      <VendorAssignModal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        campaign={campaign}
        onAssigned={loadData}
      />

      <LivePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        campaign={campaign}
      />

      {/* Edit Name Modal */}
      {showEditName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-900">Edit Campaign Name</h3>
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditName(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateName}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default CampaignDetailPage;

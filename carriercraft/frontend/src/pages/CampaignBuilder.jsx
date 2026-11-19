import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { campaignsApi } from '../services/api';
import {
  ArrowLeft, Smartphone, Tablet, Monitor, Save, Code, Eye,
  PlusCircle, Layers, Check, ExternalLink
} from 'lucide-react';

const PAGE_TYPES = ['HOME', 'OTP', 'CONFIRM', 'THANKYOU', 'INPROGRESS', 'LOW_BALANCE', 'BLOCKED', 'ERROR'];

const SNIPPETS = [
  {
    label: 'Primary Subscribe CTA',
    desc: 'Starts signup flow (Layer B action)',
    code: `<button type="button" data-action="SUBSCRIBE" style="width:100%;min-height:50px;border:none;cursor:pointer;padding:14px;border-radius:14px;font-size:15px;font-weight:700;color:#ffffff;background:#2563eb;box-shadow:0 8px 20px -4px rgba(37,99,235,0.35);">SUBSCRIBE NOW & PLAY</button>`,
  },
  {
    label: 'Pack Buttons (Daily / Weekly)',
    desc: '1-Step direct buy for packs_on_home',
    code: `<div style="display:flex;flex-direction:column;gap:8px;width:100%;">
  <button type="button" data-action="SUBSCRIBE_ROUTE" data-pack="daily" style="padding:12px;border:1px solid #e2e8f0;background:#ffffff;border-radius:12px;font-weight:600;font-size:14px;color:#0f172a;cursor:pointer;">Daily Pack — 3.50 AED/day</button>
  <button type="button" data-action="SUBSCRIBE_ROUTE" data-pack="weekly" style="padding:12px;border:1px solid #2563eb;background:#eff6ff;border-radius:12px;font-weight:600;font-size:14px;color:#1d4ed8;cursor:pointer;">Weekly Pack — 15.00 AED/week (Best Value)</button>
</div>`,
  },
  {
    label: 'Mobile Number Input Box',
    desc: 'Used on OTP Screen for phone entry',
    code: `<div style="text-align:left;margin-bottom:12px;width:100%;">
  <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:6px;">Enter your Mobile Number</label>
  <input data-otp-field="phone" inputmode="numeric" placeholder="50 123 4567" style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:12px 14px;font-size:15px;outline:none;" />
</div>`,
  },
  {
    label: 'SMS OTP PIN Box & Verify CTA',
    desc: 'Used on OTP verification screen',
    code: `<div style="text-align:left;margin-bottom:12px;width:100%;">
  <label style="display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:6px;">4-Digit Verification PIN</label>
  <input data-otp-field="otp" inputmode="numeric" maxlength="6" placeholder="• • • •" style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:12px 14px;font-size:18px;text-align:center;letter-spacing:6px;outline:none;" />
  <button type="button" data-otp-action="verify" style="margin-top:12px;width:100%;min-height:48px;border:none;cursor:pointer;padding:12px;border-radius:12px;font-size:15px;font-weight:700;color:#ffffff;background:#2563eb;">CONFIRM & SUBSCRIBE</button>
</div>`,
  },
  {
    label: 'Status & Error Slots',
    desc: 'Displays server error or countdown status',
    code: `<div style="width:100%;">
  <div data-otp-slot="status" style="min-height:16px;color:#64748b;font-size:12px;text-align:center;margin-bottom:6px;"></div>
  <div data-otp-slot="error" style="min-height:16px;color:#dc2626;font-size:12px;font-weight:600;text-align:center;margin-bottom:8px;"></div>
</div>`,
  },
];

export function CampaignBuilder() {
  const { id, pageType } = useParams();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(pageType || 'HOME');
  const [device, setDevice] = useState('mobile'); // mobile, tablet, desktop
  const [viewMode, setViewMode] = useState('preview'); // preview, code
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    campaignsApi.get(id).then(res => setCampaign(res?.data)).catch(console.error);
    loadPageContent(activePage);
  }, [id, activePage]);

  const loadPageContent = async (type) => {
    try {
      const res = await campaignsApi.getPage(id, type);
      if (res?.data) {
        setHtmlContent(res.data.html_content || getDefaultHtml(type));
        setCssContent(res.data.css_content || getDefaultCss());
      }
    } catch {
      setHtmlContent(getDefaultHtml(type));
      setCssContent(getDefaultCss());
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await campaignsApi.savePage(id, activePage, { htmlContent, cssContent, projectData: { device } });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const insertSnippet = (snippetCode) => {
    setHtmlContent(prev => prev + '\n' + snippetCode);
  };

  const switchPage = (type) => {
    setActivePage(type);
    navigate(`/campaigns/${id}/edit/${type}`);
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden text-slate-900 font-sans">
      {/* Top Header Bar */}
      <header className="h-14 px-4 bg-white border-b border-slate-200 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to={`/campaigns/${id}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Editor</span>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <span className="font-heading font-bold text-sm text-slate-800">{campaign?.name || 'Campaign'}</span>
          <select
            value={activePage}
            onChange={(e) => switchPage(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 font-mono text-xs font-bold bg-blue-50 text-blue-700 cursor-pointer"
          >
            {PAGE_TYPES.map(pt => (
              <option key={pt} value={pt}>Page: {pt}</option>
            ))}
          </select>
        </div>

        {/* Center: Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              device === 'mobile' ? 'bg-white shadow-2xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>375px</span>
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              device === 'tablet' ? 'bg-white shadow-2xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>640px</span>
          </button>
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              device === 'desktop' ? 'bg-white shadow-2xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* Right: Code/Preview & Save */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            {viewMode === 'preview' ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{viewMode === 'preview' ? 'HTML Code' : 'Visual Preview'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs shadow-blue-200 flex items-center gap-1.5"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Saved!' : saving ? 'Saving...' : 'Save Page'}</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Palette: Flow Blocks */}
        <aside className="w-72 bg-white border-r border-slate-200 p-4 flex flex-col gap-3 overflow-y-auto shrink-0 shadow-xs">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="font-heading font-bold text-xs uppercase text-slate-700 tracking-wider">Flow Blocks</span>
          </div>
          <p className="text-[11px] text-slate-400">Click any component to insert it into your {activePage} canvas:</p>

          <div className="flex flex-col gap-2.5">
            {SNIPPETS.map((snip, idx) => (
              <div
                key={idx}
                onClick={() => insertSnippet(snip.code)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 cursor-pointer transition-all flex flex-col gap-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800 group-hover:text-blue-700">{snip.label}</span>
                  <PlusCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">{snip.desc}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Workspace Canvas */}
        <main className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-100">
          {viewMode === 'preview' ? (
            <div
              className="bg-white rounded-3xl shadow-xl border border-slate-300 overflow-hidden transition-all flex flex-col"
              style={{
                width: device === 'mobile' ? '375px' : device === 'tablet' ? '640px' : '100%',
                height: device === 'mobile' ? '740px' : '85%',
                maxHeight: '820px',
              }}
            >
              <div className="h-6 bg-slate-200/60 border-b border-slate-200 flex items-center justify-center">
                <div className="w-12 h-1 rounded-full bg-slate-400/50" />
              </div>
              <iframe
                title="Canvas Preview"
                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><style>${cssContent}</style></head><body style="margin:0;padding:16px;box-sizing:border-box;font-family:Inter,system-ui,sans-serif;">${htmlContent}</body></html>`}
                className="w-full flex-1 border-none bg-white"
              />
            </div>
          ) : (
            <div className="w-full max-w-4xl h-full flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase">HTML & Tailwind Source Editor ({activePage})</span>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full flex-1 font-mono text-xs p-4 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function getDefaultHtml(pageType) {
  if (pageType === 'OTP') {
    return `<div style="text-align:center;padding:24px 8px;">
  <h2 style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:6px;">Verify Mobile Number</h2>
  <p style="font-size:13px;color:#64748b;margin-bottom:20px;">We sent a 4-digit code to verify your mobile subscription pass.</p>
  <div style="text-align:left;margin-bottom:14px;">
    <label style="display:block;font-size:12px;font-weight:600;color:#475569;margin-bottom:6px;">Mobile Number</label>
    <input data-otp-field="phone" inputmode="numeric" placeholder="50 123 4567" style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:12px 14px;font-size:15px;outline:none;" />
  </div>
  <div style="text-align:left;margin-bottom:14px;">
    <label style="display:block;font-size:12px;font-weight:600;color:#475569;margin-bottom:6px;">4-Digit PIN</label>
    <input data-otp-field="otp" inputmode="numeric" maxlength="6" placeholder="• • • •" style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:12px 14px;font-size:18px;text-align:center;letter-spacing:6px;outline:none;" />
  </div>
  <div data-otp-slot="status" style="min-height:16px;color:#64748b;font-size:12px;text-align:center;margin-bottom:8px;"></div>
  <div data-otp-slot="error" style="min-height:16px;color:#dc2626;font-size:12px;font-weight:600;text-align:center;margin-bottom:12px;"></div>
  <button type="button" data-otp-action="verify" style="width:100%;min-height:50px;border:none;cursor:pointer;padding:14px;border-radius:14px;font-size:15px;font-weight:700;color:#ffffff;background:#2563eb;box-shadow:0 8px 20px -4px rgba(37,99,235,0.35);">CONFIRM &amp; SUBSCRIBE</button>
</div>`;
  }
  return `<div style="text-align:center;padding:24px 8px;">
  <span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;background:#eff6ff;color:#1d4ed8;margin-bottom:16px;border:1px solid #bfdbfe;">UNLIMITED ACCESS PASS</span>
  <h1 style="font-size:24px;font-weight:800;color:#0f172a;line-height:1.25;margin-bottom:8px;">GAMERZ HUB VIP</h1>
  <p style="font-size:14px;color:#64748b;margin-bottom:24px;">Instant access to 500+ premium mobile games. 3.50 AED/day billed to your mobile balance.</p>
  <button type="button" data-action="SUBSCRIBE" style="width:100%;min-height:50px;border:none;cursor:pointer;padding:14px;border-radius:14px;font-size:16px;font-weight:700;color:#ffffff;background:#2563eb;box-shadow:0 8px 20px -4px rgba(37,99,235,0.35);">SUBSCRIBE NOW &amp; PLAY</button>
  <p style="font-size:11px;color:#94a3b8;margin-top:16px;">Cancel anytime. Terms and recurring daily billing apply.</p>
</div>`;
}

function getDefaultCss() {
  return `* { box-sizing: border-box; } body { font-family: Inter, system-ui, sans-serif; background: #ffffff; color: #0f172a; } .flow-btn { transition: transform 0.15s ease; } .flow-btn:active { transform: scale(0.98); }`;
}

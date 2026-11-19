import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { templatesApi, flowApi } from '../services/api';

export function VisualCanvasPage() {
  const [searchParams] = useSearchParams();
  const campid = searchParams.get('campid') || 'AE-ETISALAT-101';
  const [pageType, setPageType] = useState('HOME');
  const [pageData, setPageData] = useState({ html: '', css: '' });
  const [btnText, setBtnText] = useState('SUBSCRIBE NOW & PLAY');
  const [btnAction, setBtnAction] = useState('SUBSCRIBE');
  const [saved, setSaved] = useState(false);
  const [device, setDevice] = useState('mobile'); // mobile, tablet, desktop

  useEffect(() => {
    flowApi.getPage(campid, pageType, '+971 50 *** 4589')
      .then((res) => {
        if (res?.data) {
          setPageData(res.data);
        }
      })
      .catch(console.error);
  }, [campid, pageType]);

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Layout title="Visual Funnel Canvas">
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Canvas Toolbar */}
        <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">Page:</span>
            <select
              value={pageType}
              onChange={(e) => setPageType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-semibold bg-white text-slate-800"
            >
              <option value="HOME">1. HOME (Offer Page)</option>
              <option value="OTP">2. OTP (Verify Screen)</option>
              <option value="CONFIRM">3. CONFIRM (Payment Confirmation)</option>
              <option value="THANKYOU">4. THANKYOU (Access Granted)</option>
              <option value="BLOCKED">5. BLOCKED (Restricted)</option>
              <option value="LOW_BALANCE">6. LOW_BALANCE (Recharge SIM)</option>
            </select>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setDevice('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                device === 'mobile' ? 'bg-white shadow-xs text-blue-700 font-semibold' : 'text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">smartphone</span>
              <span>Mobile 375px</span>
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                device === 'desktop' ? 'bg-white shadow-xs text-blue-700 font-semibold' : 'text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
              <span>Desktop</span>
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>{saved ? 'Saved!' : 'Save & Publish'}</span>
          </button>
        </div>

        {/* Builder Work Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Blocks Palette */}
          <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">Interactive Funnel Blocks</span>
            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 cursor-pointer text-xs font-medium text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">smart_button</span>
                <span>Subscribe CTA Button</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 cursor-pointer text-xs font-medium text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">dialpad</span>
                <span>4-Digit OTP Box</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 cursor-pointer text-xs font-medium text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">badge</span>
                <span>Carrier Logo Badge</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 cursor-pointer text-xs font-medium text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">sell</span>
                <span>Dynamic Price Tag</span>
              </div>
            </div>
          </div>

          {/* Center Canvas Preview Frame */}
          <div className="flex-1 bg-slate-100 flex items-center justify-center p-6 overflow-y-auto">
            <div
              className={`bg-white rounded-3xl border-8 border-slate-800 shadow-2xl overflow-hidden transition-all flex flex-col ${
                device === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full max-w-4xl h-[600px]'
              }`}
            >
              {/* Fake Mobile Header */}
              <div className="bg-slate-900 text-white px-6 py-2 flex items-center justify-between text-[11px] font-mono">
                <span>9:41</span>
                <span>5G • 100%</span>
              </div>

              {/* Dynamic Funnel Page Content (Light Theme) */}
              <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto text-center">
                <div>
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[28px]">sports_esports</span>
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl text-slate-900 leading-tight">UNLIMITED GAMING VAULT</h2>
                  <p className="text-xs text-slate-500 mt-2">Instant access to 500+ premium mobile games on Etisalat UAE.</p>

                  <div className="my-6 p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-xs text-slate-500 block">Subscribing with SIM:</span>
                    <span className="font-mono text-sm font-bold text-blue-700">+971 50 *** 4589</span>
                    <span className="block text-[11px] font-mono text-slate-500 mt-1">Price: 3.50 AED/day</span>
                  </div>
                </div>

                <div>
                  <button className="w-full py-3.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-200 hover:bg-blue-700 transition-all">
                    {btnText}
                  </button>
                  <p className="text-[10px] text-slate-400 mt-3">Daily recurring subscription on your mobile bill. To cancel send STOP to 1111.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Inspector Panel */}
          <div className="w-72 bg-white border-l border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">Button Action Inspector</span>
            <div>
              <label className="block text-xs font-mono text-slate-600 mb-1">Button Label</label>
              <input
                value={btnText}
                onChange={(e) => setBtnText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-600 mb-1">When Clicked Action</label>
              <select
                value={btnAction}
                onChange={(e) => setBtnAction(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
              >
                <option value="SUBSCRIBE">SUBSCRIBE Flow (1-Click HE / OTP)</option>
                <option value="GOTO_PAGE">Go to Another Page</option>
                <option value="EXTERNAL">External URL Redirect</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { flowApi, otpApi } from '../services/api';

export function FunnelSimulatorPage() {
  const [simMode, setSimMode] = useState('HE'); // 'HE' (1-Click) or 'OTP' (WiFi)
  const [step, setStep] = useState('INIT'); // INIT, HOME, OTP_INPUT, SUCCESS
  const [visitId, setVisitId] = useState(null);
  const [phone, setPhone] = useState('+971 50 123 4567');
  const [otpCode, setOtpCode] = useState('1234');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Start Session
  const startSimulation = async () => {
    setLoading(true);
    setStatusMsg('Connecting securely to Etisalat mobile network...');
    try {
      const headers = simMode === 'HE' ? { 'x-mock-msisdn': '+971509998877' } : {};
      const res = await flowApi.detect({
        country: 'AE',
        operator: 'ETISALAT',
        campid: 'AE-ETISALAT-101',
        vid: 'ADM01',
        click_id: `sim_click_${Date.now().toString(36)}`,
      }, headers);

      setVisitId(res.data.visitId);
      if (res.data.msisdn) {
        setPhone(res.data.msisdn);
      }
      setStep('HOME');
      setStatusMsg('');
    } catch (err) {
      setStatusMsg('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Click Subscribe CTA
  const handleSubscribeClick = async () => {
    setLoading(true);
    try {
      if (simMode === 'HE') {
        // Direct 1-Click Charge
        await flowApi.transition(visitId, 'SUBSCRIBE', phone);
        setStep('SUCCESS');
      } else {
        // Move to OTP prompt
        await otpApi.send(visitId, phone);
        setStep('OTP_INPUT');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await otpApi.verify(visitId, otpCode);
      setStep('SUCCESS');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Live Funnel Test Lab">
      <div className="p-8 flex flex-col gap-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900">Live Funnel Interactive Simulator</h1>
          <p className="text-sm text-slate-500 mt-1">Test the end-to-end subscriber journey live: 1-Click HE detection, SMS OTP verification, and conversion tracking.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Controls */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <h3 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100">Simulator Settings</h3>
            
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-500 uppercase mb-2">Simulate Network Condition</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setSimMode('HE'); setStep('INIT'); }}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    simMode === 'HE' ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">5g</span>
                  <span>Mobile 5G (HE 1-Click)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSimMode('OTP'); setStep('INIT'); }}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    simMode === 'OTP' ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">wifi</span>
                  <span>WiFi (SMS OTP Flow)</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 border border-slate-200">
              <span className="font-bold text-blue-700">How to test:</span>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>Click <strong>Start Ad Journey</strong> to trigger incoming click.</li>
                <li>Tap <strong>SUBSCRIBE</strong> in the phone frame.</li>
                <li>In OTP mode, use dev code <strong className="text-blue-700">1234</strong>.</li>
                <li>Go to <strong>Dashboard</strong> or <strong>Traffic Logs</strong> to see your new subscription!</li>
              </ul>
            </div>

            <button
              onClick={startSimulation}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              <span>Start Ad Journey</span>
            </button>
          </div>

          {/* Right Mobile Phone Frame */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-[360px] h-[640px] bg-white rounded-3xl border-8 border-slate-900 shadow-2xl flex flex-col overflow-hidden relative">
              {/* Status Bar */}
              <div className="bg-slate-900 text-white px-5 py-2 flex items-center justify-between text-[11px] font-mono">
                <span>9:41</span>
                <span>{simMode === 'HE' ? '5G (Etisalat)' : 'WiFi'} • 100%</span>
              </div>

              {/* Dynamic Screen States */}
              <div className="flex-1 p-6 flex flex-col justify-between text-center overflow-y-auto">
                {step === 'INIT' && (
                  <div className="my-auto">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4 border border-blue-100">
                      <span className="material-symbols-outlined text-[32px]">smartphone</span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-slate-900">Carrier Funnel Standby</h3>
                    <p className="text-xs text-slate-500 mt-2">Click "Start Ad Journey" to simulate visitor landing on /subscription.</p>
                  </div>
                )}

                {step === 'HOME' && (
                  <>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        ETISALAT UAE
                      </span>
                      <h2 className="font-heading font-extrabold text-2xl text-slate-900 mt-4 leading-tight">UNLIMITED GAMING VAULT</h2>
                      <p className="text-xs text-slate-500 mt-2">Instant access to 500+ premium mobile games.</p>

                      <div className="my-6 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                        <span className="text-xs text-slate-500 block">Subscribing with SIM:</span>
                        <span className="font-mono text-sm font-bold text-blue-700">{phone}</span>
                        <span className="block text-[11px] font-mono text-slate-500 mt-1">Price: 3.50 AED/day</span>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={handleSubscribeClick}
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? 'Processing...' : (simMode === 'HE' ? '1-CLICK SUBSCRIBE NOW' : 'CONTINUE TO VERIFY')}
                      </button>
                      <p className="text-[10px] text-slate-400 mt-3">Charges will be deducted from your mobile prepaid balance.</p>
                    </div>
                  </>
                )}

                {step === 'OTP_INPUT' && (
                  <div className="my-auto">
                    <h3 className="font-heading font-bold text-xl text-slate-900">Enter Verification Code</h3>
                    <p className="text-xs text-slate-500 mt-2">We sent a 4-digit code via SMS to {phone}</p>

                    <div className="my-6">
                      <input
                        type="text"
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-40 py-2.5 text-center text-2xl font-mono font-bold rounded-xl border-2 border-blue-600 focus:outline-none"
                      />
                      <span className="block text-[11px] font-mono text-blue-700 mt-2">Dev Mock Code: 1234</span>
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-200 transition-all"
                    >
                      {loading ? 'Verifying...' : 'CONFIRM & SUBSCRIBE'}
                    </button>
                  </div>
                )}

                {step === 'SUCCESS' && (
                  <div className="my-auto">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center mb-4 border border-blue-200">
                      <span className="material-symbols-outlined text-[36px]">check_circle</span>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-slate-900">WELCOME TO GAMERZ HUB!</h3>
                    <p className="text-xs text-slate-600 mt-2">Your subscription is active! 3.50 AED has been billed to your mobile SIM balance.</p>

                    <div className="my-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
                      <span>Status: </span>
                      <strong className="text-blue-700">SUBSCRIBED & S2S POSTBACK FIRED</strong>
                    </div>

                    <button
                      onClick={() => setStep('INIT')}
                      className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
                    >
                      Start New Test
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

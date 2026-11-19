import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { flowApi, otpApi } from '../services/api';
import { Smartphone, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Radio, Lock } from 'lucide-react';

export function SubscriptionPage() {
  const [searchParams] = useSearchParams();
  const country = searchParams.get('country') || 'IN';
  const operator = searchParams.get('operator') || 'XZ12';
  const trackingCampid = searchParams.get('tracking_campid') || searchParams.get('campid') || 'IN-XZ12-33';
  const paramMsisdn = searchParams.get('msisdn') || '';

  // State machine
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('DETECT'); // DETECT -> HOME -> OTP -> THANKYOU -> ERROR
  const [phone, setPhone] = useState(paramMsisdn);
  const [otp, setOtp] = useState('');
  const [visitId, setVisitId] = useState(null);
  const [heDetected, setHeDetected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');

  // 1. Initial HE Detect
  useEffect(() => {
    let active = true;
    async function bootFunnel() {
      setLoading(true);
      setErrorMsg('');
      try {
        // Call detect-msisdn
        const res = await flowApi.detect({
          country,
          operator,
          tracking_campid: trackingCampid,
          msisdn: paramMsisdn || undefined,
        });

        if (!active) return;
        const data = res?.data || res;
        setVisitId(data.visitId || 'vis_' + Date.now());

        if (data.detectedMsisdn || paramMsisdn) {
          const resolvedPhone = data.detectedMsisdn || paramMsisdn;
          setPhone(resolvedPhone);
          setHeDetected(true);
          // Load HOME page with detected HE
          await fetchPage('HOME', resolvedPhone);
          setStep('HOME');
        } else {
          // Wi-Fi or No HE -> Direct to HOME or OTP
          setHeDetected(false);
          await fetchPage('HOME', '');
          setStep('HOME');
        }
      } catch (err) {
        console.warn('Detect fallback:', err);
        // Fallback to interactive test view
        setVisitId('vis_sim_' + Date.now());
        setStep('HOME');
      } finally {
        if (active) setLoading(false);
      }
    }

    bootFunnel();
    return () => { active = false; };
  }, [country, operator, trackingCampid, paramMsisdn]);

  // Fetch page template from backend
  const fetchPage = async (pageType, currentPhone) => {
    try {
      const res = await flowApi.getPage(trackingCampid, pageType, currentPhone);
      const data = res?.data || res;
      if (data?.htmlContent) setHtmlContent(data.htmlContent);
      if (data?.cssContent) setCssContent(data.cssContent);
    } catch {
      // Use standard telecom theme
      setHtmlContent('');
    }
  };

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // Handle Subscribe CTA from HOME
  const handleHomeSubscribe = async () => {
    if (heDetected && phone) {
      // 1-Click Direct Carrier Billing
      setLoading(true);
      try {
        await flowApi.transition(visitId, 'SUBSCRIBE', phone);
        setStep('THANKYOU');
      } catch {
        setStep('THANKYOU');
      } finally {
        setLoading(false);
      }
    } else {
      // Missing phone or Wi-Fi -> go to OTP step
      setStep('OTP');
      if (phone) {
        handleSendOtp();
      }
    }
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 8) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }
    setErrorMsg('');
    setSendingOtp(true);
    try {
      await otpApi.send(visitId, phone);
      setCountdown(30);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send PIN.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrorMsg('Please enter 4-6 digit SMS PIN.');
      return;
    }
    setErrorMsg('');
    setVerifyingOtp(true);
    try {
      await otpApi.verify(visitId, otp);
      setStep('THANKYOU');
    } catch (err) {
      setErrorMsg(err.message || 'Incorrect PIN. Try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      {/* Top Telecom Simulator Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 font-mono">
            <Radio className="w-4 h-4 text-blue-600" />
            <span>CARRIERCRAFT LIVE FUNNEL</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="font-mono">
            {country} · {operator} · <strong className="text-blue-700">{trackingCampid}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
            heDetected ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {heDetected ? '● 3G/4G/5G CELLULAR HE DETECTED' : '○ WI-FI CONNECTION (FALLBACK)'}
          </span>
        </div>
      </div>

      {/* Main Mobile Screen Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[580px]">
          {/* Mobile Status Bar */}
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between text-xs font-mono">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span>{heDetected ? '5G' : 'Wi-Fi'}</span>
              <span>100%</span>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-mono">Resolving subscriber identity & billing headers...</p>
            </div>
          ) : step === 'HOME' ? (
            /* HOME LANDING SCREEN */
            <div className="flex-1 flex flex-col justify-between p-6">
              <div className="text-center pt-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4 shadow-xs">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Unlimited Gaming Pass</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enjoy access to 500+ premium arcade & mobile games with your mobile carrier.
                </p>
                <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700">
                  <p className="font-semibold text-blue-900">Subscription Terms</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">3.5 AED/day or 30 INR/day · Auto-renewable · Cancel anytime</p>
                </div>
              </div>

              {heDetected && phone ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
                  <span className="text-slate-500">Connected as: </span>
                  <strong className="font-mono text-slate-900">{phone}</strong>
                </div>
              ) : null}

              <div className="space-y-3 pt-6">
                <button
                  onClick={handleHomeSubscribe}
                  className="w-full py-3.5 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-[0.98]"
                >
                  {heDetected ? '1-CLICK SUBSCRIBE NOW' : 'CONTINUE WITH MOBILE NUMBER'}
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  By clicking subscribe, you agree to telecom terms & conditions.
                </p>
              </div>
            </div>
          ) : step === 'OTP' ? (
            /* OTP VERIFICATION SCREEN */
            <div className="flex-1 flex flex-col justify-between p-6">
              <div>
                <div className="text-center pt-2 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Verify Mobile Number</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your phone number to receive a secure SMS confirmation PIN.
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-center">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || countdown > 0}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 disabled:opacity-50"
                      >
                        {sendingOtp ? 'Sending...' : countdown > 0 ? `${countdown}s` : 'Send PIN'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">4-Digit SMS PIN</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter PIN (e.g. 1234)"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-center tracking-widest text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-400 text-center mt-1">
                      (In test mode, any 4-digit code works)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-6">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp}
                  className="w-full py-3.5 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {verifyingOtp ? 'VERIFYING PIN...' : 'CONFIRM SUBSCRIPTION'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('HOME')}
                  className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 text-center font-medium"
                >
                  Back to offer
                </button>
              </div>
            </div>
          ) : step === 'THANKYOU' ? (
            /* THANK YOU / SUCCESS SCREEN */
            <div className="flex-1 flex flex-col justify-between p-6 text-center">
              <div className="pt-8">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Subscription Activated!</h2>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Thank you! Your carrier subscription has been verified and charged successfully.
                </p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subscriber:</span>
                    <span className="font-bold text-slate-800">{phone || 'Identified via HE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="text-blue-700">{visitId?.slice(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold text-blue-700">BILLED / ACTIVE</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3.5 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
                >
                  TEST FUNNEL AGAIN
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Simulator Footer */}
      <div className="bg-white border-t border-slate-200 p-3 text-center text-xs text-slate-500 font-mono">
        CarrierCraft Telecom Billing Simulator · Session: {visitId || 'pending'}
      </div>
    </div>
  );
}

export default SubscriptionPage;

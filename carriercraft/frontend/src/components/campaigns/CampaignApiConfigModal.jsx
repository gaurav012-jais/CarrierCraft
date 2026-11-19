import { useState, useEffect } from 'react';
import { X, Save, Shield, Key, Globe, Link2 } from 'lucide-react';
import { campaignsApi } from '../../services/api';

export function CampaignApiConfigModal({ campaignId, initialConfig, onClose, onSaved }) {
  const [heProvider, setHeProvider] = useState('header');
  const [checkSubUrl, setCheckSubUrl] = useState('');
  const [blocklistUrl, setBlocklistUrl] = useState('');
  const [subscribeUrl, setSubscribeUrl] = useState('');
  const [sendOtpUrl, setSendOtpUrl] = useState('');
  const [verifyOtpUrl, setVerifyOtpUrl] = useState('');
  const [successRedirectUrl, setSuccessRedirectUrl] = useState('');
  const [failRedirectUrl, setFailRedirectUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setHeProvider(initialConfig.he_provider || 'header');
      setCheckSubUrl(initialConfig.check_sub_url || '');
      setBlocklistUrl(initialConfig.blocklist_url || '');
      setSubscribeUrl(initialConfig.subscribe_url || '');
      setSendOtpUrl(initialConfig.send_otp_url || '');
      setVerifyOtpUrl(initialConfig.verify_otp_url || '');
      const heJson = initialConfig.he_config_json || {};
      setSuccessRedirectUrl(heJson.successRedirectUrl || '');
      setFailRedirectUrl(heJson.failRedirectUrl || '');
    }
  }, [initialConfig]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        heProvider,
        checkSubUrl,
        blocklistUrl,
        subscribeUrl,
        sendOtpUrl,
        verifyOtpUrl,
        heConfigJson: {
          successRedirectUrl,
          failRedirectUrl,
        },
      };
      await campaignsApi.saveApiConfig(campaignId, payload);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-base">Partner Telecom API & HE Config</h3>
              <p className="text-xs text-slate-500">Configure Header Enrichment, Checksub, and SMS Gateways</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5 text-sm">
          {/* HE Provider */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
              Header Enrichment (HE) Provider
            </label>
            <select
              value={heProvider}
              onChange={(e) => setHeProvider(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="header">Carrier Header (Default - HTTP SIM Headers)</option>
              <option value="none">None (Always Unresolved / Wi-Fi Funnel)</option>
              <option value="custom_http">Custom HTTP (External Resolver Endpoint)</option>
              <option value="safaricom_masked">Safaricom 2-Step Masked Token (Kenya)</option>
            </select>
          </div>

          {/* Checksub & Blocklist */}
          <div className="grid grid-cols-1 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
                Checksub API URL (Subscription Status)
              </label>
              <input
                type="text"
                placeholder="https://telco-gw.com/sub/checksub?msisdn={{msisdn}}&serviceId=GAME"
                value={checkSubUrl}
                onChange={(e) => setCheckSubUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Macro: {'{{msisdn}}'} replaces subscriber phone number.</span>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
                Blocklist API URL (DND / Blacklist Check)
              </label>
              <input
                type="text"
                placeholder="https://telco-gw.com/sub/checkblock?msisdn={{msisdn}}"
                value={blocklistUrl}
                onChange={(e) => setBlocklistUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Direct Subscribe API */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
              Direct Billing Charge API (1-Click HE Subscribe)
            </label>
            <input
              type="text"
              placeholder="https://telco-gw.com/sub/charge?msisdn={{msisdn}}&plan={{planId}}"
              value={subscribeUrl}
              onChange={(e) => setSubscribeUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* SMS OTP Gateway */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
                SMS Send OTP URL
              </label>
              <input
                type="text"
                placeholder="https://telco-gw.com/otp/generate?msisdn={{msisdn}}"
                value={sendOtpUrl}
                onChange={(e) => setSendOtpUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
                SMS Verify OTP URL
              </label>
              <input
                type="text"
                placeholder="https://telco-gw.com/otp/validate?msisdn={{msisdn}}&otp={{otp}}"
                value={verifyOtpUrl}
                onChange={(e) => setVerifyOtpUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Redirect URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
                Already Active Success Redirect URL
              </label>
              <input
                type="text"
                placeholder="https://content-portal.com/login"
                value={successRedirectUrl}
                onChange={(e) => setSuccessRedirectUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
                Wi-Fi Fail Fallback Redirect URL
              </label>
              <input
                type="text"
                placeholder="https://operator-consent-gw.com/fallback"
                value={failRedirectUrl}
                onChange={(e) => setFailRedirectUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm shadow-blue-200 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

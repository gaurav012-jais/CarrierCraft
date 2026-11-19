import axios from 'axios';
import { createApp } from '../src/app.js';
import { testConnection, pool } from '../src/database/connection.js';

const PORT = 3000; // Standard allowed port

async function runSmokeTest() {
  console.log('🧪 [SMOKE TEST] Initializing CarrierCraft Backend Test Suite...');

  // 1. Verify DB
  await testConnection();
  console.log('✓ Step 1: Database connection verified.');

  // 2. Start App on test port
  const app = createApp();
  const server = app.listen(PORT);
  console.log(`✓ Step 2: Test server listening on http://localhost:${PORT}`);

  const client = axios.create({ baseURL: `http://localhost:${PORT}` });

  try {
    // 3. Health Check
    const health = await client.get('/health');
    console.log('✓ Step 3: GET /health ->', health.data.status);

    // 4. Admin Login
    const login = await client.post('/api/auth/login', {
      email: 'admin@carriercraft.com',
      password: 'admin123',
    });
    const token = login.data.data.token;
    console.log('✓ Step 4: POST /api/auth/login -> JWT received for:', login.data.data.user.name);

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 5. Markets List
    const markets = await client.get('/api/markets', { headers: authHeaders });
    console.log(`✓ Step 5: GET /api/markets -> Found ${markets.data.data.length} countries, Operator: ${markets.data.data[0].operators[0].name}`);

    // 6. Campaigns List
    const campaigns = await client.get('/api/campaigns', { headers: authHeaders });
    const camp = campaigns.data.data[0];
    console.log(`✓ Step 6: GET /api/campaigns -> Found: ${camp.name} (${camp.tracking_id}) [Mode: ${camp.verification_mode}]`);

    // 7. Public Flow Detect (1-Click HE Simulation with simulated header)
    const detectHe = await client.get(`/api/flow/detect-msisdn?campid=${camp.tracking_id}&vid=ADM01&click_id=click_auto_999`, {
      headers: { 'x-mock-msisdn': '+971509876543' }
    });
    console.log('✓ Step 7: GET /api/flow/detect-msisdn (HE Success) -> Visit ID:', detectHe.data.data.visitId, '| MSISDN:', detectHe.data.data.msisdn);

    // 8. Public Flow Detect (WiFi / No HE -> OTP Path)
    const detectWifi = await client.get(`/api/flow/detect-msisdn?campid=${camp.tracking_id}&vid=ADM01&click_id=click_wifi_888`);
    const wifiVisitId = detectWifi.data.data.visitId;
    console.log('✓ Step 8: GET /api/flow/detect-msisdn (WiFi / No HE) -> Visit ID:', wifiVisitId, '| Detected:', detectWifi.data.data.detected);

    // 9. Fetch Page HTML/CSS
    const page = await client.get(`/api/flow/page?campid=${camp.tracking_id}&pageType=HOME&msisdn=+971509876543`);
    console.log('✓ Step 9: GET /api/flow/page (HOME) -> Length:', page.data.data.html.length, 'chars');

    // 10. Send OTP
    const sendOtp = await client.post('/api/otp/send', {
      visitId: wifiVisitId,
      phone: '+971501234567',
    });
    console.log('✓ Step 10: POST /api/otp/send ->', sendOtp.data.message);

    // 11. Verify OTP with code 1234
    const verifyOtp = await client.post('/api/otp/verify', {
      visitId: wifiVisitId,
      otp: '1234',
    });
    console.log('✓ Step 11: POST /api/otp/verify (Code 1234) -> Next Page:', verifyOtp.data.data.nextPage);

    // 12. Dashboard KPIs
    const dashboard = await client.get('/api/analytics/dashboard', { headers: authHeaders });
    console.log('✓ Step 12: GET /api/analytics/dashboard -> KPIs:', dashboard.data.data.kpis);

    // 13. Waterfall Inspector for the verified visit
    const waterfall = await client.get(`/api/analytics/visits/${wifiVisitId}/waterfall`, { headers: authHeaders });
    console.log('✓ Step 13: GET /api/analytics/visits/:id/waterfall -> Status:', waterfall.data.data.visit.status, '| Events count:', waterfall.data.data.events.length);

    console.log('\n🎉 ========================================================');
    console.log('🎉 [ALL 13 SMOKE TESTS PASSED CLEANLY WITH ZERO ERRORS!]');
    console.log('🎉 ========================================================\n');
  } finally {
    server.close();
    await pool.end();
  }
}

runSmokeTest().catch((err) => {
  console.error('❌ Smoke test failed:', err.response?.data || err.message);
  process.exit(1);
});

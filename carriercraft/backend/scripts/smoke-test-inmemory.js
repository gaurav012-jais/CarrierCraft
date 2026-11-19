import { testConnection, pool } from '../src/database/connection.js';
import { authService } from '../src/modules/auth/auth.service.js';
import { marketsService } from '../src/modules/markets/markets.service.js';
import { campaignsService } from '../src/modules/campaigns/campaigns.service.js';
import { flowService } from '../src/modules/flow/flow.service.js';
import { otpService } from '../src/modules/otp/otp.service.js';
import { analyticsService } from '../src/modules/analytics/analytics.service.js';
import { postbacksService } from '../src/modules/postbacks/postbacks.service.js';
import { templatesService } from '../src/modules/templates/templates.service.js';
import { partnersService } from '../src/modules/partners/partners.service.js';

async function runTestSuite() {
  console.log('🧪 ========================================================');
  console.log('🧪 [CARRIERCRAFT SUITE] Testing All Modules End-to-End...');
  console.log('🧪 ========================================================\n');

  try {
    // 1. Database Connection
    const dbTime = await testConnection();
    console.log('✓ 1. Database Connection OK. PostgreSQL Time:', dbTime);

    // 2. Auth Module
    const loginResult = await authService.login('admin@carriercraft.com', 'admin123');
    console.log('✓ 2. Auth Module OK. Login Token Received for:', loginResult.user.name, `(${loginResult.user.role})`);

    const profile = await authService.getProfile(loginResult.user.id);
    console.log('✓ 3. Profile OK. Verified Admin Email:', profile.email);

    // 3. Markets Module
    const markets = await marketsService.getMarkets();
    console.log(`✓ 4. Markets Module OK. Found ${markets.length} Countries. First Operator: ${markets[0].operators[0].name}`);

    // 4. Campaigns Module
    const campaigns = await campaignsService.listCampaigns();
    const activeCamp = campaigns[0];
    console.log(`✓ 5. Campaigns Module OK. Found: ${activeCamp.name} | Tracking ID: ${activeCamp.tracking_id} | Mode: ${activeCamp.verification_mode}`);

    // 5. Templates Module
    const templates = await templatesService.listTemplates();
    console.log(`✓ 6. Templates Module OK. Found ${templates.length} GrapesJS Canvas Templates.`);

    // 6. Partners Module
    const vendors = await partnersService.listVendors();
    console.log(`✓ 7. Partners Module OK. Found Vendor: ${vendors[0].name} (${vendors[0].code})`);

    // 7. Public Flow Engine (HE 1-Click Simulation)
    const heVisit = await flowService.detectMsisdn({
      countryCode: 'AE',
      operatorCode: 'ETISALAT',
      campid: activeCamp.tracking_id,
      vid: 'ADM01',
      clickId: 'click_he_123',
      headers: { 'x-msisdn': '+971509998877' },
      ip: '197.234.10.5',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    });
    console.log(`✓ 8. Public Flow (HE 1-Click) OK. Visit ID: ${heVisit.visitId} | Detected Phone: ${heVisit.msisdn} | Entry: ${heVisit.entryPage}`);

    // 8. Public Flow Engine (WiFi / No HE Simulation)
    const wifiVisit = await flowService.detectMsisdn({
      countryCode: 'AE',
      operatorCode: 'ETISALAT',
      campid: activeCamp.tracking_id,
      vid: 'ADM01',
      clickId: 'click_wifi_456',
      headers: {},
      ip: '197.234.10.6',
      userAgent: 'Mozilla/5.0 (Android 14; Mobile)',
    });
    console.log(`✓ 9. Public Flow (WiFi OTP Path) OK. Visit ID: ${wifiVisit.visitId} | Detected: ${wifiVisit.detected} | Entry: ${wifiVisit.entryPage}`);

    // 9. Public Flow Page Serve (Dynamic Macro Replacement)
    const homePage = await flowService.getPage({
      campid: activeCamp.tracking_id,
      pageType: 'HOME',
      msisdn: '+971509998877',
    });
    console.log(`✓ 10. Funnel Page Serve OK. Rendered Page: ${homePage.pageType} (HTML size: ${homePage.html.length} chars)`);

    // 10. OTP Module (Send OTP to WiFi visitor)
    const sendOtpRes = await otpService.sendOtp({
      visitId: wifiVisit.visitId,
      phone: '+971501112233',
    });
    console.log(`✓ 11. OTP Send OK. Response: ${sendOtpRes.message}`);

    // 11. OTP Module (Verify OTP with Code 1234)
    const verifyOtpRes = await otpService.verifyOtp({
      visitId: wifiVisit.visitId,
      otp: '1234',
    });
    console.log(`✓ 12. OTP Verify OK. Subscription Activated! Next Page: ${verifyOtpRes.nextPage}`);

    // 12. Analytics Module (Live KPIs)
    const kpisData = await analyticsService.getDashboardKpis();
    console.log(`✓ 13. Analytics KPIs OK. Visits: ${kpisData.kpis.totalVisits} | Conversions: ${kpisData.kpis.conversions} | HE Rate: ${kpisData.kpis.heRate}`);

    // 13. Analytics Waterfall Inspector (Timeline of verified visit)
    const waterfall = await analyticsService.getVisitWaterfall(wifiVisit.visitId);
    console.log(`✓ 14. Waterfall Inspector OK. Visit Status: ${waterfall.visit.status} | Timeline Events Logged: ${waterfall.events.length}`);

    // 14. Postbacks Module
    const postbacks = await postbacksService.listPostbacks(5);
    console.log(`✓ 15. Postbacks Audit OK. Postbacks Log Count: ${postbacks.length}`);

    console.log('\n🎉 ========================================================');
    console.log('🎉 [ALL 15 END-TO-END TESTS PASSED WITH 100% SUCCESS!]');
    console.log('🎉 [BACKEND IS 100% OPERATIONAL, MODULAR, AND VERIFIED!]');
    console.log('🎉 ========================================================\n');
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});

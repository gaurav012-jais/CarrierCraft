import { pool, query } from '../src/database/connection.js';
import { authService } from '../src/modules/auth/auth.service.js';
import { marketsService } from '../src/modules/markets/markets.service.js';
import { campaignsService } from '../src/modules/campaigns/campaigns.service.js';
import { campaignPagesService } from '../src/modules/campaigns/campaign-pages.service.js';
import { campaignVendorsService } from '../src/modules/campaigns/campaign-vendors.service.js';
import { partnersService } from '../src/modules/partners/partners.service.js';
import { analyticsService } from '../src/modules/analytics/analytics.service.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('🧪 Starting Carriercraft Foundation Modules Smoke Test...\n');

  try {
    // 1. Auth Test
    console.log('▶ [1/7] Testing Auth Module (Admin Login)...');
    const authRes = await authService.login('abhivishwkarmaa52@gmail.com', '123456');
    assert(Boolean(authRes?.token), 'Admin login generated valid JWT');
    assert(authRes?.user?.email === 'abhivishwkarmaa52@gmail.com', 'Admin user email verified');

    // 2. Markets Test
    console.log('\n▶ [2/7] Testing Markets & Hierarchy...');
    const markets = await marketsService.getMarkets();
    assert(Array.isArray(markets) && markets.length > 0, `Loaded ${markets.length} markets`);
    const aeMarket = markets.find(m => m.countryCode === 'AE');
    assert(Boolean(aeMarket), 'Found UAE market');
    assert(Boolean(aeMarket.operatorName), 'Market has operator configured');

    // 3. Campaigns List & Detail Test
    console.log('\n▶ [3/7] Testing Campaigns Module...');
    const campaigns = await campaignsService.listCampaigns();
    assert(Array.isArray(campaigns) && campaigns.length > 0, `Loaded ${campaigns.length} active campaigns`);
    const campId = campaigns[0].id;
    const detail = await campaignsService.getCampaignById(campId);
    assert(detail.id === campId, `Fetched campaign detail for [${detail.name}]`);
    assert(Array.isArray(detail.pages) && detail.pages.length === 8, `Campaign has all 8 funnel pages seeded`);

    // 4. Campaign Pages (GrapesJS Editor) Test
    console.log('\n▶ [4/7] Testing Campaign Pages & Visual Editor...');
    const homePage = await campaignPagesService.getPageByType(campId, 'HOME');
    assert(Boolean(homePage && homePage.page_type === 'HOME'), 'Fetched HOME page record');
    const saved = await campaignPagesService.savePage(campId, 'HOME', {
      htmlContent: '<div class="test-home"><h1>Gamerz Hub UAE</h1></div>',
      cssContent: '.test-home { color: #2563eb; }',
      projectData: { customWidth: 375, customHeight: 812 }
    });
    assert(saved.html_content.includes('Gamerz Hub UAE'), 'Successfully saved GrapesJS canvas HTML/CSS');

    // 5. Campaign API Config Test
    console.log('\n▶ [5/7] Testing Campaign API & HE Config...');
    const savedConfig = await campaignsService.saveApiConfig(campId, {
      heProvider: 'header',
      checkSubUrl: 'https://telco.example/sub/checksub?msisdn={{msisdn}}',
      sendOtpUrl: 'https://telco.example/otp/send',
      verifyOtpUrl: 'https://telco.example/otp/verify',
      subscribeUrl: 'https://telco.example/sub/charge',
      heConfigJson: { successRedirectUrl: 'https://games.example.com/play' }
    });
    assert(savedConfig.he_provider === 'header', 'HE provider saved as header');
    assert(savedConfig.check_sub_url.includes('checksub'), 'Checksub URL saved');

    // 6. Vendors & Campaign Tracking Assignment Test
    console.log('\n▶ [6/7] Testing Vendors & Tracking Assignment...');
    const vendors = await partnersService.listVendors();
    assert(Array.isArray(vendors), `Vendors list returned (${vendors.length} vendors)`);
    let vendorId = vendors[0]?.id;
    if (!vendorId) {
      const newV = await partnersService.createVendor({ name: 'TikTok Ads', code: 'TIKTOK', postbackUrl: 'https://ad.tiktok.com/pb?click_id={click_id}&payout={payout}' });
      vendorId = newV.id;
    }
    const assigned = await campaignVendorsService.assignVendor(campId, { vendorId, payoutUsd: 2.50, dailyCap: 200 });
    assert(assigned.vendor_id === vendorId, 'Vendor assigned to campaign with payout $2.50');
    const assignedList = await campaignVendorsService.getAssignedVendors(campId);
    assert(assignedList.length > 0 && Boolean(assignedList[0].trackingUrl), 'Tracking link generated with dual campids');

    // 7. Analytics & Waterfall Test
    console.log('\n▶ [7/7] Testing Analytics & Session Trace...');
    const kpis = await analyticsService.getDashboardKpis();
    assert(Boolean(kpis?.kpis), 'Dashboard KPIs computed successfully');
    const visits = await analyticsService.listVisits({ limit: 5 });
    assert(Array.isArray(visits), `Traffic visits list returned (${visits.length} visits)`);

  } catch (err) {
    console.error('❌ Test threw unexpected error:', err);
    failed++;
  } finally {
    await pool.end();
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();

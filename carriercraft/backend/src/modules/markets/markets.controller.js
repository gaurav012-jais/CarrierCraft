import { marketsService } from './markets.service.js';
import { successResponse } from '../../utils/response.js';

export class MarketsController {
  async getMarkets(req, res, next) {
    try {
      const markets = await marketsService.getMarkets();
      return successResponse(res, markets, 'Markets fetched successfully.');
    } catch (err) { next(err); }
  }

  async getMarketDetails(req, res, next) {
    try {
      const { countryCode, operatorCode } = req.params;
      const details = await marketsService.getMarketDetails(countryCode, operatorCode);
      return successResponse(res, details, 'Market details fetched.');
    } catch (err) { next(err); }
  }

  async createMarket(req, res, next) {
    try {
      const market = await marketsService.createMarket(req.body);
      return successResponse(res, market, 'Market created successfully.', 201);
    } catch (err) { next(err); }
  }

  async updateMarket(req, res, next) {
    try {
      const { countryCode, operatorCode } = req.params;
      const market = await marketsService.updateMarket(countryCode, operatorCode, req.body);
      return successResponse(res, market, 'Market updated successfully.');
    } catch (err) { next(err); }
  }

  async createMarketCampaign(req, res, next) {
    try {
      const { countryCode, operatorCode } = req.params;
      const campaign = await marketsService.createMarketCampaign(countryCode, operatorCode, req.body);
      return successResponse(res, campaign, 'Market campaign created successfully.', 201);
    } catch (err) { next(err); }
  }

  async addCountry(req, res, next) {
    try {
      const country = await marketsService.addCountry(req.body);
      return successResponse(res, country, 'Country added successfully.', 201);
    } catch (err) { next(err); }
  }

  async addOperator(req, res, next) {
    try {
      const operator = await marketsService.addOperator(req.body);
      return successResponse(res, operator, 'Operator added successfully.', 201);
    } catch (err) { next(err); }
  }

  async toggleOperator(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updated = await marketsService.toggleOperator(id, isActive);
      return successResponse(res, updated, 'Operator status updated.');
    } catch (err) { next(err); }
  }
}

export const marketsController = new MarketsController();

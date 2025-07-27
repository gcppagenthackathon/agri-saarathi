
'use server';

import { analyzeMarketTrends, MarketTrendAnalysisOutput } from '@/ai/flows/market-trend-analysis';

export async function getMarketAnalysis(crops: string[]): Promise<MarketTrendAnalysisOutput | { error: string }> {
  try {
    if (!crops || crops.length === 0) {
      return { error: 'At least one crop must be provided.' };
    }
    const result = await analyzeMarketTrends({ crops });
    return result;
  } catch (e) {
    // console.error(e);
    return { error: 'Failed to get market analysis. Please try again.' };
  }
}

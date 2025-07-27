
'use server';

/**
 * @fileOverview Provides market trend analysis for crops, allowing farmers to make informed selling decisions.
 *
 * - analyzeMarketTrends - A function that handles the market trend analysis process.
 * - MarketTrendAnalysisInput - The input type for the analyzeMarketTrends function.
 * - MarketTrendAnalysisOutput - The return type for the analyzeMarketTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketTrendAnalysisInputSchema = z.object({
  crops: z.array(z.string()).describe('A list of crops for which market trends are being analyzed.'),
});
export type MarketTrendAnalysisInput = z.infer<typeof MarketTrendAnalysisInputSchema>;

const PriceDetailSchema = z.object({
    price: z.string().describe("The price of the crop, prefixed with the Rupee symbol (e.g., '₹2,100')."),
});

const HistoricalPriceSchema = z.object({
    date: z.string().describe('The date for the historical price (e.g., "YYYY-MM-DD").'),
    price: z.number().describe('The numerical price value for that date.'),
});

const CropPriceAnalysisSchema = z.object({
    cropName: z.string().describe('The name of the crop.'),
    today: PriceDetailSchema.describe("Today's market price."),
    tomorrow: PriceDetailSchema.describe("Tomorrow's market price prediction."),
    sevenDayAverage: z.string().describe("The 7-day average price for the crop, prefixed with the Rupee symbol (e.g., '₹2100')."),
    summary: z.string().describe('A brief, one-sentence AI summary of the market analysis.'),
    imageUrl: z.string().url().describe('A data URI of a generated image for the crop.'),
    imageHint: z.string().describe('A two-word hint for a real image search (e.g., "wheat stalks").'),
    historicalPrices: z.array(HistoricalPriceSchema).describe('A list of historical prices for the past 7 days to show a trend graph.'),
});

const MarketTrendAnalysisOutputSchema = z.object({
  analysis: z.array(CropPriceAnalysisSchema).describe('The market trend analysis for each requested crop.'),
});
export type MarketTrendAnalysisOutput = z.infer<typeof MarketTrendAnalysisOutputSchema>;

export async function analyzeMarketTrends(input: MarketTrendAnalysisInput): Promise<MarketTrendAnalysisOutput> {
  return analyzeMarketTrendsFlow(input);
}


const PromptOutputSchema = z.object({
  analysis: z.array(z.object({
    cropName: z.string(),
    today: PriceDetailSchema,
    tomorrow: PriceDetailSchema,
    sevenDayAverage: z.string(),
    summary: z.string(),
    imageHint: z.string(),
    historicalPrices: z.array(HistoricalPriceSchema),
  })),
});


const prompt = ai.definePrompt({
  name: 'marketTrendAnalysisPrompt',
  input: {schema: MarketTrendAnalysisInputSchema},
  output: {schema: PromptOutputSchema},
  prompt: `You are an expert agricultural market analyst. A farmer is asking about the market prices for a list of crops.

Crops: {{#each crops}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

For each crop, provide a detailed analysis.
- Provide today's price, prefixed with the Rupee symbol (e.g., '₹2150').
- Provide tomorrow's predicted price, prefixed with the Rupee symbol (e.g., '₹2150').
- Calculate and provide the 7-day average price, prefixed with the Rupee symbol (e.g., '₹2120').
- Provide a brief, one-sentence AI-generated summary for the market analysis.
- Provide a two-word search hint for finding a real image later (e.g., "wheat stalks").
- Provide a list of historical prices for the past 7 days (including today), with date and a numerical price, for a trend graph. The date should be in 'YYYY-MM-DD' format.

Return the response in the specified JSON format. Do not include image URLs.`,
});

const analyzeMarketTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeMarketTrendsFlow',
    inputSchema: MarketTrendAnalysisInputSchema,
    outputSchema: MarketTrendAnalysisOutputSchema,
  },
  async input => {
    const {output: analysisOutput} = await prompt(input);
    if (!analysisOutput) {
      throw new Error('Failed to get market analysis.');
    }

    const analysisWithImages = await Promise.all(
      analysisOutput.analysis.map(async (item) => {
          try {
              const {media} = await ai.generate({
                  model: 'googleai/gemini-2.0-flash-preview-image-generation',
                  prompt: `A clear, high-quality, iconic image of a ${item.cropName} harvest, on a simple light background.`,
                  config: {
                      responseModalities: ['TEXT', 'IMAGE'],
                  },
              });
              return {
                  ...item,
                  imageUrl: media.url!,
              };
          } catch (error) {
              // console.error(`Image generation failed for ${item.cropName}:`, error);
              return {
                  ...item,
                  imageUrl: 'https://placehold.co/64x64.png', // Fallback image
              };
          }
      })
    );

    return { analysis: analysisWithImages };
  }
);

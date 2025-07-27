
'use server';
/**
 * @fileOverview A flow for generating personalized content for the user.
 *
 * - getPersonalizedContent - A function that fetches personalized articles and guides.
 * - PersonalizedContentInput - The input type for the getPersonalizedContent function.
 * - PersonalizedContentOutput - The return type for the getPersonalizedContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedContentInputSchema = z.object({
  crops: z.array(z.string()).describe('A list of crop names the user is interested in (e.g., ["Wheat", "Banana"]).'),
  topics: z.array(z.string()).describe('A list of topics the user is interested in (e.g., ["Disease", "Market Trends"]).'),
});
export type PersonalizedContentInput = z.infer<typeof PersonalizedContentInputSchema>;

const RecommendationSchema = z.object({
    text: z.string().describe('The engaging title or summary of the content.'),
    category: z.string().describe('A short category for the content (e.g., "Article", "Guide", "Market Intel").'),
    icon: z.enum(['BookOpen', 'Sprout', 'LineChart', 'Bug', 'Shield', 'Landmark']).describe('The most relevant icon name for the content.'),
    type: z.enum(['market_trend', 'subsidy_info', 'article']).describe('The type of recommendation to determine the action.'),
    payload: z.record(z.any()).describe('A payload containing data relevant to the recommendation type. For market_trend, include a "crops" array. For subsidy_info, include a "query" string. For article, include a "query" string.'),
});

const PersonalizedContentOutputSchema = z.object({
  recommendations: z.array(RecommendationSchema).describe('An array of 3 personalized recommendations.'),
});
export type PersonalizedContentOutput = z.infer<typeof PersonalizedContentOutputSchema>;


export async function getPersonalizedContent(
  input: PersonalizedContentInput
): Promise<PersonalizedContentOutput> {
  return personalizedContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedContentPrompt',
  input: {schema: PersonalizedContentInputSchema},
  output: {schema: PersonalizedContentOutputSchema},
  prompt: `You are an AI assistant for farmers. Your task is to generate 3 highly relevant and personalized recommendations based on the farmer's chosen crops and topics of interest.

The farmer is interested in the following:
Crops: {{#each crops}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Topics: {{#each topics}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Generate a diverse set of 3 recommendations. Each recommendation should be a concise, actionable title for an article, guide, or market insight. For each, provide a category, a relevant icon, a type, and a payload.

- The 'type' should be one of: 'market_trend', 'subsidy_info', 'article'.
- The 'payload' should contain relevant data.
  - For 'market_trend', the payload must be a JSON object with a "crops" key, e.g., {"crops": ["Rice"]}. Only include one crop.
  - For 'subsidy_info', the payload must be a JSON object with a "query" key, e.g., {"query": "subsidies for wheat farming"}.
  - For 'article', the payload must be a JSON object with a "query" key, e.g., {"query": "how to treat rice blast disease"}.

Available icons:
- BookOpen: For educational articles, training, guides.
- Sprout: For topics about plantation, crop growth, soil health.
- LineChart: For market trends, price forecasts, financial advice.
- Bug: For disease identification, pest control.
- Shield: For insurance, crop protection.
- Landmark: For government subsidies, schemes.

Example response for a user interested in "Rice" and "Disease":
{
  "recommendations": [
    {
      "text": "A comprehensive guide to identifying and treating common rice plant diseases.",
      "category": "Guide",
      "icon": "Bug",
      "type": "article",
      "payload": { "query": "identifying and treating common rice plant diseases" }
    },
    {
      "text": "Advanced techniques for improving rice yield in your region.",
      "category": "Article",
      "icon": "Sprout",
      "type": "article",
      "payload": { "query": "Advanced techniques for improving rice yield" }
    },
    {
      "text": "Price forecast: Rice market expected to see a 3% increase next month.",
      "category": "Market Intel",
      "icon": "LineChart",
      "type": "market_trend",
      "payload": { "crops": ["Rice"] }
    }
  ]
}

Return the response in the specified JSON format.
`,
});

const personalizedContentFlow = ai.defineFlow(
  {
    name: 'personalizedContentFlow',
    inputSchema: PersonalizedContentInputSchema,
    outputSchema: PersonalizedContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

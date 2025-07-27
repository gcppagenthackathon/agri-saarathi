
'use server';
/**
 * @fileOverview A flow for generating topics for the topic selection screen.
 *
 * - getTopics - A function that returns a list of topics.
 * - Topic - The type for a single topic object.
 * - GetTopicsOutput - The return type for the getTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TopicSchema = z.object({
    id: z.string().describe('A unique ID for the topic, in lowercase snake_case format (e.g., "plant_disease").'),
    label: z.string().describe('The display name of the topic (e.g., "Disease").'),
});

const GetTopicsOutputSchema = z.object({
  topics: z.array(TopicSchema).describe('An array of topic objects.'),
});
export type Topic = z.infer<typeof TopicSchema>;
export type GetTopicsOutput = z.infer<typeof GetTopicsOutputSchema>;

const staticTopics = [
    { id: 'plant_disease', label: 'Disease' },
    { id: 'plantation', label: 'Plantation' },
    { id: 'market_trends', label: 'Mkt.Trends' },
    { id: 'subsidy', label: 'Subsidy' },
    { id: 'agri_training', label: 'Training' },
    { id: 'insurance', label: 'Insurance' },
];

export async function getTopics(): Promise<GetTopicsOutput> {
  return topicFlow();
}

const topicFlow = ai.defineFlow(
  {
    name: 'topicFlow',
    outputSchema: GetTopicsOutputSchema,
  },
  async () => {
    return { topics: staticTopics };
  }
);

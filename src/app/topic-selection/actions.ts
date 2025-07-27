
'use server';

import { getTopics, GetTopicsOutput } from '@/ai/flows/topic-images';

export async function fetchTopics(): Promise<GetTopicsOutput | { error: string }> {
  try {
    const result = await getTopics();
    return result;
  } catch (e) {
    console.error(e);
    return { error: 'Failed to fetch topics. Please try again.' };
  }
}

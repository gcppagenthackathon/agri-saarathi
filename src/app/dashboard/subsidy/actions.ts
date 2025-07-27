
'use server';

import { getSubsidyInformation, GetSubsidyInformationOutput } from '@/ai/flows/subsidy-information-extraction';

export async function getSubsidyInfo(query: string): Promise<GetSubsidyInformationOutput | { error: string }> {
  try {
    if (!query) {
      return { error: 'Query must be provided.' };
    }
    const result = await getSubsidyInformation({ query });
    return result;
  } catch (e) {
    // console.error(e);
    return { error: 'Failed to get subsidy information. Please try again.' };
  }
}

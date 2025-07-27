
'use server';

import {
  verifyTreatmentProgress,
  VerifyTreatmentProgressInput as VerifyTreatmentProgressInputType,
  VerifyTreatmentProgressOutput as VerifyTreatmentProgressOutputype
} from '@/ai/flows/verify-treatment-progress';

export type VerifyTreatmentProgressInput = VerifyTreatmentProgressInputType;
export type VerifyTreatmentProgressOutput = VerifyTreatmentProgressOutputype;

export async function verifyProgress(
  input: VerifyTreatmentProgressInput
): Promise<VerifyTreatmentProgressOutput | {error: string}> {
  try {
    const result = await verifyTreatmentProgress(input);
    return result;
  } catch (e) {
    // console.error(e);
    return {error: 'Failed to verify progress. Please try again.'};
  }
}

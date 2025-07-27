
'use server';

import { getCropManagementPlan, CropManagementPlanOutput } from '@/ai/flows/crop-management-plan';

export async function fetchCropManagementPlan(cropName: string): Promise<CropManagementPlanOutput | { error: string }> {
  try {
    const result = await getCropManagementPlan({ cropName });
    return result;
  } catch (e) {
    // console.error(e);
    return { error: 'Failed to fetch crop management plan. Please try again.' };
  }
}

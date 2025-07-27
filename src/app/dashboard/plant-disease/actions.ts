
'use server';

import { textToSpeech, TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { verifyTreatmentProgress, VerifyTreatmentProgressInput, VerifyTreatmentProgressOutput } from '@/ai/flows/verify-treatment-progress';
import { identifyPlantDisease, IdentifyPlantDiseaseOutput, IdentifyPlantDiseaseInput } from '@/ai/flows/plant-disease-identification';


export async function analyzePlantDiseaseAction(input: IdentifyPlantDiseaseInput): Promise<IdentifyPlantDiseaseOutput | { error: string }> {
    try {
        const result = await identifyPlantDisease(input);
        return result;
    } catch (error: any) {
        // console.error('Error in analyzePlantDiseaseAction:', error);
        return { error: error.message || 'An unknown error occurred during analysis.' };
    }
}


export async function getVoiceGuide(text: string): Promise<TextToSpeechOutput | { error: string }> {
  try {
    if (!text) {
      return { error: 'Text is missing.' };
    }
    const result = await textToSpeech({ text, targetLanguage: 'en-US' });
    return result;
  } catch (e) {
    // console.error(e);
    return { error: 'Failed to generate voice guide. Please try again.' };
  }
}

export async function verifyProgress(input: VerifyTreatmentProgressInput): Promise<VerifyTreatmentProgressOutput | { error: string }> {
  try {
    const result = await verifyTreatmentProgress(input);
    return result;
  } catch (e) {
    // console.error(e);
    return { error: 'Failed to verify progress. Please try again.' };
  }
}

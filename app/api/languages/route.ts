import { NextResponse } from 'next/server';
import { getAllLanguages } from '@/lib/services/languageService';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/apiResponse';

export async function GET() {
  try {
    const languages = await getAllLanguages();
    return createSuccessResponse(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

import { NextResponse } from 'next/server';
import { getAllLanguages } from '@/lib/services/languageService';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const languages = await getAllLanguages();
    const response = createSuccessResponse(languages);
    // Disable caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('Error fetching languages:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

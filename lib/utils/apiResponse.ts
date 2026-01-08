import { NextResponse } from 'next/server';

export function createErrorResponse(
  error: string,
  status: number,
  fieldErrors?: Record<string, string>
) {
  if (fieldErrors) {
    return NextResponse.json(
      { error, fieldErrors },
      { status }
    );
  }
  return NextResponse.json(
    { error },
    { status }
  );
}

export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

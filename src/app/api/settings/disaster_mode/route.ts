import { NextResponse } from 'next/server';

let disasterMode = false;

export async function GET() {
  return NextResponse.json({
    setting_key: 'disaster_mode',
    setting_value: disasterMode ? 'true' : 'false',
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  disasterMode = body.setting_value === 'true';
  return NextResponse.json({
    setting_key: 'disaster_mode',
    setting_value: disasterMode ? 'true' : 'false',
  });
}
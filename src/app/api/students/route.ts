import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      id: '1',
      student_id: 'VSU-2024-001',
      name: 'Juan dela Cruz',
      current_status: 'SAFE',
      latitude: 10.7202,
      longitude: 124.7458,
      last_update_timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      student_id: 'VSU-2024-002',
      name: 'Maria Santos',
      current_status: 'NEEDS_ASSISTANCE',
      latitude: 10.7215,
      longitude: 124.7470,
      last_update_timestamp: new Date().toISOString(),
    },
    {
      id: '3',
      student_id: 'VSU-2024-003',
      name: 'Pedro Reyes',
      current_status: 'CRITICAL',
      latitude: 10.7190,
      longitude: 124.7445,
      last_update_timestamp: new Date().toISOString(),
    },
  ]);
}
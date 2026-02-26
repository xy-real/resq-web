import { NextResponse } from 'next/server';
import type { EvacuationCenter } from '@/types';

// Mock evacuation centers near VSU Baybay City
const MOCK_CENTERS: EvacuationCenter[] = [
  {
    id: '1',
    name: 'VSU Main Gymnasium',
    address: 'VSU Campus, Baybay City',
    capacity: 500,
    current_occupancy: 0,
    is_active: true,
    latitude: 10.7435,
    longitude: 124.7938,
  },
  {
    id: '2',
    name: 'Baybay City Sports Complex',
    address: 'Baybay City, Leyte',
    capacity: 800,
    current_occupancy: 0,
    is_active: true,
    latitude: 10.7398,
    longitude: 124.7901,
  },
  {
    id: '3',
    name: 'Upper Guadalupe Barangay Hall',
    address: 'Upper Guadalupe, Baybay City',
    capacity: 200,
    current_occupancy: 0,
    is_active: true,
    latitude: 10.7367,
    longitude: 124.7955,
  },
];

export async function GET() {
  return NextResponse.json(MOCK_CENTERS);
}
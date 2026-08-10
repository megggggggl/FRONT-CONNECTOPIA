export interface BusSchedule {
  day: string; // 'lunes' | 'martes' | ...
  departure: string; // '08:00'
  arrival: string; // '09:30'
}

export interface BusRoute {
  id: string;
  name: string;
  route_number: string;
  description: string;
  origin: string;
  destination: string;
  color: string;
  stops: BusStop[];
  schedules: BusSchedule[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  author?: { id: string; name: string };
}

export interface BusStop {
  id: string;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  } | null;
  address: string;
  city: string;
  zone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  order_index?: number;
}
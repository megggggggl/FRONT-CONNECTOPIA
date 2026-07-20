export interface BusStop {
  id: string;
  name: string;
  location: { type: 'Point'; coordinates: [number, number] };
  address: string | null;
  routes: string[];
  zone: string | null;
  city: string | null;
  is_active: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BusRoute {
  id: number;
  name: string;
  route_number: string;
  description?: string;
  color?: string;
  is_active: boolean;
  created_at?: string;
}

export interface BusStopRoute {
  bus_stop_id: string;
  route_id: number;
  order_index: number;
}
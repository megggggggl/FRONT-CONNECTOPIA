export interface Favorite {
  id:  string;
  profile_id: string;
  entity_type: 'service' | 'place' | 'event' | 'post';
  entity_id: string;
  created_at: string;
  // Datos de la entidad (dependiendo del tipo)
  entity?: any;
}
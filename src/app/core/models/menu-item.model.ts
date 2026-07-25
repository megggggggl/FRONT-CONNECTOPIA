export interface MenuItem {
  id: string;
  label: string;
  icon: string; // clase CSS (ej: 'bi-house', 'bi-person')
  route: string | string[];
  roles?: string[]; // roles que pueden verlo (si no se especifica, visible para todos)
  order?: number;
}
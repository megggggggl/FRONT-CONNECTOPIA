// menu-item.model.ts
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  roles?: string[];
  group?: string;         // para agrupar visualmente
  children?: MenuItem[];  // subitems
  expanded?: boolean;     // estado del acordeón
  order?: number;
  badge?: string;        // para mostrar un badge (ej: notificaciones)
}
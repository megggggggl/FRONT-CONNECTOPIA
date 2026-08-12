import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

type PlaceCategory = 'naturaleza' | 'recreacion' | 'cultura' | 'miradores' | 'comida' | 'eventos';
type PlaceOrder = 'normal' | 'rating' | 'nombre';

interface TouristPlace {
  id: number;
  name: string;
  category: PlaceCategory;
  location: string;
  rating: number;
  reviews: number;
  description: string;
  schedule: string;
  price: string;
  image: string;
}

@Component({
  selector: 'app-turismo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turismo.html',
  styleUrls: ['./turismo.css']
})
export class TurismoPageComponent {
  searchTerm = '';
  selectedCategory: 'todas' | PlaceCategory = 'todas';
  order: PlaceOrder = 'normal';
  onlyFavorites = false;
  showCreateModal = false;
  selectedPlace: TouristPlace | null = null;
  successMessage = '';
  favorites = new Set<number>();
  newPlace = { name: '', category: 'naturaleza' as PlaceCategory, location: '', image: '', description: '' };

  readonly categories: Array<{ value: PlaceCategory; label: string; description: string; icon: string }> = [
    { value: 'naturaleza', label: 'Naturaleza', description: 'Ríos, montañas y cascadas', icon: 'fa-leaf' },
    { value: 'recreacion', label: 'Recreación', description: 'Parques y deportes', icon: 'fa-person-running' },
    { value: 'cultura', label: 'Cultura', description: 'Museos e historia', icon: 'fa-landmark' },
    { value: 'miradores', label: 'Miradores', description: 'Vistas inolvidables', icon: 'fa-mountain-sun' },
    { value: 'comida', label: 'Gastronomía', description: 'Sabores locales', icon: 'fa-utensils' },
    { value: 'eventos', label: 'Eventos', description: 'Ferias y actividades', icon: 'fa-calendar-day' }
  ];

  places: TouristPlace[] = [
    { id: 1, name: 'Cascada La Esperanza', category: 'naturaleza', location: 'Valle Verde', rating: 4.8, reviews: 128, description: 'Hermosa cascada rodeada de naturaleza.', schedule: '8:00 AM - 5:00 PM', price: 'Gratis', image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=900&q=80' },
    { id: 2, name: 'Estadio Municipal', category: 'recreacion', location: 'Centro de la Ciudad', rating: 4.6, reviews: 95, description: 'Espacio para eventos deportivos y conciertos.', schedule: '7:00 AM - 9:00 PM', price: 'Gratis', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80' },
    { id: 3, name: 'Museo Municipal', category: 'cultura', location: 'Centro Histórico', rating: 4.7, reviews: 76, description: 'Historia y cultura de nuestra comunidad.', schedule: '9:00 AM - 4:00 PM', price: 'L. 30', image: 'https://images.unsplash.com/photo-1566127992631-137a642a90f4?auto=format&fit=crop&w=900&q=80' },
    { id: 4, name: 'Mirador del Cerro', category: 'miradores', location: 'Cerro Alto', rating: 4.9, reviews: 156, description: 'Vista panorámica de la ciudad.', schedule: '6:00 AM - 6:00 PM', price: 'Gratis', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80' },
    { id: 5, name: 'Parque Central', category: 'recreacion', location: 'Centro', rating: 4.5, reviews: 64, description: 'Lugar familiar para caminar y descansar.', schedule: 'Todo el día', price: 'Gratis', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' },
    { id: 6, name: 'Restaurante El Sabor', category: 'comida', location: 'Barrio El Centro', rating: 4.6, reviews: 89, description: 'Comida típica y ambiente familiar.', schedule: '10:00 AM - 10:00 PM', price: 'Desde L. 80', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80' }
  ];

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('connectopia-tourism-favorites');
      try { this.favorites = new Set<number>(saved ? JSON.parse(saved) : []); } catch { this.favorites = new Set<number>(); }
    }
  }

  get filteredPlaces(): TouristPlace[] {
    const query = this.searchTerm.trim().toLowerCase();
    const result = this.places.filter(place => {
      const text = `${place.name} ${place.location} ${place.description}`.toLowerCase();
      return (!query || text.includes(query))
        && (this.selectedCategory === 'todas' || place.category === this.selectedCategory)
        && (!this.onlyFavorites || this.favorites.has(place.id));
    });
    if (this.order === 'rating') return [...result].sort((a, b) => b.rating - a.rating);
    if (this.order === 'nombre') return [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }

  selectCategory(category: PlaceCategory): void {
    this.selectedCategory = this.selectedCategory === category ? 'todas' : category;
    this.onlyFavorites = false;
  }

  showAll(): void {
    this.searchTerm = ''; this.selectedCategory = 'todas'; this.order = 'normal'; this.onlyFavorites = false;
  }

  toggleFavorite(place: TouristPlace, event?: Event): void {
    event?.stopPropagation();
    this.favorites.has(place.id) ? this.favorites.delete(place.id) : this.favorites.add(place.id);
    if (isPlatformBrowser(this.platformId)) localStorage.setItem('connectopia-tourism-favorites', JSON.stringify([...this.favorites]));
  }

  createPlace(): void {
    const { name, category, location, image, description } = this.newPlace;
    if (!name.trim() || !location.trim() || !image.trim() || !description.trim()) return;
    this.places.unshift({ id: Date.now(), name: name.trim(), category, location: location.trim(), image: image.trim(), description: description.trim(), rating: 4, reviews: 0, schedule: 'Horario no disponible', price: 'No disponible' });
    this.newPlace = { name: '', category: 'naturaleza', location: '', image: '', description: '' };
    this.showCreateModal = false; this.showAll(); this.successMessage = 'Lugar agregado correctamente.';
    if (isPlatformBrowser(this.platformId)) window.setTimeout(() => this.successMessage = '', 2500);
  }

  categoryLabel(category: PlaceCategory): string {
    return this.categories.find(item => item.value === category)?.label || category;
  }

  mapsUrl(place: TouristPlace): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.location)}`;
  }
}

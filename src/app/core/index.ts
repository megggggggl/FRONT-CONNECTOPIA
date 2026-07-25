// ============================================================
// core/index.ts - Punto de entrada único para Core
// ============================================================

// ============================
// MODELS (Interfaces/Modelos)
// ============================
// Todos los modelos están en core/models/
export type { ApiResponse, ApiListResponse } from './models/api-response.model';
export type { User, UserResponse, PaginatedResponse } from './models/user.model';
export type { Service } from './models/service.model';
export type { Category } from './models/category.model';
export type { Event } from './models/event.model';
export type { Report } from './models/report.model';
export type { Post } from './models/post.model';
export type { Place } from './models/place.model';
export type { BusStop } from './models/bus-stop.model';
export type { Review } from './models/review.model';
export type { VerificationStatus, VerificationAttempt } from './models/verification.model';
// ============================
// SERVICES
// ============================
export * from './services/webServices';
export * from './services/auth.service';
export * from './services/profile.service';
export * from './services/service.service';
export * from './services/event.service';
export * from './services/report.service';
export * from './services/post.service';
export * from './services/category.service';
export * from './services/bus.service';
export * from './services/verification.service';
// (agrega otros servicios que necesites)

// ============================
// GUARDS
// ============================
export * from './guards/auth.guard';
export * from './guards/rol.guard';
export * from './guards/verified.guard';
export * from './guards/no-auth.guard';

// ============================
// INTERCEPTORS
// ============================
export * from './interceptors/auth.interceptor';

// ============================
// LAYOUTS (re-export desde layout/index.ts)
// ============================
export * from './layout';
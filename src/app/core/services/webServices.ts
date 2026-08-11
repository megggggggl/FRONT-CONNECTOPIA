import { environment } from '../../../environments/environment';


export class WebServices {
  private static readonly BASE_URL = environment.apiUrl;
  // ==================== AUTH ====================
  static readonly AuthLogin = `${WebServices.BASE_URL}/auth/login`;
  static readonly AuthRegister = `${WebServices.BASE_URL}/auth/register`;
  static readonly AuthLogout = `${WebServices.BASE_URL}/auth/logout`;
  static readonly AuthRefresh = `${WebServices.BASE_URL}/auth/refresh`;
  static readonly AuthMe = `${WebServices.BASE_URL}/auth/me`;

  // ==================== PROFILES ====================
  static readonly ProfilesList = `${WebServices.BASE_URL}/profiles`;
  static readonly ProfileGet = (id: number | string) => `${WebServices.BASE_URL}/profiles/${id}`;
  static readonly ProfileUpdate = (id: number | string) => `${WebServices.BASE_URL}/profiles/${id}`;
  static readonly ProfileDelete = (id: number | string) => `${WebServices.BASE_URL}/profiles/${id}`;
  static readonly ProfileChangeRole = (id: number | string) => `${WebServices.BASE_URL}/profiles/${id}/role`;
  static readonly ProfileToggleStatus = (id: number | string) => `${WebServices.BASE_URL}/profiles/${id}/status`;
  static readonly ProfileVerify = (id: number | string) => `${WebServices.BASE_URL}/profiles/${id}/verify`;
  static readonly ProfileVerificationStatus = (id: number | string) => `${WebServices.BASE_URL}/profiles/${id}/verification-status`;

  // ==================== CATEGORIES ====================
  static readonly CategoriesList = `${WebServices.BASE_URL}/categories`;
  static readonly CategoriesCreate = `${WebServices.BASE_URL}/categories`;
  static readonly CategoryGet = (id: number | string) => `${WebServices.BASE_URL}/categories/${id}`;
  static readonly CategoryUpdate = (id: number | string) => `${WebServices.BASE_URL}/categories/${id}`;
  static readonly CategoryDelete = (id: number | string) => `${WebServices.BASE_URL}/categories/${id}`;

  // ==================== POSTS ====================
  static readonly PostsList = `${WebServices.BASE_URL}/posts`;
static readonly PostsCreate = `${WebServices.BASE_URL}/posts`; 
  static readonly PostUpdate = (id: number | string) => `${WebServices.BASE_URL}/posts/${id}`;
  static readonly PostDelete = (id: number | string) => `${WebServices.BASE_URL}/posts/${id}`;

  // ==================== SERVICES ====================
  static readonly ServicesList = `${WebServices.BASE_URL}/services`;
  static readonly ServicesAppointmentOptions = `${WebServices.BASE_URL}/services/appointment-options`;
  static readonly ServicesCreate = `${WebServices.BASE_URL}/services`;
  static readonly ServiceGet = (id: number | string) => `${WebServices.BASE_URL}/services/${id}`;
  static readonly ServiceUpdate = (id: number | string) => `${WebServices.BASE_URL}/services/${id}`;
  static readonly ServiceDelete = (id: number | string) => `${WebServices.BASE_URL}/services/${id}`;
  static readonly ServiceReviewsList = (id: number | string) => `${WebServices.BASE_URL}/services/${id}/reviews`;

  // ==================== REVIEWS ====================
  static readonly ReviewsList = `${WebServices.BASE_URL}/reviews`;
  static readonly ReviewsCreate = `${WebServices.BASE_URL}/reviews`;
  static readonly ReviewGet = (id: number | string) => `${WebServices.BASE_URL}/reviews/${id}`;
  static readonly ReviewUpdate = (id: number | string) => `${WebServices.BASE_URL}/reviews/${id}`;
  static readonly ReviewDelete = (id: number | string) => `${WebServices.BASE_URL}/reviews/${id}`;

  // ==================== REPORTS ====================
  static readonly ReportsList = `${WebServices.BASE_URL}/reports`;
  static readonly ReportsCreate = `${WebServices.BASE_URL}/reports`;
  static readonly ReportGet = (id: number | string) => `${WebServices.BASE_URL}/reports/${id}`;
  static readonly ReportUpdate = (id: number | string) => `${WebServices.BASE_URL}/reports/${id}`;
  static readonly ReportDelete = (id: number | string) => `${WebServices.BASE_URL}/reports/${id}`;

  // ==================== EVENTS ====================

static readonly EventsList = `${WebServices.BASE_URL}/events`;
static readonly EventsCreate = `${WebServices.BASE_URL}/events`;
static readonly EventGet = (id: string) => `${WebServices.BASE_URL}/events/${id}`;
static readonly EventUpdate = (id: string) => `${WebServices.BASE_URL}/events/${id}`;
static readonly EventDelete = (id: string) => `${WebServices.BASE_URL}/events/${id}`;
static readonly EventParticipate = (id: string) => `${WebServices.BASE_URL}/events/${id}/participate`;
static readonly EventCancelParticipation = (id: string) => `${WebServices.BASE_URL}/events/${id}/participate`; // DELETE
static readonly EventsMine = `${WebServices.BASE_URL}/events/inscritos`; // 👈 NUEVO
  // ==================== ADMIN ====================
  static readonly AdminDashboard = `${WebServices.BASE_URL}/admin/dashboard`;
  static readonly AdminUsers = `${WebServices.BASE_URL}/admin/users`;
  static readonly AdminStats = `${WebServices.BASE_URL}/admin/stats`;
  static readonly AdminPosts = `${WebServices.BASE_URL}/admin/posts`;
static readonly VerificationPending = `${WebServices.BASE_URL}/verification/pending`;
static readonly VerificationApprove = (id: string) => `${WebServices.BASE_URL}/verification/approve/${id}`;
static readonly VerificationReject = (id: string) => `${WebServices.BASE_URL}/verification/reject/${id}`;
  // ==================== SETTINGS ====================
  static readonly SettingsList = `${WebServices.BASE_URL}/settings`;
  static readonly SettingsPublic = `${WebServices.BASE_URL}/settings/public`;
  static readonly SettingsGet = (key: string) => `${WebServices.BASE_URL}/settings/${key}`;
  static readonly SettingsCreate = `${WebServices.BASE_URL}/settings`;
  static readonly SettingsUpdate = (key: string) => `${WebServices.BASE_URL}/settings/${key}`;
  static readonly SettingsDelete = (key: string) => `${WebServices.BASE_URL}/settings/${key}`;

  // ==================== USER SETTINGS ====================
  static readonly UserSettingsGet = `${WebServices.BASE_URL}/user-settings`;
  static readonly UserSettingsUpdate = `${WebServices.BASE_URL}/user-settings`;
  static readonly UserSettingsDelete = (key: string) => `${WebServices.BASE_URL}/user-settings/${key}`;
  static readonly UserSettingsBulk = `${WebServices.BASE_URL}/user-settings/bulk`;

  // ==================== SEARCH ====================
  static readonly SearchGlobal = (query: string) => `${WebServices.BASE_URL}/search?q=${encodeURIComponent(query)}`;

  // ==================== STATS ====================
  static readonly StatsPosts = `${WebServices.BASE_URL}/stats/posts`;
  static readonly StatsUsers = `${WebServices.BASE_URL}/stats/users`;
  static readonly StatsCategories = `${WebServices.BASE_URL}/stats/categories`;
  static readonly StatsDashboard = `${WebServices.BASE_URL}/stats/dashboard`;
  static readonly StatsReports = `${WebServices.BASE_URL}/stats/reports`;

  // ==================== NOTIFICATIONS ====================
  static readonly NotificationsList = `${WebServices.BASE_URL}/notifications`;
  static readonly NotificationGet = (id: number | string) => `${WebServices.BASE_URL}/notifications/${id}`;
  static readonly NotificationRead = (id: number | string) => `${WebServices.BASE_URL}/notifications/${id}/read`;
  static readonly NotificationsReadAll = `${WebServices.BASE_URL}/notifications/read-all`;
  static readonly NotificationsUnreadCount = `${WebServices.BASE_URL}/notifications/unread-count`;

  // ==================== UPLOAD ====================
  static readonly UploadUrl = `${WebServices.BASE_URL}/upload/url`;
  static readonly UploadPublicUrl = `${WebServices.BASE_URL}/upload/public-url`;
  static readonly UploadDelete = `${WebServices.BASE_URL}/upload/file`;
  static readonly UploadList = `${WebServices.BASE_URL}/upload/list`;
// Bus Routes
static readonly BusRoutesList = `${WebServices.BASE_URL}/bus-routes`;
static readonly BusRoutesCreate = `${WebServices.BASE_URL}/bus-routes`;
static readonly BusRouteGet = (id: string) => `${WebServices.BASE_URL}/bus-routes/${id}`;
static readonly BusRouteUpdate = (id: string) => `${WebServices.BASE_URL}/bus-routes/${id}`;
static readonly BusRouteDelete = (id: string) => `${WebServices.BASE_URL}/bus-routes/${id}`;
// WebServices

static readonly ContentReportsList = `${WebServices.BASE_URL}/content-reports`;
static readonly ContentReportUpdate = (id: number) => `${WebServices.BASE_URL}/content-reports/${id}`;


static readonly BusStopsList = `${WebServices.BASE_URL}/bus-stops`;
static readonly BusStopsCreate = `${WebServices.BASE_URL}/bus-stops`;

// Bus Stop Routes
static readonly BusStopRoutesList = `${WebServices.BASE_URL}/bus-stop-routes`;
static readonly BusStopRoutesCreate = `${WebServices.BASE_URL}/bus-stop-routes`;
static readonly PlacesList = `${WebServices.BASE_URL}/places`;
static readonly PlacesCreate = `${WebServices.BASE_URL}/places`;
static readonly PlaceGet = (id: string) => `${WebServices.BASE_URL}/places/${id}`;
static readonly PlaceUpdate = (id: string) => `${WebServices.BASE_URL}/places/${id}`;
static readonly PlaceDelete = (id: string) => `${WebServices.BASE_URL}/places/${id}`;
  // ==================== COMMENTS ====================
  static readonly CommentsList = `${WebServices.BASE_URL}/comments`;
  static readonly CommentsCreate = `${WebServices.BASE_URL}/comments`;
  static readonly CommentGet = (id: number | string) => `${WebServices.BASE_URL}/comments/${id}`;
  static readonly CommentUpdate = (id: number | string) => `${WebServices.BASE_URL}/comments/${id}`;
  static readonly CommentDelete = (id: number | string) => `${WebServices.BASE_URL}/comments/${id}`;

  // ==================== REACTIONS ====================
  static readonly ReactionsList = `${WebServices.BASE_URL}/reactions`;
  static readonly ReactionsCreate = `${WebServices.BASE_URL}/reactions`;
  static readonly ReactionDelete = (id: number | string) => `${WebServices.BASE_URL}/reactions/${id}`;

  // ==================== FAVORITES ====================
  static readonly FavoritesList = `${WebServices.BASE_URL}/favorites`;
  static readonly FavoritesAdd = `${WebServices.BASE_URL}/favorites`;
  static readonly FavoritesRemove = (id: number | string) => `${WebServices.BASE_URL}/favorites/${id}`;

  // ==================== CONTENT REPORTS ====================
  static readonly ContentReprtsList = `${WebServices.BASE_URL}/content-reports`;
  static readonly ContentReportsCreate = `${WebServices.BASE_URL}/content-reports`;
  static readonly ContentReportGet = (id: number | string) => `${WebServices.BASE_URL}/content-reports/${id}`;
  static readonly ContentReportDelete = (id: number | string) => `${WebServices.BASE_URL}/content-reports/${id}`;

  // ==================== BOT ====================
  static readonly BotWebhook = `${WebServices.BASE_URL}/bot/webhook`;
  static readonly BotSendMessage = `${WebServices.BASE_URL}/bot/send`;
  static readonly BotStatus = `${WebServices.BASE_URL}/bot/status`;
  static readonly BotLinkToken = `${WebServices.BASE_URL}/bot/link-token`;
  static readonly BotAppointmentToken = `${WebServices.BASE_URL}/bot/appointment-token`;

  // ==================== APPOINTMENTS ====================
  static readonly AppointmentsMe = `${WebServices.BASE_URL}/appointments/me`;
  static readonly AppointmentsProvider = `${WebServices.BASE_URL}/appointments/provider`;
  static readonly AppointmentById = (id: number | string) => `${WebServices.BASE_URL}/appointments/${id}`;
  static readonly AppointmentStatus = (id: number | string) => `${WebServices.BASE_URL}/appointments/${id}/status`;
  static readonly AppointmentHistory = (id: number | string) => `${WebServices.BASE_URL}/appointments/${id}/history`;
  // ==================== VERIFICATION ====================
  // En WebServices (webServices.ts)
static readonly VerificationDocument = `${WebServices.BASE_URL}/verification/document`;
  static readonly VerificationStart = `${WebServices.BASE_URL}/verification/start`;
  static readonly VerificationStatus = `${WebServices.BASE_URL}/verification/status`;
  // ==================== HEALTH ====================
  static readonly Health = `${WebServices.BASE_URL}/health`;
}
export interface VerificationStatus {
  id_verified: boolean;
  id_verification_status: 'pendiente' | 'aprobado' | 'rechazado' | 'bloqueado';
  id_verification_notes?: string | null;
  id_verification_date?: string | null;
  verification_attempts: number;
  verification_blocked_until?: string | null;
  verification_block_count: number;
}

export interface VerificationAttempt {
  id: string;
  profile_id: string;
  attempt_type: 'document' | 'selfie' | 'biometric' | 'manual';
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
  created_at: string;
}
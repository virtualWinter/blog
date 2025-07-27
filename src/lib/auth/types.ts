// User role enum
export enum UserRole {
    DEFAULT = 'DEFAULT',
    ADMIN = 'ADMIN'
}

// User types
export interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    emailVerified: boolean;
    totpEnabled: boolean;
    emailOtpEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PublicUser {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    emailVerified: boolean;
    totpEnabled: boolean;
    emailOtpEnabled: boolean;
    createdAt: Date;    
}

// Session types
export interface SessionPayload {
    userId: string;
    email: string;
    role: UserRole;
    expiresAt: Date;
}

export interface Session {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}

// Token types
export interface VerificationToken {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}

export interface PasswordResetToken {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}

// Form data types
export interface SignUpFormData {
    email: string;
    password: string;
    name?: string;
    role?: UserRole;
}

export interface SignInFormData {
    email: string;
    password: string;
}

export interface ForgotPasswordFormData {
    email: string;
}

export interface ResetPasswordFormData {
    token: string;
    password: string;
}

// Server action response types
export interface AuthActionResult {
    success?: boolean;
    error?: string;
    message?: string;
}

export interface SignUpResult extends AuthActionResult {
    user?: PublicUser;
}

export interface SignInResult extends AuthActionResult {
    user?: PublicUser;
}

export interface ForgotPasswordResult extends AuthActionResult {}

export interface ResetPasswordResult extends AuthActionResult {}

export interface EmailVerificationResult extends AuthActionResult {}

// JWT payload type
export interface JWTPayload {
    userId: string;
    iat?: number;
    exp?: number;
}

// Auth configuration types
export interface AuthConfig {
    jwtSecret: string;
    sessionDuration: number;
    cookieName: string;
    passwordResetTokenExpiry: number;
    emailVerificationTokenExpiry: number;
}

// Middleware types
export interface AuthMiddlewareConfig {
    protectedRoutes: string[];
    authRoutes: string[];
    redirects: {
        signIn: string;
        afterSignIn: string;
        afterSignUp: string;
    };
}

// Password validation types
export interface PasswordRequirements {
    minLength: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
}

export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
}

// Database model types (matching Prisma schema)
export interface UserModel {
    id: string;
    email: string;
    password: string;
    name: string | null;
    role: UserRole;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    sessions: SessionModel[];
    verificationTokens: VerificationTokenModel[];
    passwordResetTokens: PasswordResetTokenModel[];
}

export interface SessionModel {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    user: UserModel;
}

export interface VerificationTokenModel {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    user: UserModel;
}

export interface PasswordResetTokenModel {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    user: UserModel;
}

// Role-based access control types
export interface RolePermissions {
    canAccessAdmin: boolean;
    canManageUsers: boolean;
    canDeletePosts: boolean;
    canModerateComments: boolean;
}

export interface AuthorizationResult {
    authorized: boolean;
    reason?: string;
}

// Role checking utilities
export type RequiredRole = UserRole | UserRole[];

export interface RoleGuardOptions {
    requiredRole: RequiredRole;
    allowSelf?: boolean; // Allow if user is accessing their own resource
    resourceUserId?: string; // ID of the resource owner
}

// TOTP types
export interface TOTPSetupData {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}

export interface TOTPVerificationData {
    token: string;
    backupCode?: string;
}

export interface TOTPSetupResult {
    success?: boolean;
    error?: string;
    setupData?: TOTPSetupData;
}

export interface TOTPVerificationResult {
    success: boolean;
    error?: string;
    requiresTOTP?: boolean;
}

export interface TOTPDisableResult {
    success?: boolean;
    error?: string;
}

// Enhanced form data types with 2FA
export interface SignInFormDataWith2FA extends SignInFormData {
    totpToken?: string;
    backupCode?: string;
    emailOtpToken?: string;
}

// Email OTP types
export interface EmailOtpResult {
    success?: boolean;
    error?: string;
}

export interface EmailOtpVerificationResult {
    success: boolean;
    error?: string;
    requiresEmailOtp?: boolean;
}

export interface EmailOtpToken {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}
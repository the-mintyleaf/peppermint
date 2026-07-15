/**
 * The two states of the auth-initiation screen:
 * - `intro`  — onboarding hero + "Continue with email" / magic-email actions.
 * - `email`  — revealed email + password fields.
 */
export type SignInPhase = "intro" | "email";

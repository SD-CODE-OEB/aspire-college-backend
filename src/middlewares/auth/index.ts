// Re-export all auth-related functions and utilities
export {
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  JWTPayload,
} from "./jwt-utils";

export { default as verifyJWT } from "./verify";
export { refreshTokenHandler } from "./refresh";

// Export verifyJWT as default for backward compatibility
export { default } from "./verify";

export interface RequestUser {
  userId: number;
  username: string;
  email: string;
}

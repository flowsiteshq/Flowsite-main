export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate Google OAuth login URL — replaces Manus OAuth entirely
export const getLoginUrl = (returnPath?: string) => {
  const origin = window.location.origin;
  const returnTo = returnPath ?? "/";
  const params = new URLSearchParams({
    origin,
    inviteToken: "",
    returnTo,
  });
  return `/api/auth/google?${params.toString()}`;
};

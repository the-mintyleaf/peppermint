import { useMutation } from "@peppermint/ui";
import api from "@/lib/api";
import { readCsrfHeader } from "@/lib/csrf";

/**
 * `POST /api/v1/auth/logout/` (bearer + double-submit CSRF header). Idempotent; the
 * server revokes the session and clears the refresh cookie. On settle we drop the
 * access token and return to sign-in.
 */
async function logoutRequest(): Promise<void> {
  await api.post("/api/v1/auth/logout/", undefined, {
    headers: readCsrfHeader(),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      }
    },
  });
}

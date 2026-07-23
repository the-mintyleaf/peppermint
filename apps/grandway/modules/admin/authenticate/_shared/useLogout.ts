import { useMutation } from "@peppermint/ui";
import api from "@/lib/api";
import { clearAuthTokens } from "@/lib/authTokens";

/**
 * `POST /api/v1/auth/logout/` — revokes the current session (API §7). Idempotent from
 * the client's perspective: whether the call succeeds or the token was already invalid,
 * we drop local tokens and return to sign-in.
 */
async function logoutRequest(): Promise<void> {
  await api.post("/api/v1/auth/logout/");
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearAuthTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    },
  });
}

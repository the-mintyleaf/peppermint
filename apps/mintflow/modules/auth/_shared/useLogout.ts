import { useMutation } from "@peppermint/ui";
import api from "@/lib/api";

async function logoutRequest(): Promise<void> {
  const refresh =
    typeof window !== "undefined"
      ? localStorage.getItem("refresh_token")
      : null;
  await api.post("/api/v1/auth/logout/", { refresh });
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutRequest,
    // Clear tokens and bounce to sign-in regardless of the request outcome — a
    // failed logout call must never trap the user in a half-signed-out state.
    onSettled: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/";
    },
  });
}

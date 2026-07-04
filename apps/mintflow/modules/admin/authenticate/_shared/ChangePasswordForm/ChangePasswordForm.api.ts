import api from "@/lib/api";

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<void> {
  await api.post("/api/v1/auth/change-password/", payload);
}

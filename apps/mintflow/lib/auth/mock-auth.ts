function createMockToken(payload: Record<string, unknown>) {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 86400,
      iat: Math.floor(Date.now() / 1000),
    }),
  ).toString("base64url");

  return `${header}.${body}.mock-signature`;
}

export function createMockAuthTokens(email: string) {
  const access = createMockToken({
    sub: "1",
    email,
    first_name: "Mint",
    last_name: "Flow",
  });

  const refresh = createMockToken({
    sub: "1",
    type: "refresh",
  });

  return { access, refresh };
}

export const mockUser = {
  id: 1,
  email: "user@mintflow.app",
  first_name: "Mint",
  last_name: "Flow",
  username: "mintflow",
  roles: ["admin"],
};

"use server";

let accessToken: string | null = null;
let tokenExpiry: number = 0; // epoch seconds

// Fallback values if .env is not set
const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_URL ?? "http://localhost:8080";
const REALM_NAME = process.env.KEYCLOAK_REALM ?? "master";
const ADMIN_USERNAME = process.env.KEYCLOAK_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD ?? "admin";
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID ?? "admin-cli";

export async function getAccessToken(): Promise<string> {
  const currentTime = Math.floor(Date.now() / 1000);

  // ✅ Return cached token if still valid
  if (accessToken && currentTime < tokenExpiry - 60) {
    return accessToken;
  }

  const tokenUrl = `${KEYCLOAK_BASE_URL}/realms/${REALM_NAME}/protocol/openid-connect/token`;

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("username", ADMIN_USERNAME);
  params.append("password", ADMIN_PASSWORD);
  params.append("grant_type", "password");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error("Keycloak token error response:", data);
    throw new Error("Failed to get Keycloak access token");
  }

  accessToken = data.access_token;
  tokenExpiry = currentTime + data.expires_in;

  return accessToken!;
}

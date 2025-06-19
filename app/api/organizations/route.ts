import { getOrganizationsFromKeycloak } from "@/lib/keycloakAdminOperations";
import { getAccessToken } from "@/lib/keycloakTokenManager";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  const organizations = await getOrganizationsFromKeycloak(token);
  return NextResponse.json(organizations);
}
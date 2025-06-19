import { getOrganizationFromKeycloak } from "@/lib/keycloakAdminOperations";
import { getAccessToken } from "@/lib/keycloakTokenManager";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAccessToken();
  const organization = await getOrganizationFromKeycloak(token, params.id);
  return NextResponse.json(organization);
}   
import { getOrganizationFromKeycloak } from "@/lib/keycloakAdminOperations";
import { getAccessToken } from "@/lib/keycloakTokenManager";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getAccessToken();
  const { id } = await params;
  const organization = await getOrganizationFromKeycloak(token, id);
  return NextResponse.json(organization);
}   
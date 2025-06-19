import { getAccessToken } from "@/lib/keycloakTokenManager";
import { getOrganisationNameFromEmail } from "@/lib/getOrganisationFromEmail";
import { type NextRequest, NextResponse } from "next/server";
import {
  createClientInKeycloak,
  createOrganizationInKeycloak,
  isOrganizationEnabled
} from "@/lib/keycloakAdminOperations";

export async function POST(request: NextRequest) {
  let email: string;
  let organizationName: string;
  let accessToken: string;

  // 🔍 Step 1: Parse + Validate Email
  try {
    const body = await request.json();
    email = body.email;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error parsing request body or validating email:", error);
    return NextResponse.json({ error: "Invalid request body or email" }, { status: 400 });
  }

  // 🏢 Step 2: Extract Organization Name
  try {
    organizationName = getOrganisationNameFromEmail(email);
    if (!organizationName) {
      return NextResponse.json({ error: "Could not extract organization from email" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error extracting organization from email:", error);
    return NextResponse.json({ error: "Failed to extract organization from email" }, { status: 400 });
  }

  // 🔐 Step 3: Get Admin Access Token
  try {
    accessToken = await getAccessToken();
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
  }

  // 🧠 Step 4: Check if Organizations Feature is Enabled
  try {
    const isOrgEnabled = await isOrganizationEnabled(accessToken);
    if (!isOrgEnabled) {
      return NextResponse.json({ error: "Organization feature is not enabled in this Keycloak realm" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error checking if organization is enabled:", error);
    return NextResponse.json({ error: "Failed to check organization status" }, { status: 500 });
  }

  // 🏗️ Step 5: Create Organization + Client
  try {
    const organization = await createOrganizationInKeycloak(accessToken, organizationName, email);
    console.log("organization created:", organization);

    const client = await createClientInKeycloak(accessToken, organizationName);
    console.log("client created:", client);

    return NextResponse.json({
      message: "Organization and client created successfully",
      organization,
      client
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating organization or client:", error);
    return NextResponse.json({ error: "Failed to create organization or client" }, { status: 500 });
  }
}

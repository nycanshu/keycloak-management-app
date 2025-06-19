import { getAccessToken } from "@/lib/keycloakTokenManager"
import { getOrganisationNameFromEmail } from "@/lib/getOrganisationFromEmail"
import { type NextRequest, NextResponse } from "next/server"
import { createClientInKeycloak, createOrganizationInKeycloak, isOrganizationEnabled } from "@/lib/keycloakAdminOperations"

export async function POST(request: NextRequest) {
  let email: string;
  let organizationName: string;
  let accessToken: string;

  try {
    // Parse and validate email
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

  try {
    // Extract organization name
    organizationName = getOrganisationNameFromEmail(email);
    if (!organizationName) {
      return NextResponse.json({ error: "Could not extract organization from email" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error extracting organization from email:", error);
    return NextResponse.json({ error: "Failed to extract organization from email" }, { status: 400 });
  }

  try {
    // Get access token
    accessToken = await getAccessToken();
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
  }

  try {
    // Check if organization is enabled
    const isOrgEnabled = await isOrganizationEnabled(accessToken);
    if (isOrgEnabled) {
      try {
        // Create organization
        const organization = await createOrganizationInKeycloak(accessToken, organizationName);
        console.log("organization", organization);

        // Create client in organization
        const client = await createClientInKeycloak(accessToken, organizationName);
        console.log("client", client);
      } catch (error) {
        console.error("Error creating organization or client:", error);
        return NextResponse.json({ error: "Failed to create organization or client" }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("Error checking if organization is enabled:", error);
    return NextResponse.json({ error: "Failed to check organization status" }, { status: 500 });
  }

  // Success response
  return NextResponse.json(
    { message: "User created successfully", organizationName },
    { status: 201 }
  );
}


import { getAccessToken } from "@/lib/keycloakTokenManager"
import { getOrganisationNameFromEmail } from "@/lib/getOrganisationFromEmail"
import { type NextRequest, NextResponse } from "next/server"
import { createClientInKeycloak, createOrganizationInKeycloak, isOrganizationEnabled, getOrganizationsFromKeycloak, createUserInKeycloak, addUserToOrganization, getOrganizationFromKeycloak, inviteUserToOrganization, assignClientRoleToUser } from "@/lib/keycloakAdminOperations"

export async function POST(request: NextRequest) {
  let email: string;
  let organizationName: string;
  let accessToken: string;

  let firstName: string;
  let lastName: string;
  let password: string;
  let isOwner = false;

  // Step 1: Parse + Validate Email
  try {
    const body = await request.json();
    email = body.email;
    firstName = body.firstName;
    lastName = body.lastName;
    password = body.password;

    

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error parsing request body or validating email:", error);
    return NextResponse.json({ success: false, message: "Invalid request body or email" }, { status: 400 });
  }

  // Step 2: Extract Organization Name
  try {
    organizationName = getOrganisationNameFromEmail(email);
    if (!organizationName) {
      return NextResponse.json({ success: false, message: "Could not extract organization from email" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error extracting organization from email:", error);
    return NextResponse.json({ success: false, message: "Failed to extract organization from email" }, { status: 400 });
  }

  // Step 3: Get Admin Access Token
  try {
    accessToken = await getAccessToken();
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json({ success: false, message: "Failed to get access token" }, { status: 500 });
  }

  // Step 4: Check if Organizations Feature is Enabled
  try {
    const isOrgEnabled = await isOrganizationEnabled(accessToken);
    if (!isOrgEnabled) {
      return NextResponse.json({ success: false, message: "Organization feature is not enabled in this Keycloak realm" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error checking if organization is enabled:", error);
    return NextResponse.json({ success: false, message: "Failed to check organization status" }, { status: 500 });
  }

  // Step 5: Create Organization + Client
  try {
    const organization = await createOrganizationInKeycloak(accessToken, organizationName, email);
    console.log("organization created:", organization);


    const client = await createClientInKeycloak(accessToken, organizationName);
    console.log("client created:", client);

    let userData: any;
    let isEmailSent = false;
    try {
      userData = await createUserInKeycloak(accessToken, email, firstName, lastName, password);
      console.log("user created:", userData);


      //add user to organization
      if (organization.isExisingOrganization) {
        const isEmailSentToUser = await inviteUserToOrganization(accessToken, organization.id, userData.user.id);
        isEmailSent = isEmailSentToUser.success;
        console.log("email sent to user:", isEmailSentToUser);
      } else {
        const isAdded = await addUserToOrganization(accessToken, organization.id, userData.user.id);
        console.log("user added to organization:", isAdded);

        const OwnerRole = client.roles.find((role: any) => role.name === "owner");
        if (OwnerRole) {
        await assignClientRoleToUser({
          userId: userData.user.id,
            clientUUID: client.clientUUID,
            roles: [OwnerRole]
          });
          isOwner = true;
        }
      }
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 });
    }

    // Clean objects to avoid circular references
    const cleanOrganization = {
      id: organization.id,
      name: organization.name,
      isExisingOrganization: organization.isExisingOrganization,
      isEmailSent: isEmailSent,
      
      // Add other relevant fields
    };

    const cleanClient = {
      clientUUID: client.clientUUID,
      clientId: client.clientId,
      name: client.name,
      // Add other relevant fields
    };

    const cleanClientRoles = {
      
      clientId: client.clientId,
      roles: client.roles,
      // Add other relevant fields
    };

    const cleanUser = {
      id: userData.user.id,
      email: userData.user.email,
      username: userData.user.username,
      firstName: userData.user.firstName,
      lastName: userData.user.lastName,
      enabled: userData.user.enabled,
      emailVerified: userData.user.emailVerified,
      credentials: userData.user.credentials,
      isOwner: isOwner,
      // Add other relevant fields
    };

    return NextResponse.json({
      success: true,
      message: "Organization and client created successfully and user created successfully",
      organization: cleanOrganization,
      client: cleanClient,
      clientRoles: cleanClientRoles,
      user: cleanUser,

    }, { status: 201 });

  } catch (error) {
    console.error("Error creating organization or client:", error);
    return NextResponse.json({ success: false, message: "Failed to create organization or client" }, { status: 500 });
  }
}
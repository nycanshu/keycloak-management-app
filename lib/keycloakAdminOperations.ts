import axios from "axios"
import { getAccessToken } from "./keycloakTokenManager";


type Organization = {

    name: string;
    alias: string;
    description: string;
    redirectUrl: string;
    domains: {
        name: string;
        verified: boolean;
    }[];
    attributes: Record<string, any>;
}

type Client = {
    clientId: string;
    name: string;
    description: string;
    rootUrl: string;
    baseUrl: string;
    protocol: string;
    publicClient: boolean;
    redirectUris: string[];
    webOrigins: string[];
    standardFlowEnabled: boolean;
    implicitFlowEnabled: boolean;
    directAccessGrantsEnabled: boolean;
    serviceAccountsEnabled: boolean;
    frontchannelLogout: boolean;
    attributes: {
        "oidc.ciba.grant.enabled": string;
        "oauth2.device.authorization.grant.enabled": string;
        "display.on.consent.screen": string;
        "backchannel.logout.session.required": string;
        "post.logout.redirect.uris": string;
        [key: string]: string;
    };
    defaultClientScopes: string[];
    optionalClientScopes: string[];
}





// get data from env
const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? "http://localhost:8080"
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM ?? "test123"


//is organization enabled in keycloak for that realm
export async function isOrganizationEnabled(token: string): Promise<boolean> {
    try {
        const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/organizations`;
        const response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        // If it returns 200, then organization is enabled
        return response.status === 200;
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.error("Organizations feature is not enabled in this Keycloak realm");
            return false;
        }
        console.error("Unexpected error checking organization feature:", error.message);
        throw error;
    }
}
//for creating organization in keycloak and return the organization object
export async function createOrganizationInKeycloak(
    token: string,
    orgName: string,
    email?: string
): Promise<{ id: string; name: string; isExisingOrganization: boolean }> {
    try {
        //check if organization already exists
        console.log('Creating Keycloak organization:', orgName);

        const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/organizations`;
        const emailDomain = email ? email.split('@')[1] : orgName + ".com";

        const payload = {
            name: orgName,
            alias: orgName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            description: "",
            redirectUrl: `https://${orgName}.com`,
            domains: [
                {
                    name: emailDomain,
                    verified: false
                }
            ],
            attributes: {}
        };

        console.log('Organization payload:', JSON.stringify(payload, null, 2));

        // Create organization
        await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });




        // Fetch the created organization by name
        const getOrgUrl = `${url}?search=${encodeURIComponent(orgName)}`;
        const getOrgResponse = await axios.get(getOrgUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const createdOrg = getOrgResponse.data?.[0];
        if (!createdOrg) {
            throw new Error('Created organization not found in search results');
        }

        console.log('Successfully created organization:', {
            id: createdOrg.id,
            name: createdOrg.name
        });

        return {
            id: createdOrg.id,
            name: createdOrg.name,
            isExisingOrganization: false
        };

    } catch (error: any) {
        console.error('Failed to create Keycloak organization:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url,
            method: error.config?.method,
            requestData: error.config?.data
        });

        if (error.response?.status === 409) {
            //organization already exists so add user to organization
            const organizations = await getOrganizationsFromKeycloak(token);
            const organization = organizations.find((org: any) => org.name === orgName);
            if (organization) {
                return {
                    id: organization.id,
                    name: organization.name,
                    isExisingOrganization: true,
                    
                }
            }
            else{
                throw new Error('Organization not found');
            }



        } else if (error.response?.status === 403) {
            throw new Error('Insufficient permissions to create organization in Keycloak');
        } else if (error.response?.status === 404) {
            throw new Error('Organizations feature may not be enabled in this Keycloak realm');
        }

        throw new Error(
            `Failed to create organization in Keycloak: ${error.response?.data?.errorMessage || error.response?.data?.error || error.message
            }`
        );
    }
}



// create client in organization and return the client object
export async function createClientInKeycloak(token: string, organization: string) {
    try {
        console.log('Creating Keycloak client for organization:', organization);

        const clientId = `client-${organization.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const clientName = `${organization} Client`;

        const payload = {
            clientId,
            name: clientName,
            description: "",
            rootUrl: `https://${organization}.com`,
            baseUrl: `https://${organization}.com`,
            protocol: "openid-connect",
            publicClient: false,
            redirectUris: [
                "https://key-dev.centralindia.cloudapp.azure.com/*",
                process.env.NEXT_PUBLIC_BASE_URL + "/*",
                process.env.NEXT_PUBLIC_BASE_URL + "/api/auth/callback",
                "http://localhost:3002/*",
                "http://localhost:3002/api/auth/callback",
                "https://iaas-userportal-app-dev.ambitioussand-8a5710a2.centralindia.azurecontainerapps.io/*",
                "https://iaas-userportal-app-dev.ambitioussand-8a5710a2.centralindia.azurecontainerapps.io/api/auth/callback"
            ],
            webOrigins: [
                process.env.NEXT_PUBLIC_BASE_URL,
                "http://localhost:3002/*",
                "https://iaas-userportal-app-dev.ambitioussand-8a5710a2.centralindia.azurecontainerapps.io/*"
            ],
            standardFlowEnabled: true,
            implicitFlowEnabled: false,
            directAccessGrantsEnabled: true,
            serviceAccountsEnabled: true,
            frontchannelLogout: true,
            attributes: {
                "oidc.ciba.grant.enabled": "false",
                "oauth2.device.authorization.grant.enabled": "true",
                "display.on.consent.screen": "false",
                "backchannel.logout.session.required": "true",
                "post.logout.redirect.uris":
                    process.env.NEXT_PUBLIC_BASE_URL + "/*## " +
                    process.env.NEXT_PUBLIC_BASE_URL + "/signin## http://localhost:3002/*## http://localhost:3002/signin## https://iaas-userportal-app-dev.ambitioussand-8a5710a2.centralindia.azurecontainerapps.io/*## https://iaas-userportal-app-dev.ambitioussand-8a5710a2.centralindia.azurecontainerapps.io/signin##"
            },
            defaultClientScopes: ["web-origins", "acr", "profile", "roles", "basic", "email"],
            optionalClientScopes: ["address", "phone", "offline_access", "microprofile-jwt"]
        };

        // Check if client already exists
        const checkUrl = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients`;
        const existing = await axios.get(checkUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: {
                clientId: clientId
            }
        });

        let clientUUID: string;

        if (existing.data && existing.data.length > 0) {
            clientUUID = existing.data[0].id;
            console.log('Client already exists:', { clientId, clientUUID });
        } else {
            const createUrl = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients`;
            const createResponse = await axios.post(createUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Get UUID from location header
            const location = createResponse.headers.location;
            clientUUID = location?.split('/').pop();
            console.log('New client created:', { clientId, clientUUID });
        }

        // Get client secret
        const secretUrl = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${clientUUID}/client-secret`;
        const secretResponse = await axios.get(secretUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const clientSecret = secretResponse.data?.value;

        // Create roles
        const clientRoles = await createClientRolesInKeycloak(token, clientUUID);

        return {
            clientId,
            clientUUID,
            clientSecret,
            name: clientName,
            roles: clientRoles
        };
    } catch (error: any) {
        console.error("Failed to create client in Keycloak:", {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data
        });
        throw error;
    }
}


//create client roles in keycloak
export async function createClientRolesInKeycloak(token: string, clientId: string) {
    try {
        console.log('Creating client roles for client:', clientId);

        const roles = [
            { name: 'owner', description: 'Organization owner with full access' },
            { name: 'developer', description: 'Developer with write access' },
            { name: 'reader', description: 'Reader with read-only access' }
        ];

        const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${clientId}/roles`;
        const createdRoles = [];

        for (const role of roles) {
            console.log(`Processing role: ${role.name}`);

            const roleUrl = `${url}/${role.name}`;

            try {
                // Check if the role already exists
                const existingRoleResponse = await axios.get(roleUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                console.log(`Role ${role.name} already exists.`);
                createdRoles.push({
                    name: role.name,
                    id: existingRoleResponse.data.id,
                    description: existingRoleResponse.data.description
                });

            } catch (error: any) {
                if (error.response?.status === 404) {
                    // Role doesn't exist, so create it
                    console.log(`Creating role: ${role.name}`);
                    await axios.post(url, role, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    // Fetch the created role's details
                    const roleResponse = await axios.get(roleUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    });

                    createdRoles.push({
                        name: role.name,
                        id: roleResponse.data.id,
                        description: role.description
                    });
                } else {
                    console.error(`Error while checking/creating role ${role.name}:`, error.message);
                    throw error;
                }
            }
        }

        console.log('All roles processed successfully:', createdRoles);
        return createdRoles;

    } catch (error: any) {
        console.error('Failed to create client roles:', error.message);
        throw error;
    }
}


//create user in keycloak
export async function createUserInKeycloak(token: string, email: string, firstName: string, lastName: string, password: string) {
    const baseUrl = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`;

    try {
        // Step 1: Check if user exists by email (exact match)
        const checkUrl = `${baseUrl}?email=${encodeURIComponent(email)}&exact=true`;
        const checkResponse = await axios.get(checkUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (Array.isArray(checkResponse.data) && checkResponse.data.length > 0) {
            console.log("✅ User already exists:", checkResponse.data[0].username);
            return {
                exists: true,
                user: checkResponse.data[0],
            };
        }

        // Step 2: Create user (email is required, others optional)
        const payload = {
            username: email,
            email,
            firstName: firstName,
            lastName: lastName,
            enabled: true,
            emailVerified: true,
            credentials: [
                {
                    type: "password",
                    value: password,
                    temporary: true,
                },
            ],
        };

        const createResponse = await axios.post(baseUrl, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (createResponse.status === 201) {
            console.log("✅ User created successfully");
            console.log("createResponse", createResponse);
            const locationHeader = createResponse.headers.location;
            const userId = locationHeader.split('/').pop();

            // Now fetch the user details
            const userDetailsResponse = await axios.get(
                `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}`,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );

            return { user: userDetailsResponse.data };
        }

        throw new Error(`Unexpected status ${createResponse.status} while creating user`);
    } catch (error: any) {
        if (error.response?.status === 409) {
            console.warn("⚠️ User already exists (409 Conflict)");
            return {
                exists: true,
                user: null,
            };
        }

        console.error("❌ Failed to create/check user:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });

        throw new Error(`Keycloak error: ${error.response?.data?.errorMessage || error.message}`);
    }
}




// // invite user to organization /admin/realms/{realm}/organizations/{org-id}/members/invite-user
// export async function inviteUserToOrganization(token: string, organizationId: string, userId: string) {
//     const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/organizations/${organizationId}/members`;
//     const response = await axios.post(url, {
//         userId: userId
//     }, {
//         headers: {  
//             "Authorization": `Bearer ${token}`
//         }
//     })
//     return response.data
// }



//get user from keycloak
export async function getUserFromKeycloak(token: string, email: string) {
    const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users?email=${email}&exact=true`;
    const response = await axios.get(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    return response.data
}



//add user to organization
export async function addUserToOrganization(token: string, organizationId: string, userId: string): Promise<boolean> {

    // Construct the Keycloak API URL
    const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/organizations/${organizationId}/members`;

    try {
        console.log("Adding user to organization:", organizationId, userId);
            // The API expects the user ID as a string, not as a JSON string.
        // If you want to invite by email (for a user that does not exist), use the /members/invite-user endpoint with { email: "user@example.com" }
        const trimmerUserId = userId.trim();
        const response = await axios.post(url, JSON.stringify(trimmerUserId), {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // 2. Handle successful response (HTTP 201 Created)
        if (response.status === 201) {
            console.log(`[Keycloak API] Successfully added user "${userId}" to organization "${organizationId}".`);
            return true;
        } else {
            // This branch should ideally not be reached if Axios correctly throws for non-2xx responses.
            // However, as a safeguard, log unexpected successful status codes.
            console.warn(`[Keycloak API] Unexpected successful status code ${response.status} when adding user to organization. Response data:`, response.data);
            return true; // Still consider it a success if Keycloak returns a 2xx code.
        }

    } catch (error) {
        // 3. Enhanced Error Handling for production level
        if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            const errorMessage = data?.errorMessage || data?.error || JSON.stringify(data);

            console.error(`[Keycloak API Error] Failed to add user "${userId}" to organization "${organizationId}". Status: ${status}, Details:`, errorMessage);

            switch (status) {
                case 400: // Bad Request - e.g., malformed UUIDs
                    throw new Error(`Keycloak Error 400 (Bad Request): The provided user ID or organization ID is invalid. Details: ${errorMessage}`);
                case 401: // Unauthorized - Invalid or expired token
                    throw new Error('Keycloak Error 401 (Unauthorized): Invalid or expired access token. Please ensure your token is valid and active.');
                case 403: // Forbidden - Insufficient permissions for the admin token
                    throw new Error('Keycloak Error 403 (Forbidden): Insufficient permissions to add a user to this organization. Check admin role assignments.');
                case 404: // Not Found - Realm, organization, or user does not exist
                    throw new Error(`Keycloak Error 404 (Not Found): One of the resources (realm, organization "${organizationId}", or user "${userId}") was not found.`);
                case 409: // Conflict - User is already a member of the organization
                    console.warn(`[Keycloak API] User "${userId}" is already a member of organization "${organizationId}". Skipping addition.`);
                    return true; // Treat as success if user is already a member, as the desired state is achieved.
                default:
                    throw new Error(`Keycloak API Error (${status}): An unexpected error occurred. Details: ${errorMessage}`);
            }
        } else {
            // Handle non-Axios or network errors
            console.error(`[Network/Unexpected Error] An unexpected error occurred while adding user "${userId}" to organization "${organizationId}":`, error);
            throw new Error(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}



export async function assignClientRoleToUser({
    userId,
    clientUUID,
    roles,
  }: {
    userId: string;
    clientUUID: string;
    roles: { id: string; name: string }[];
  }): Promise<{ success: boolean; message: string }> {
    try {
      const accessToken = await getAccessToken();
      const response = await axios.post(
        `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/role-mappings/clients/${clientUUID}`,
        roles,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          validateStatus: () => true, // Prevent axios from throwing on non-2xx
        }
      );
  
      if (response.status === 204) {
        return { success: true, message: "Role(s) assigned successfully." };
      } else {
        return {
          success: false,
          message:
            response.data?.errorMessage ||
            response.data?.error ||
            "Failed to assign roles.",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.error || error.message || "Unknown error",
      };
    }
  }
  
  



  export async function inviteUserToOrganization(token: string, organizationId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/organizations/${organizationId}/members/invite-existing-user`;

    // Keycloak expects the userId as a form parameter named 'id'.
    const formData = new URLSearchParams();
    formData.append('id', userId);

    try {
        const response = await axios.post(url, formData.toString(), {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        // According to Keycloak docs, a successful invitation returns 204 No Content.
        if (response.status === 204) {
            return { success: true, message: "User invited successfully." };
        } else {
            // This case should ideally not be hit for a successful request
            return { success: false, message: `Unexpected response status: ${response.status}. User might not be invited.` };
        }
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status;
            const errorMessage = error.response?.data?.errorMessage || error.message;

            console.error(`Error inviting user ${userId} to organization ${organizationId}: Status ${statusCode}, Message: ${errorMessage}`, error.response?.data);

            if (statusCode === 400) {
                return { success: false, message: `Bad Request: ${errorMessage}. Check if user ID is valid or if user is already a member.` };
            } else if (statusCode === 401 || statusCode === 403) {
                return { success: false, message: `Authorization Error: You don't have permission to perform this action.` };
            } else if (statusCode === 404) {
                return { success: false, message: `Not Found: Organization or user ID might be incorrect.` };
            } else if (statusCode === 500) {
                return { success: false, message: `Internal Server Error: Keycloak encountered an error. ${errorMessage}` };
            } else {
                return { success: false, message: `Failed to invite user: ${errorMessage} (Status: ${statusCode || 'Unknown'})` };
            }
        } else {
            console.error(`An unexpected error occurred while inviting user ${userId}:`, error);
            return { success: false, message: "An unknown error occurred while trying to invite the user." };
        }
    }
}









export async function getOrganizationsFromKeycloak(token: string) {
    const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/organizations`;
    const response = await axios.get(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    return response.data
}

export async function getOrganizationFromKeycloak(token: string, organizationId: string) {
    const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/organizations/${organizationId}/members`;
    const response = await axios.get(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    return response.data
}









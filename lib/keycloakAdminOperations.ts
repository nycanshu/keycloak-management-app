import axios from "axios"


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
  ): Promise<{ id: string; name: string }> {
    try {
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
        name: createdOrg.name
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
        throw new Error(`Organization '${orgName}' already exists in Keycloak`);
      } else if (error.response?.status === 403) {
        throw new Error('Insufficient permissions to create organization in Keycloak');
      } else if (error.response?.status === 404) {
        throw new Error('Organizations feature may not be enabled in this Keycloak realm');
      }
  
      throw new Error(
        `Failed to create organization in Keycloak: ${
          error.response?.data?.errorMessage || error.response?.data?.error || error.message
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









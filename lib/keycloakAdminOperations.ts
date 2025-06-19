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
//for creating organization in keycloak
export async function createOrganizationInKeycloak(token: string, organization: string) : Promise<Organization>{

    try {
        const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/organizations`

        const payload = {
            name: organization,
            domains: [{ name: organization, verified: true }],
            attributes: {},
            redirectUrl: "https://" + organization + ".com",
            alias: organization,
            description: ""
        }

        const response = await axios.post(url, payload, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        return response.data
    } catch (error) {
        console.error("Error creating organization:", error)
        throw error
    }
}



// create client in organization                
export async function createClientInKeycloak(token: string, organization: string){
    try {
        const url = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients`

        const payload = {
            clientId: "client-" + organization,
            name: "client-" + organization,
            description: "",
            rootUrl: "https://" + organization + ".com",
            baseUrl: "https://" + organization + ".com",
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
              "https://iaas-userportal-app-dev.ambitioussand-8a5710a2.centralindia.azurecontainerapps.io/*",
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
              "post.logout.redirect.uris": process.env.NEXT_PUBLIC_BASE_URL + "/*## " + process.env.NEXT_PUBLIC_BASE_URL + "/signin## http://localhost:3002/*## http://localhost:3002/signin## https://iaas-userportal-app-dev.ambitioussand-8a5710a2.centralindia.azurecontainerapps.io/*## https://iaas-userportal-app-dev.ambitioussand-8a5710a2.centralindia.azurecontainerapps.io/signin##"
            },
            defaultClientScopes: [
              "web-origins",
              "acr",
              "profile",
              "roles",
              "basic",
              "email"
            ],
            optionalClientScopes: [
              "address",
              "phone",
              "offline_access",
              "microprofile-jwt"
            ]
          };
       

        const response = await axios.post(url, payload, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })  
        return response.data
    } catch (error) {
        console.error("Error creating client:", error)
        throw error
    }
}

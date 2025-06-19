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


export function getOrganisationFromEmail(email: string) {
    if (!email || typeof email !== 'string') {
      throw new Error("Invalid email");
    }
  
    const parts = email.split('@');
    if (parts.length !== 2) {
      throw new Error("Invalid email format");
    }
  
    const fullDomain = parts[1]; // e.g., "veltech.edu.in" or "sub.veltech.edu.in"
    const domainParts = fullDomain.split('.');
  
    // Extract second-level domain (like "veltech" from "veltech.edu.in")
    const orgName = domainParts.length >= 2
      ? domainParts[domainParts.length - 3] // e.g., "veltech"
      : domainParts[0];
  
    return orgName.toLowerCase()
  }
  
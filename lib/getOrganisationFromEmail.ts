
export function getOrganisationNameFromEmail(email: string) {
    if (!email || typeof email !== 'string') {
      throw new Error("Invalid email");
    }
  
    const parts = email.split('@');
    if (parts.length !== 2) {
      throw new Error("Invalid email format");
    }
  
    const fullDomain = parts[1];
    const domainParts = fullDomain.split('.');
  
    return domainParts[0].toLowerCase()
  }
  
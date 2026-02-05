// Email validation for FAST University emails
// Format 1: [campus-code][batch-2digits][rollno-4digits]@nu.edu.pk (e.g., k230832@nu.edu.pk)
// Format 2: [campus-code][batch-2digits][rollno-4digits]@[campus-code].nu.edu.pk (e.g., l230556@lhr.nu.edu.pk)
// Campus codes: k=Karachi, i=Islamabad, l=Lahore, p=Peshawar, m=Multan, f=Faisalabad

export const CAMPUS_CODES = {
  k: 'Karachi',
  i: 'Islamabad',
  l: 'Lahore',
  p: 'Peshawar',
  m: 'Multan',
  f: 'Faisalabad'
} as const;

// Domain mappings for different campus email formats
export const CAMPUS_DOMAINS: Record<CampusCode, string[]> = {
  k: ['khi', 'karachi'],
  i: ['isb', 'islamabad'],
  l: ['lhr', 'lahore'],
  p: ['pwr', 'peshawar'],
  m: ['mtn', 'multan'],
  f: ['fsd', 'faisalabad']
};

export type CampusCode = keyof typeof CAMPUS_CODES;

export interface ParsedEmail {
  isValid: boolean;
  campus?: string;
  campusCode?: CampusCode;
  batch?: string;
  rollNo?: string;
  error?: string;
}

export function validateFastEmail(email: string): ParsedEmail {
  // Check basic format
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  // Check if it ends with @nu.edu.pk or @[campus].nu.edu.pk
  const emailLower = email.toLowerCase();
  const atIndex = emailLower.indexOf('@');
  
  if (atIndex === -1) {
    return { isValid: false, error: 'Invalid email format' };
  }

  const localPart = email.substring(0, atIndex);
  const domainPart = emailLower.substring(atIndex + 1);

  // Check if domain is nu.edu.pk or [campus].nu.edu.pk
  const isBasicFormat = domainPart === 'nu.edu.pk';
  const isCampusFormat = domainPart.endsWith('.nu.edu.pk');

  if (!isBasicFormat && !isCampusFormat) {
    return { isValid: false, error: 'Must be a FAST university email (@nu.edu.pk or @[campus].nu.edu.pk)' };
  }

  // Extract campus subdomain if present (e.g., "lhr" from "lhr.nu.edu.pk")
  let campusSubdomain: string | null = null;
  if (isCampusFormat && !isBasicFormat) {
    campusSubdomain = domainPart.split('.')[0];
  }

  // Must match pattern: [letter][2digits][4digits]
  const regex = /^([kiLpmf])(\d{2})(\d{4})$/i;
  const match = localPart.match(regex);

  if (!match) {
    return { 
      isValid: false, 
      error: 'Invalid format. Should be: [campus][batch][rollno]@nu.edu.pk (e.g., k230832@nu.edu.pk or l230556@lhr.nu.edu.pk)' 
    };
  }

  const [, campusCode, batch, rollNo] = match;
  const lowerCampusCode = campusCode.toLowerCase() as CampusCode;

  // Validate campus code
  if (!(lowerCampusCode in CAMPUS_CODES)) {
    return { 
      isValid: false, 
      error: `Invalid campus code '${campusCode}'. Valid codes: k, i, l, p, m, f` 
    };
  }

  // If campus subdomain exists, validate it matches the campus code
  if (campusSubdomain) {
    const validDomains = CAMPUS_DOMAINS[lowerCampusCode];
    if (!validDomains.includes(campusSubdomain)) {
      return {
        isValid: false,
        error: `Campus code '${campusCode}' doesn't match domain '${campusSubdomain}'`
      };
    }
  }

  // Validate batch (should be reasonable, e.g., 15-35 for years 2015-2035)
  const batchNum = parseInt(batch, 10);
  if (batchNum < 15 || batchNum > 35) {
    return { 
      isValid: false, 
      error: `Invalid batch '${batch}'. Must be between 15 and 35` 
    };
  }

  return {
    isValid: true,
    campus: CAMPUS_CODES[lowerCampusCode],
    campusCode: lowerCampusCode,
    batch: `20${batch}`,
    rollNo: rollNo
  };
}

export function formatEmailError(error?: string): string {
  return error || 'Invalid email format';
}

// Helper to extract campus from email
export function getCampusFromEmail(email: string): string {
  const parsed = validateFastEmail(email);
  return parsed.campus || 'Unknown';
}

// Helper to extract batch from email
export function getBatchFromEmail(email: string): string {
  const parsed = validateFastEmail(email);
  return parsed.batch || 'Unknown';
}

// Password validation
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

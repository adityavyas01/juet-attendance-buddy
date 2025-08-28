import crypto from 'crypto';
import { logger } from './logger';

// Encryption configuration - lazy loaded
const getEncryptionConfig = () => {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  const ALGORITHM = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
  
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required for credential storage');
  }
  
  return {
    KEY: Buffer.from(ENCRYPTION_KEY, 'hex'),
    ALGORITHM
  };
};

export interface EncryptedData {
  encryptedText: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypt sensitive data (like WebKiosk passwords)
 */
export const encrypt = (text: string): EncryptedData => {
  try {
    const { KEY, ALGORITHM } = getEncryptionConfig();
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipher(ALGORITHM, KEY);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag for GCM mode
    const authTag = (cipher as any).getAuthTag ? (cipher as any).getAuthTag().toString('hex') : '';
    
    return {
      encryptedText: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag
    };
  } catch (error) {
    logger.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 */
export const decrypt = (encryptedData: EncryptedData): string => {
  try {
    const { KEY, ALGORITHM } = getEncryptionConfig();
    const { encryptedText, iv, authTag } = encryptedData;
    
    // Create decipher
    const decipher = crypto.createDecipher(ALGORITHM, KEY);
    
    // Set auth tag for GCM mode
    if (authTag && (decipher as any).setAuthTag) {
      (decipher as any).setAuthTag(Buffer.from(authTag, 'hex'));
    }
    
    // Decrypt the text
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Encrypt WebKiosk password for storage
 */
export const encryptPassword = (password: string): string => {
  const encrypted = encrypt(password);
  // Store as JSON string in database
  return JSON.stringify(encrypted);
};

/**
 * Decrypt WebKiosk password from storage
 */
export const decryptPassword = (encryptedPassword: string): string => {
  try {
    const encryptedData: EncryptedData = JSON.parse(encryptedPassword);
    return decrypt(encryptedData);
  } catch (error) {
    logger.error('Password decryption failed:', error);
    throw new Error('Failed to decrypt password');
  }
};

/**
 * Hash password for comparison (one-way)
 */
export const hashPassword = (password: string): string => {
  const { KEY } = getEncryptionConfig();
  return crypto.createHash('sha256').update(password + KEY.toString('hex')).digest('hex');
};

/**
 * Verify if password matches hash
 */
export const verifyPasswordHash = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

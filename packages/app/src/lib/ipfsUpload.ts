/**
 * Uploads a file to IPFS using The Graph's IPFS API
 * @param file - The file to upload
 * @returns Promise<string> - The IPFS hash of the uploaded file
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://api.thegraph.com/ipfs/api/v0/add?pin=true&cid-version=1', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.Hash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * Validates file type and size for logo uploads
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 1MB)
 * @param allowedTypes - Allowed MIME types (default: image types)
 * @returns Object with isValid boolean and error message
 */
export function validateLogoFile(
  file: File,
  maxSizeMB: number = 1,
  allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
): { isValid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size (convert MB to bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Validates file type and size for cover photo uploads
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 20MB)
 * @param allowedTypes - Allowed MIME types (default: image types)
 * @returns Object with isValid boolean and error message
 */
export function validateCoverPhotoFile(
  file: File,
  maxSizeMB: number = 20,
  allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
): { isValid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size (convert MB to bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Gets the IPFS URL for a given hash
 * @param hash - The IPFS hash
 * @returns The IPFS URL
 */
export function getIPFSUrl(hash: string): string {
  return `https://ipfs.io/ipfs/${hash}`;
}

import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

/**
 * Extract the file key from an UploadThing URL
 * URL format: https://utfs.io/f/{fileKey} or https://uploadthing.com/f/{fileKey}
 */
export function extractFileKey(url: string): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Handle /f/{fileKey} format
    if (pathname.startsWith("/f/")) {
      return pathname.slice(3);
    }
    
    // Handle /a/{appId}/{fileKey} format  
    const parts = pathname.split("/");
    if (parts.length >= 3 && parts[1] === "a") {
      return parts[parts.length - 1];
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Delete a file from UploadThing storage
 */
export async function deleteUploadThingFile(url: string): Promise<boolean> {
  const fileKey = extractFileKey(url);
  
  if (!fileKey) {
    console.warn("Could not extract file key from URL:", url);
    return false;
  }
  
  try {
    await utapi.deleteFiles(fileKey);
    console.log("Deleted file from UploadThing:", fileKey);
    return true;
  } catch (error) {
    console.error("Error deleting file from UploadThing:", error);
    return false;
  }
}

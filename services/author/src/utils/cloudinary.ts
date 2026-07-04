// utils/cloudinary.ts
export function getCloudinaryPublicId(url: string): string | null {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    let path = parts[1];
    path = path.replace(/^v\d+\//, "");
    const publicId = path.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch {
    return null;
  }
}
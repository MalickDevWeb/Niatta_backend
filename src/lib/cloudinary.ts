import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Fonction pour uploader un fichier vers Cloudinary
 * @param fileBuffer Buffer du fichier à uploader
 * @param folder Dossier de destination sur Cloudinary (ex: "stores", "observations")
 * @returns L'URL sécurisée de l'image uploadée
 */
export async function uploadToCloudinary(fileBuffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Détecte automatiquement s'il s'agit d'une image ou d'une vidéo
      },
      (error, result) => {
        if (error) {
          console.error("Erreur lors de l'upload Cloudinary:", error);
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Aucun résultat retourné par Cloudinary"));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Fonction pour supprimer un fichier de Cloudinary
 * @param publicId L'identifiant public de l'image (extrait de l'URL ou stocké en base)
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Erreur lors de la suppression Cloudinary:", error);
    throw error;
  }
}

/**
 * Extrait le publicId d'une URL Cloudinary
 * @param url L'URL de l'image
 */
export function extractPublicId(url: string): string | null {
  try {
    // Les URLs Cloudinary sont typiquement du format:
    // https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<filename>.<ext>
    const parts = url.split('/');
    const filenameWithExt = parts.pop();
    const folder = parts.pop();
    
    if (!filenameWithExt || !folder) return null;
    
    const filename = filenameWithExt.split('.')[0];
    return `${folder}/${filename}`;
  } catch (e) {
    return null;
  }
}

export default cloudinary;

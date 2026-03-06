import { storage } from '../src/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ProposalImage, RawImage } from '../types';

/**
 * Upload a File object to Firebase Storage and return the ProposalImage metadata.
 * Uses getDownloadURL to ensure a valid external URL is returned.
 */
export async function uploadProposalImage(
    file: File,
    folderPath: string
): Promise<ProposalImage> {
    const storageRef = ref(storage, folderPath);

    // Set the correct content type for the image
    const metadata = {
        contentType: file.type || "image/jpeg",
    };

    console.log("Starting upload for image path:", folderPath);

    await uploadBytes(storageRef, file, metadata);

    const downloadURL = await getDownloadURL(storageRef);

    console.log("Uploaded image path:", folderPath);
    console.log("Uploaded image downloadURL:", downloadURL);

    return {
        path: folderPath,
        url: downloadURL,
        name: file.name,
        type: file.type || "image/jpeg",
    };
}

/**
 * Merge existing images with new uploaded images.
 * Ensures we don't lose previous images when editing a proposal.
 */
export function mergeExistingAndNewImages(
    existingImages: ProposalImage[] = [],
    newUploadedImages: ProposalImage[] = []
): ProposalImage[] {
    if (!newUploadedImages.length) return existingImages;
    return [...existingImages, ...newUploadedImages];
}

/**
 * Normalize a single image value to always return a string URL.
 * Handles legacy string types or malformed objects.
 */
export function normalizeImageUrl(image: RawImage): string {
    if (!image) return "";

    if (typeof image === "string") {
        if (image.startsWith("http://") || image.startsWith("https://")) {
            return image;
        }
        return "";
    }

    return image.url || "";
}

/**
 * Normalize an array of images into a clean array of ProposalImage objects.
 * Removes empty or invalid legacy data.
 */
export function normalizeImages(images: any[] = []): ProposalImage[] {
    if (!Array.isArray(images)) return [];

    return images
        .map((image) => {
            if (!image) return null;

            if (typeof image === "string") {
                if (image.startsWith("http://") || image.startsWith("https://")) {
                    return {
                        path: "",
                        url: image,
                    };
                }
                return null;
            }

            if (image.url) {
                return image as ProposalImage;
            }

            return null;
        })
        .filter(Boolean) as ProposalImage[];
}

/**
 * Delete an image from Storage by its path (optional cleanup).
 */
export const deleteStorageImage = async (storagePath: string): Promise<void> => {
    if (!storagePath) return;
    try {
        await deleteObject(ref(storage, storagePath));
    } catch (err) {
        console.warn('Could not delete old image:', err);
    }
};

/**
 * Helper to upload a base64 string if still needed (legacy support for logos).
 * But converted to return ProposalImage format.
 */
import { uploadString } from 'firebase/storage';
export const uploadBase64ToProposalImage = async (
    base64: string,
    path: string
): Promise<string> => {
    if (!base64) return '';
    if (base64.startsWith('http://') || base64.startsWith('https://')) return base64;
    if (!base64.startsWith('data:')) return '';

    try {
        const storageRef = ref(storage, path);
        await uploadString(storageRef, base64, 'data_url');
        return await getDownloadURL(storageRef);
    } catch (err) {
        console.error(`✗ Legacy upload FAILED for ${path}:`, err);
        return '';
    }
};

/**
 * Walk through a proposal and ensure ALL images are normalized and valid.
 * This also handles legacy base64 if they somehow slipped in.
 */
export const uploadProposalImages = async (proposal: any): Promise<any> => {
    const pid = proposal.id;
    const updated = { ...proposal };

    // Branding logos
    if (updated.branding) {
        updated.branding = { ...updated.branding };
        if (updated.branding.clientLogo && updated.branding.clientLogo.startsWith('data:')) {
            updated.branding.clientLogo = await uploadBase64ToProposalImage(
                updated.branding.clientLogo,
                `proposals/${pid}/branding/clientLogo`
            );
        }
        if (updated.branding.companyLogo && updated.branding.companyLogo.startsWith('data:')) {
            updated.branding.companyLogo = await uploadBase64ToProposalImage(
                updated.branding.companyLogo,
                `proposals/${pid}/branding/companyLogo`
            );
        }
    }

    // Hotel images
    if (updated.hotelOptions?.length) {
        updated.hotelOptions = await Promise.all(
            updated.hotelOptions.map(async (hotel: any, hi: number) => {
                const h = { ...hotel };
                h.images = normalizeImages(h.images || []);
                return h;
            })
        );
    }

    // Transportation images
    if (updated.transportation?.length) {
        updated.transportation = await Promise.all(
            updated.transportation.map(async (t: any) => {
                const tr = { ...t };
                tr.images = normalizeImages(tr.images || []);
                // Handle legacy single 'image' field if it exists
                if (tr.image && !tr.images.length) {
                    tr.images = normalizeImages([tr.image]);
                }
                delete tr.image;
                return tr;
            })
        );
    }

    // Activity images
    if (updated.activities?.length) {
        updated.activities = await Promise.all(
            updated.activities.map(async (a: any) => {
                const act = { ...a };
                act.images = normalizeImages(act.images || []);
                // Handle legacy single 'image' field
                if (act.image && !act.images.length) {
                    act.images = normalizeImages([act.image]);
                }
                delete act.image;
                return act;
            })
        );
    }

    return updated;
};

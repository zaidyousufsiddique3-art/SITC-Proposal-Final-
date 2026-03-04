import { storage } from '../src/firebase';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Compress a base64 image using canvas to reduce file size.
 * Returns a compressed base64 JPEG string.
 */
const compressImage = (base64: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;

            if (w > maxWidth) {
                h = (maxWidth / w) * h;
                w = maxWidth;
            }

            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(base64);
        img.src = base64;
    });
};

/**
 * Upload a base64 image to Firebase Storage and return the download URL.
 * If already a URL, return as-is.
 * If upload fails, returns '' — NEVER returns base64.
 */
export const uploadBase64Image = async (
    base64: string,
    path: string
): Promise<string> => {
    if (!base64) return '';

    // Already a URL — keep it
    if (base64.startsWith('http://') || base64.startsWith('https://')) {
        return base64;
    }

    // Not a data URI — skip
    if (!base64.startsWith('data:')) {
        return '';
    }

    // Compress before upload
    const compressed = await compressImage(base64, 800, 0.7);

    try {
        const storageRef = ref(storage, path);
        await uploadString(storageRef, compressed, 'data_url');
        const url = await getDownloadURL(storageRef);
        console.log(`✓ Uploaded to Storage: ${path}`);
        return url;
    } catch (err) {
        console.error(`✗ Storage upload FAILED for ${path}:`, err);
        // NEVER return base64 — return empty so Firestore stays small
        return '';
    }
};

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
 * Walk through a proposal and upload ALL base64 images to Firebase Storage.
 * Returns the proposal with only URLs (never base64).
 */
export const uploadProposalImages = async (proposal: any): Promise<any> => {
    const pid = proposal.id;
    const updated = { ...proposal };

    // Branding logos
    if (updated.branding) {
        updated.branding = { ...updated.branding };
        if (updated.branding.clientLogo) {
            updated.branding.clientLogo = await uploadBase64Image(
                updated.branding.clientLogo,
                `proposals/${pid}/branding/clientLogo`
            );
        }
        if (updated.branding.companyLogo) {
            updated.branding.companyLogo = await uploadBase64Image(
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
                if (h.images?.length) {
                    h.images = await Promise.all(
                        h.images.map(async (img: any, ii: number) => ({
                            ...img,
                            url: await uploadBase64Image(
                                img.url,
                                `proposals/${pid}/hotels/${hi}/images/${ii}`
                            ),
                        }))
                    );
                    // Remove images that failed to upload (empty url)
                    h.images = h.images.filter((img: any) => img.url);
                }
                return h;
            })
        );
    }

    // Transportation images
    if (updated.transportation?.length) {
        updated.transportation = await Promise.all(
            updated.transportation.map(async (t: any, ti: number) => {
                if (t.image) {
                    return {
                        ...t,
                        image: await uploadBase64Image(
                            t.image,
                            `proposals/${pid}/transportation/${ti}/image`
                        ),
                    };
                }
                return t;
            })
        );
    }

    // Activity images
    if (updated.activities?.length) {
        updated.activities = await Promise.all(
            updated.activities.map(async (a: any, ai: number) => {
                if (a.image) {
                    return {
                        ...a,
                        image: await uploadBase64Image(
                            a.image,
                            `proposals/${pid}/activities/${ai}/image`
                        ),
                    };
                }
                return a;
            })
        );
    }

    return updated;
};

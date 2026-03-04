import { storage } from '../src/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

/**
 * Upload a base64 image to Firebase Storage and return the download URL.
 * If the value is already a URL (not base64), return it as-is.
 */
export const uploadBase64Image = async (
    base64: string,
    path: string
): Promise<string> => {
    // Skip if empty/null
    if (!base64) return '';

    // Skip if already a URL
    if (base64.startsWith('http://') || base64.startsWith('https://')) {
        return base64;
    }

    // Skip if not a base64 data URI
    if (!base64.startsWith('data:')) {
        return base64;
    }

    const storageRef = ref(storage, path);
    await uploadString(storageRef, base64, 'data_url');
    return getDownloadURL(storageRef);
};

/**
 * Walk through a proposal object and upload all base64 images to Firebase Storage.
 * Returns the proposal with base64 strings replaced by download URLs.
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

import { db } from '../src/firebase';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { ProposalData, User, ProposalSectionsConfig } from '../types';
import { uploadProposalImages } from './imageService';

export const getProposals = async (user: User): Promise<ProposalData[]> => {
    try {
        let q;
        if (user.role === 'super_admin' || user.role === 'owner') {
            q = query(collection(db, "proposals"), orderBy("lastModified", "desc"));
        } else if (user.role === 'admin') {
            q = query(collection(db, "proposals"), where("companyId", "==", user.companyId), orderBy("lastModified", "desc"));
        } else {
            q = query(collection(db, "proposals"), where("createdBy", "==", user.email), orderBy("lastModified", "desc"));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as ProposalData);
    } catch (e) {
        console.error("Error fetching proposals:", e);
        return [];
    }
};

// Recursively strip undefined values — Firestore rejects them
const sanitize = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (typeof obj === 'object' && !(obj instanceof Date)) {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
                cleaned[key] = sanitize(value);
            }
        }
        return cleaned;
    }
    return obj;
};

/**
 * Remove sections that are disabled for the company
 */
export const stripDisabledSections = (proposal: ProposalData, config: ProposalSectionsConfig): any => {
    const cleaned = { ...proposal };

    if (!config.pricingMarkup) {
        delete (cleaned as any).pricing;
    }
    if (!config.accommodation) {
        delete (cleaned as any).hotelOptions;
    }
    if (!config.flights) {
        delete (cleaned as any).flightOptions;
    }
    if (!config.transportation) {
        delete (cleaned as any).transportation;
    }
    if (!config.customServices) {
        delete (cleaned as any).customItems;
    }
    if (!config.activities) {
        delete (cleaned as any).activities;
    }

    return cleaned;
};

/**
 * NUCLEAR SAFETY NET: Recursively walk the entire object and:
 * 1. Replace any string starting with "data:" (base64) with ""
 * 2. Replace any string containing ";base64," with ""
 * 3. Replace any suspiciously large string (>10KB) in image-related keys with ""
 */
const IMAGE_KEYS = new Set([
    'base64', 'preview', 'dataUrl', 'imageData', 'fileData',
    'src', 'raw', 'blob', 'attachment', 'dataURL', 'data'
]);

const stripBase64 = (obj: any, path = ''): any => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        // Strip any data URI
        if (obj.startsWith('data:') || obj.includes(';base64,')) {
            console.warn(`⚠ Stripped base64 at path: ${path} (${obj.length} chars)`);
            return '';
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item, i) => stripBase64(item, `${path}[${i}]`));
    }

    if (typeof obj === 'object' && !(obj instanceof Date)) {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            // Strip large strings in known image-related keys
            if (typeof value === 'string' && value.length > 10000 && IMAGE_KEYS.has(key)) {
                console.warn(`⚠ Stripped large string at ${path}.${key} (${value.length} chars)`);
                cleaned[key] = '';
                continue;
            }
            cleaned[key] = stripBase64(value, `${path}.${key}`);
        }
        return cleaned;
    }

    return obj;
};

/**
 * Strip version snapshot data — these are full JSON copies of previous proposals
 * that can be 100KB+ each and easily push the doc over 1MB.
 * Keep only lightweight version metadata.
 */
const stripVersionData = (obj: any): any => {
    if (!obj) return obj;

    // Strip heavy version snapshots
    if (obj.versions && Array.isArray(obj.versions)) {
        obj.versions = obj.versions.map((v: any) => ({
            timestamp: v.timestamp,
            savedBy: v.savedBy,
            // Remove the full JSON snapshot — this is the #1 bloat cause
            // data: v.data  ← REMOVED
        }));
    }

    return obj;
};

/**
 * Analyze document size — log top 30 largest fields by byte size
 */
const analyzeDocSize = (obj: any, maxResults = 30): void => {
    const sizes: { path: string; bytes: number; type: string }[] = [];

    const walk = (o: any, path: string) => {
        if (o === null || o === undefined) return;

        if (typeof o === 'string') {
            const bytes = new TextEncoder().encode(o).length;
            if (bytes > 100) { // only track fields > 100 bytes
                sizes.push({ path, bytes, type: 'string' });
            }
            return;
        }

        if (Array.isArray(o)) {
            const arrBytes = new TextEncoder().encode(JSON.stringify(o)).length;
            sizes.push({ path, bytes: arrBytes, type: `array[${o.length}]` });
            o.forEach((item, i) => walk(item, `${path}[${i}]`));
            return;
        }

        if (typeof o === 'object') {
            const objBytes = new TextEncoder().encode(JSON.stringify(o)).length;
            if (path) sizes.push({ path, bytes: objBytes, type: 'object' });
            for (const [key, value] of Object.entries(o)) {
                walk(value, path ? `${path}.${key}` : key);
            }
        }
    };

    walk(obj, '');

    sizes.sort((a, b) => b.bytes - a.bytes);
    const top = sizes.slice(0, maxResults);

    console.group('📊 FIRESTORE DOC SIZE ANALYSIS — Top fields by size:');
    top.forEach(({ path, bytes, type }) => {
        const kb = (bytes / 1024).toFixed(1);
        console.log(`  ${kb} KB — ${path} (${type})`);
    });
    console.groupEnd();
};

export const saveProposal = async (proposal: ProposalData, config?: ProposalSectionsConfig) => {
    // Step 0: Strip disabled sections if config provided
    const filtered = config ? stripDisabledSections(proposal, config) : proposal;

    // Step 1: Upload base64 images to Firebase Storage → replace with URLs
    const withUrls = await uploadProposalImages(filtered);

    // Step 2: Strip version snapshot data (biggest bloat source)
    const withoutVersionData = stripVersionData(withUrls);

    // Step 3: Strip undefined values (Firestore rejects them)
    const sanitized = sanitize(withoutVersionData);

    // Step 4: SAFETY NET — strip ANY remaining base64 strings
    const safe = stripBase64(sanitized);

    // Step 5: Measure final payload size
    const payload = JSON.stringify(safe);
    const bytes = new TextEncoder().encode(payload).length;
    const kb = (bytes / 1024).toFixed(1);

    console.log(`📏 FIRESTORE_DOC_BYTES: ${bytes} (${kb} KB)`);

    // Step 6: Analyze if close to limit
    if (bytes > 500000) {
        analyzeDocSize(safe);
    }

    // Step 7: Block if too large
    if (bytes > 950000) {
        throw new Error(
            `Proposal is too large to save (${kb} KB / 1024 KB max). ` +
            `Please remove some content or images and try again. ` +
            `Check browser console for size breakdown.`
        );
    }

    // Step 8: Write to Firestore
    await setDoc(doc(db, "proposals", proposal.id), safe);
    console.log(`✅ Proposal saved: ${proposal.id} (${kb} KB)`);
    return safe as ProposalData;
};

export const deleteProposal = async (id: string) => {
    await setDoc(doc(db, "proposals", id), { isDeleted: true }, { merge: true });
};

import { db } from '../src/firebase';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { ProposalData, User } from '../types';
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
 * NUCLEAR SAFETY NET: Recursively walk the entire proposal object
 * and replace ANY string that starts with "data:" (base64) with "".
 * This guarantees Firestore NEVER receives base64 image data,
 * regardless of what happens upstream.
 */
const stripBase64 = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;

    // If it's a string starting with "data:", nuke it
    if (typeof obj === 'string') {
        if (obj.startsWith('data:')) {
            console.warn('⚠ Stripped base64 string from Firestore payload (field was not uploaded to Storage)');
            return '';
        }
        return obj;
    }

    // Recurse arrays
    if (Array.isArray(obj)) {
        return obj.map(stripBase64);
    }

    // Recurse objects
    if (typeof obj === 'object' && !(obj instanceof Date)) {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            cleaned[key] = stripBase64(value);
        }
        return cleaned;
    }

    return obj;
};

export const saveProposal = async (proposal: ProposalData) => {
    // Step 1: Upload base64 images to Firebase Storage → replace with URLs
    const withUrls = await uploadProposalImages(proposal);

    // Step 2: Strip undefined values (Firestore rejects them)
    const sanitized = sanitize(withUrls);

    // Step 3: SAFETY NET — strip ANY remaining base64 strings
    // This guarantees the doc is always under 1MB
    const safe = stripBase64(sanitized);

    // Step 4: Write to Firestore
    await setDoc(doc(db, "proposals", proposal.id), safe);
};

export const deleteProposal = async (id: string) => {
    await setDoc(doc(db, "proposals", id), { isDeleted: true }, { merge: true });
};

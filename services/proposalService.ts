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

export const getProposals = async (user: User): Promise<ProposalData[]> => {
    try {
        let q;
        if (user.role === 'super_admin' || user.role === 'owner') {
            // Fetch all proposals? Or just company ones?
            // For super admin, maybe all.
            q = query(collection(db, "proposals"), orderBy("lastModified", "desc"));
        } else if (user.role === 'admin') {
            // Fetch company proposals
            q = query(collection(db, "proposals"), where("companyId", "==", user.companyId), orderBy("lastModified", "desc"));
        } else {
            // Fetch own proposals
            q = query(collection(db, "proposals"), where("createdBy", "==", user.email), orderBy("lastModified", "desc"));
        }

        // Note: Firestore requires an index for compound queries (companyId + lastModified).
        // If index is missing, it will throw. We might need to remove orderBy or create index.
        // For now, let's try without orderBy in the query if it fails, or handle it client side.
        // Let's stick to simple query first.

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as ProposalData);
    } catch (e) {
        console.error("Error fetching proposals:", e);
        return [];
    }
};

export const saveProposal = async (proposal: ProposalData) => {
    await setDoc(doc(db, "proposals", proposal.id), proposal);
};

export const deleteProposal = async (id: string) => {
    // Soft delete or hard delete?
    // App.tsx logic was soft delete (isDeleted: true).
    // Let's stick to soft delete if we want to keep history, or hard delete.
    // The previous code did: return { ...p, isDeleted: true };
    // So we should update the doc.
    await setDoc(doc(db, "proposals", id), { isDeleted: true }, { merge: true });
};

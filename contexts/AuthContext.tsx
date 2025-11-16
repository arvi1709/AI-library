import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { 
  collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, setDoc, updateDoc, getDoc, deleteDoc 
} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import type { User, Resource, Comment, Report, EmpathyRating } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { containsProfanity, getProfanityErrorMessage } from '../services/profanityFilter';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  users: User[];
  stories: Resource[];
  comments: Comment[];
  likes: Record<string, string[]>;
  reports: Report[];
  bookmarks: string[];
  empathyRatings: Record<string, EmpathyRating[]>;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  signup: (email: string, pass: string, name: string, imageFile: File | null) => Promise<any>;
  addStory: (storyData: Pick<Resource, 'title' | 'shortDescription' | 'content' | 'summary' | 'tags' | 'fileName' | 'category' | 'status'>, imageFile: File | null) => Promise<void>;
  updateStory: (storyId: string, updates: Partial<Omit<Resource, 'id'>>) => Promise<void>;
  addComment: (resourceId: string, text: string) => Promise<void>;
  toggleLike: (resourceId: string) => Promise<void>;
  reportContent: (resourceId: string, resourceTitle: string) => Promise<void>;
  updateUserProfile: (name: string, imageFile: File | null) => Promise<void>;
  toggleBookmark: (resourceId: string) => Promise<void>;
  rateEmpathy: (resourceId: string, rating: number) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stories, setStories] = useState<Resource[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Record<string, string[]>>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [empathyRatings, setEmpathyRatings] = useState<Record<string, EmpathyRating[]>>({});

    // 🔐 Handle Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const snap = await getDoc(userDocRef);

        let name = user.displayName || user.email?.split('@')[0] || 'User';
        let imageUrl = user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`;
        let bookmarks: string[] = [];

        if (snap.exists()) {
          const data = snap.data();
          name = data.name || name;
          imageUrl = data.imageUrl || imageUrl;
          bookmarks = data.bookmarks || [];
        } else {
          // Create user doc if it doesn't exist, ensuring all fields are present
          await setDoc(userDocRef, {
            uid: user.uid,
            name,
            email: user.email,
            imageUrl,
            bookmarks: []
          }, { merge: true });
        }

        setCurrentUser({ uid: user.uid, email: user.email, name, imageUrl });
        setBookmarks(bookmarks);
      } else {
        setCurrentUser(null);
        setBookmarks([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🔁 Real-time sync for all collections
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList: User[] = snapshot.docs.map(doc => doc.data() as User);
      setUsers(userList);
    });

    const unsubStories = onSnapshot(query(collection(db, "stories"), orderBy("createdAt", "desc")), (snapshot) => {
      const storyList: Resource[] = snapshot.docs.map(doc => ({
        ...(doc.data() as Resource),
        id: doc.id
      }));
      setStories(storyList);
    });

    const unsubComments = onSnapshot(collection(db, "comments"), (snapshot) => {
      const commentList: Comment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Comment, 'id'>)
      }));
      setComments(commentList);
    });

    const unsubLikes = onSnapshot(collection(db, "likes"), (snapshot) => {
      const likeMap: Record<string, string[]> = {};
      snapshot.docs.forEach(doc => {
        likeMap[doc.id] = doc.data().userIds || [];
      });
      setLikes(likeMap);
    });

    const unsubReports = onSnapshot(collection(db, "reports"), (snapshot) => {
      const reportList: Report[] = snapshot.docs.map(doc => doc.data() as Report);
      setReports(reportList);
    });

    const unsubEmpathy = onSnapshot(collection(db, "empathyRatings"), (snapshot) => {
      const map: Record<string, EmpathyRating[]> = {};
      snapshot.docs.forEach(doc => {
        map[doc.id] = doc.data().ratings || [];
      });
      setEmpathyRatings(map);
    });

    return () => {
      unsubStories();
      unsubComments();
      unsubLikes();
      unsubReports();
      unsubEmpathy();
      unsubUsers();
    };
  }, []);

  // 🔧 Auth Actions
  const login = useCallback((email: string, password: string) => signInWithEmailAndPassword(auth, email, password), []);
  
  const signup = useCallback(async (email: string, password: string, name: string, imageFile: File | null) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let imageUrl = `https://picsum.photos/seed/${user.uid}/200/200`;

    if (imageFile) {
      const storage = getStorage();
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    // Update Firebase Auth profile
    await updateProfile(user, { displayName: name, photoURL: imageUrl });

    // Create user document in Firestore
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      name,
      email: user.email,
      imageUrl,
      bookmarks: []
    });

    return userCredential;
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  // 📝 Add a story
  const addStory = useCallback(async (storyData: Pick<Resource, 'title' | 'shortDescription' | 'content' | 'summary' | 'tags' | 'fileName' | 'category' | 'status'>, imageFile: File | null) => {
    if (!currentUser) throw new Error("User not authenticated");

    let imageUrl = `https://picsum.photos/seed/${Date.now()}/400/300`;

    if (imageFile) {
      const storage = getStorage();
      const storageRef = ref(storage, `story_images/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const newStory: Omit<Resource, 'id'> = {
      ...storyData,
      authorId: currentUser.uid,
      authorName: currentUser.name ?? undefined,
      authorImageUrl: currentUser.imageUrl,
      imageUrl,
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, "stories"), newStory);
  }, [currentUser]);

  // ✏️ Update a story in Firestore
  const updateStory = useCallback(async (storyId: string, updates: Partial<Omit<Resource, 'id'>>) => {
    const storyRef = doc(db, "stories", storyId);
    await updateDoc(storyRef, updates);
    // The real-time listener will automatically update the local state.
  }, []);

  // 💬 Add comment
  const addComment = useCallback(async (resourceId: string, text: string) => {
    const user = auth.currentUser;
    if (!user || !currentUser) {
      console.error("User must be logged in to comment.");
      throw new Error("User must be logged in to comment.");
    }

    // Check for profanity
    if (containsProfanity(text)) {
      throw new Error(getProfanityErrorMessage());
    }

    const newComment: Omit<Comment, 'id'> = {
      resourceId,
      authorId: currentUser.uid,
      authorName: currentUser.name ?? user.displayName ?? user.email?.split('@')[0] ?? 'Anonymous',
      authorImageUrl: currentUser.imageUrl,
      text,
      timestamp: Date.now(),
    };
    await addDoc(collection(db, "comments"), newComment);
  }, [currentUser]);

  // ❤️ Toggle like
  const toggleLike = useCallback(async (resourceId: string) => {
    if (!currentUser) return;
    const likeRef = doc(db, "likes", resourceId);
    const snap = await getDoc(likeRef);
    if (snap.exists()) {
      const data = snap.data();
      const updated = data.userIds.includes(currentUser.uid)
        ? data.userIds.filter((id: string) => id !== currentUser.uid)
        : [...data.userIds, currentUser.uid];
      await updateDoc(likeRef, { userIds: updated });
    } else {
      await setDoc(likeRef, { userIds: [currentUser.uid] });
    }
  }, [currentUser]);

  // 🚩 Report content
  const reportContent = useCallback(async (resourceId: string, resourceTitle: string) => {
    if (!currentUser) return;
    const report = { resourceId, reporterId: currentUser.uid, resourceTitle, timestamp: Date.now() };
    await addDoc(collection(db, "reports"), report);
  }, [currentUser]);

  // 🔖 Toggle bookmark (stored per-user)
  const toggleBookmark = useCallback(async (resourceId: string) => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const snap = await getDoc(userRef);
    const userData = snap.exists() ? snap.data() : { bookmarks: [] };
    const updated = userData.bookmarks.includes(resourceId)
      ? userData.bookmarks.filter((id: string) => id !== resourceId)
      : [...userData.bookmarks, resourceId];
    await setDoc(userRef, { bookmarks: updated }, { merge: true });
    setBookmarks(updated);
  }, [currentUser]);

  // 💖 Empathy rating
  const rateEmpathy = useCallback(async(resourceId: string, rating: number) => {
      if (!currentUser || rating < 0 || rating > 100) return;
      
      setEmpathyRatings(prev => {
        const newRatings = { ...prev };
        let currentRatings = newRatings[resourceId] || [];
        const userRatingIndex = currentRatings.findIndex(r => r.userId === currentUser.uid);

        if (userRatingIndex > -1) {
          currentRatings[userRatingIndex].rating = rating;
        } else {
          currentRatings.push({ userId: currentUser.uid, rating });
        }
        
        newRatings[resourceId] = [...currentRatings];
        return newRatings;
      });
    }, [currentUser]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!currentUser) {
      console.error("User must be logged in to delete a comment.");
      return;
    }
    const commentRef = doc(db, "comments", commentId);
    await deleteDoc(commentRef);
  }, [currentUser]);
  
  const deleteStory = useCallback(async (storyId: string) => {
    if (!currentUser) {
      console.error("User must be logged in to delete a story.");
      return;
    }
    const storyRef = doc(db, "stories", storyId);
    await deleteDoc(storyRef);
  }, [currentUser]);

  const deleteAccount = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently signed in.");
    }

    try {
      // 1. Delete profile image from Storage
      const storage = getStorage();
      const imageRef = ref(storage, `profile_images/${user.uid}`);
      try {
        await deleteObject(imageRef);
      } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
          console.error("Error deleting profile image:", error);
        }
      }

      // 2. Delete user document from Firestore
      const userDocRef = doc(db, "users", user.uid);
      await deleteDoc(userDocRef);

      // 3. Delete the user from Firebase Authentication
      await deleteUser(user);

    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  }, []);

  // 🧑‍🎨 Update user profile
  const updateUserProfile = useCallback(async (name: string, imageFile: File | null) => {
    const user = auth.currentUser;
    if (!user || !currentUser) throw new Error("User not authenticated");

    let newImageUrl = currentUser.imageUrl;

    if (imageFile) {
      const storage = getStorage();
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      
      // Upload the file and get the download URL
      await uploadBytes(storageRef, imageFile);
      newImageUrl = await getDownloadURL(storageRef);
    }

    // First, update the Firestore document, which is our source of truth
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, { name, imageUrl: newImageUrl }, { merge: true });

    // Then, update the Firebase Auth profile for consistency
    await updateProfile(user, { displayName: name, photoURL: newImageUrl });
    
    const updatedUser = { ...currentUser, name, imageUrl: newImageUrl };
    setCurrentUser(updatedUser);
  }, [currentUser]);

  const value = useMemo(() => ({
    currentUser,
    loading,
    users,
    stories,
    comments,
    likes,
    reports,
    bookmarks,
    empathyRatings,
    login,
    logout,
    signup,
    addStory,
    updateStory,
    addComment,
    toggleLike,
    reportContent,
    updateUserProfile,
    toggleBookmark,
    rateEmpathy,
    deleteComment,
    deleteStory,
    deleteAccount,
  }), [currentUser, loading, users, stories, comments, likes, reports, bookmarks, empathyRatings, addStory, updateStory, addComment, toggleLike, reportContent, updateUserProfile, toggleBookmark, rateEmpathy, deleteComment, deleteStory, deleteAccount]);

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { 
  collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, setDoc, updateDoc, getDoc, deleteDoc, where, getDocs, arrayRemove
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
import type { User, Resource, Comment, Report, EmpathyRating, Notification } from '../types';
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
  updateStory: (storyId: string, updates: Partial<Omit<Resource, 'id'>>, imageFile: File | null) => Promise<void>;
  addComment: (resourceId: string, text: string) => Promise<void>;
  toggleLike: (resourceId: string) => Promise<void>;
  reportContent: (resourceId: string, resourceTitle: string) => Promise<void>;
  updateUserProfile: (name: string, imageFile: File | null) => Promise<void>;
  toggleBookmark: (resourceId: string) => Promise<void>;
  rateEmpathy: (resourceId: string, rating: number) => Promise<void>;
  toggleFollow: (targetUserId: string) => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
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
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        
        // Set up a real-time listener for the current user's document
        const unsubscribeSnapshot = onSnapshot(userDocRef, (snap) => {
          let name = user.displayName || user.email?.split('@')[0] || 'User';
          let imageUrl = user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`;
          let bookmarks: string[] = [];
          let followers: string[] = [];
          let following: string[] = [];
          let notifications: Notification[] = [];

          if (snap.exists()) {
            const data = snap.data();
            name = data.name || name;
            imageUrl = data.imageUrl || imageUrl;
            bookmarks = data.bookmarks || [];
            followers = data.followers || [];
            following = data.following || [];
            notifications = data.notifications || [];
          } else {
            // This part should rarely run after the initial signup, but it's good for safety.
            setDoc(userDocRef, {
              uid: user.uid,
              name,
              email: user.email,
              imageUrl,
              bookmarks: [],
              followers: [],
              following: [],
              notifications: []
            }, { merge: true });
          }
          
          setCurrentUser({ uid: user.uid, email: user.email, name, imageUrl, followers, following, notifications });
          setBookmarks(bookmarks);
          setLoading(false);
        });

        return () => unsubscribeSnapshot(); // Cleanup the snapshot listener when auth state changes

      } else {
        setCurrentUser(null);
        setBookmarks([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Cleanup the auth listener
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
      bookmarks: [],
      followers: [],
      following: [],
      notifications: []
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
    const docRef = await addDoc(collection(db, "stories"), newStory);

    // Create notifications for followers
    if (currentUser.followers && currentUser.followers.length > 0) {
      currentUser.followers.forEach(async (followerId) => {
        const followerRef = doc(db, "users", followerId);
        const followerSnap = await getDoc(followerRef);
        if (followerSnap.exists()) {
          const followerData = followerSnap.data();
          const newNotification: Notification = {
            id: `${docRef.id}-${Date.now()}`,
            type: 'new_story',
            message: `${currentUser.name} published a new story: "${storyData.title}"`,
            timestamp: Date.now(),
            read: false,
            relatedStoryId: docRef.id,
          };
          await updateDoc(followerRef, {
            notifications: [...(followerData.notifications || []), newNotification]
          });
        }
      });
    }
  }, [currentUser]);

  // ✏️ Update a story in Firestore
  const updateStory = useCallback(async (storyId: string, updates: Partial<Omit<Resource, 'id'>>, imageFile: File | null) => {
    const storyRef = doc(db, "stories", storyId);

    const newUpdates = { ...updates };

    if (imageFile) {
      const storage = getStorage();
      const storageRef = ref(storage, `story_images/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      newUpdates.imageUrl = await getDownloadURL(storageRef);
    }

    await updateDoc(storyRef, newUpdates);
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
    
    // Notify the author of the story
    const story = stories.find(s => s.id === resourceId);
    if (story && story.authorId) {
      const authorRef = doc(db, "users", story.authorId);
      const authorSnap = await getDoc(authorRef);
      if (authorSnap.exists()) {
        const authorData = authorSnap.data();
        const newNotification: Notification = {
          id: `${resourceId}-report-${Date.now()}`,
          type: 'story_reported',
          message: `Your story "${resourceTitle}" has been reported.`,
          timestamp: Date.now(),
          read: false,
          relatedStoryId: resourceId,
        };
        await updateDoc(authorRef, {
          notifications: [...(authorData.notifications || []), newNotification]
        });
      }
    }
  }, [currentUser, stories]);

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

  // 🧑‍🤝‍🧑 Toggle Follow
  const toggleFollow = useCallback(async (targetUserId: string) => {
    if (!currentUser || currentUser.uid === targetUserId) return;

    const currentUserRef = doc(db, "users", currentUser.uid);
    const targetUserRef = doc(db, "users", targetUserId);

    const isFollowing = currentUser.following?.includes(targetUserId);

    // Update current user's following list
    await updateDoc(currentUserRef, {
      following: isFollowing 
        ? (currentUser.following || []).filter(id => id !== targetUserId)
        : [...(currentUser.following || []), targetUserId]
    });

    // Update target user's followers list
    const targetUserSnap = await getDoc(targetUserRef);
    if (targetUserSnap.exists()) {
      const targetUserData = targetUserSnap.data();
      await updateDoc(targetUserRef, {
        followers: isFollowing
          ? (targetUserData.followers || []).filter((id: string) => id !== currentUser.uid)
          : [...(targetUserData.followers || []), currentUser.uid]
      });
    }
  }, [currentUser]);

  // 🔔 Mark Notifications as Read
  const markNotificationsAsRead = useCallback(async () => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const updatedNotifications = currentUser.notifications?.map(n => ({ ...n, read: true })) || [];
    
    await updateDoc(userRef, { notifications: updatedNotifications });

    setCurrentUser(prev => prev ? { ...prev, notifications: updatedNotifications } : null);
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
      // Step 1: Find all stories, comments, likes, and reports by the user
      const storiesQuery = query(collection(db, "stories"), where("authorId", "==", user.uid));
      const storiesSnapshot = await getDocs(storiesQuery);
      const storyIdsToDelete = storiesSnapshot.docs.map(doc => doc.id);
  
      // Step 2: Concurrently delete all associated data
      const deletePromises: Promise<any>[] = [];
  
      // Delete stories and their images
      storiesSnapshot.forEach(storyDoc => {
        deletePromises.push(deleteDoc(storyDoc.ref));
        const storyData = storyDoc.data();
        if (storyData.imageUrl && storyData.imageUrl.includes('firebasestorage')) {
          const imageRef = ref(getStorage(), storyData.imageUrl);
          deletePromises.push(deleteObject(imageRef).catch(err => console.warn("Image delete failed:", err)));
        }
      });
  
      // Delete comments, likes, and reports related to the stories
      if (storyIdsToDelete.length > 0) {
        const commentsQuery = query(collection(db, "comments"), where("resourceId", "in", storyIdsToDelete));
        deletePromises.push(getDocs(commentsQuery).then(snapshot => snapshot.forEach(doc => deleteDoc(doc.ref))));
        
        storyIdsToDelete.forEach(storyId => {
          deletePromises.push(deleteDoc(doc(db, "likes", storyId)));
          deletePromises.push(deleteDoc(doc(db, "reports", storyId)));
        });
      }
      
      // Step 3: Clean up social graph (followers/following)
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Remove this user from their followers' "following" lists
        (userData.followers || []).forEach((followerId: string) => {
          const followerRef = doc(db, "users", followerId);
          deletePromises.push(updateDoc(followerRef, { following: arrayRemove(user.uid) }));
        });
        
        // Remove this user from their following's "followers" lists
        (userData.following || []).forEach((followingId: string) => {
          const followingRef = doc(db, "users", followingId);
          deletePromises.push(updateDoc(followingRef, { followers: arrayRemove(user.uid) }));
        });
      }

      // Execute all deletions in parallel
      await Promise.all(deletePromises);
  
      // Step 4: Delete the user's profile and authentication record
      await deleteDoc(userDocRef);
      const storage = getStorage();
      const imageRef = ref(storage, `profile_images/${user.uid}`);
      try {
        await deleteObject(imageRef);
      } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
          console.warn("Could not delete profile image:", error);
        }
      }
      await deleteUser(user);
  
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("This is a sensitive operation. Please log in again to confirm account deletion.");
        await signOut(auth);
      } else {
        throw new Error("An unexpected error occurred while deleting your account.");
      }
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
    toggleFollow,
    markNotificationsAsRead,
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

import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ResourceCard from '../components/ResourceCard';
import FollowListModal from '../components/FollowListModal';
import { useState } from 'react';

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { users, stories, likes, currentUser, toggleFollow } = useAuth();
  const [modalState, setModalState] = useState<{isOpen: boolean; title: 'Followers' | 'Following'; userIds: string[]}>({isOpen: false, title: 'Followers', userIds: []});

  const profileUser = useMemo(() => users.find(u => u.uid === userId), [users, userId]);
  const userStories = useMemo(() => stories.filter(s => s.authorId === userId && s.status === 'published'), [stories, userId]);

  const isFollowing = useMemo(() => currentUser?.following?.includes(userId || ''), [currentUser, userId]);

  if (!profileUser) {
    return <div className="text-center p-8">User not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <img className="w-24 h-24 rounded-full object-cover" src={profileUser.imageUrl} alt={profileUser.name || 'User'} />
          <div>
            <h1 className="text-3xl font-bold text-brand-navy">{profileUser.name}</h1>
            <div className="flex gap-4 mt-2 text-slate-600 dark:text-slate-400">
              <button onClick={() => setModalState({isOpen: true, title: 'Followers', userIds: profileUser.followers || []})} className="hover:underline">
                <span className="font-bold text-slate-800 dark:text-slate-200">{profileUser.followers?.length || 0}</span> Followers
              </button>
              <button onClick={() => setModalState({isOpen: true, title: 'Following', userIds: profileUser.following || []})} className="hover:underline">
                <span className="font-bold text-slate-800 dark:text-slate-200">{profileUser.following?.length || 0}</span> Following
              </button>
            </div>
          </div>
        </div>
        {currentUser && currentUser.uid !== userId && (
          <button 
            onClick={() => toggleFollow(userId!)}
            className={`font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${isFollowing ? 'bg-slate-200 text-slate-800' : 'bg-brand-navy text-white'}`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <FollowListModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({...prev, isOpen: false}))}
        title={modalState.title}
        userIds={modalState.userIds}
      />

      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6">{profileUser.name}'s Stories</h2>
        {userStories.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userStories.map(story => (
              <ResourceCard
                key={story.id}
                resource={story}
                likesCount={(likes[story.id] || []).length}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">This user hasn't published any stories yet.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: 'Followers' | 'Following';
  userIds: string[];
}

const FollowListModal: React.FC<FollowListModalProps> = ({ isOpen, onClose, title, userIds }) => {
  const { users } = useAuth();

  if (!isOpen) return null;

  const userList = users.filter(user => userIds.includes(user.uid));

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-center items-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-fade-in" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b dark:border-slate-700 p-4">
          <h2 className="text-xl font-bold text-brand-navy">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {userList.length > 0 ? (
            <ul className="space-y-3">
              {userList.map(user => (
                <li key={user.uid}>
                  <Link to={`/profile/${user.uid}`} onClick={onClose} className="flex items-center gap-4 group p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <img src={user.imageUrl} alt={user.name || 'User'} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-navy">{user.name}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-center py-12">No users to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;

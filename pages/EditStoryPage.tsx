import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Resource } from '../types';

const EditStoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, updateStory } = useAuth();
  
  const [story, setStory] = useState<Resource | null>(null);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) {
        setError('Story ID is missing.');
        setIsLoading(false);
        return;
      }

      try {
        const storyRef = doc(db, 'stories', id);
        const storySnap = await getDoc(storyRef);

        if (storySnap.exists()) {
          const storyData = { id: storySnap.id, ...storySnap.data() } as Resource;
          
          if (storyData.authorId !== currentUser?.uid) {
            setError('You are not authorized to edit this story.');
            setIsLoading(false);
            return;
          }

          setStory(storyData);
          setTitle(storyData.title);
          setShortDescription(storyData.shortDescription);
          setContent(storyData.content);
          setSummary(storyData.summary || '');
          setTags((storyData.tags || []).join(', '));
          setCategory(Array.isArray(storyData.category) ? storyData.category.join(', ') : storyData.category);
          setCurrentBannerUrl(storyData.imageUrl);
        } else {
          setError('Story not found.');
        }
      } catch (err) {
        setError('Failed to fetch story data. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchStory();
    }
  }, [id, currentUser]);

  const handleSave = async (publish: boolean) => {
    if (!id) {
      setError('Story ID is missing.');
      return;
    }

    setIsUpdating(true);
    setError('');

    const updates: Partial<Resource> = {
      title,
      shortDescription,
      content,
      summary,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      category: category.split(',').map(c => c.trim()).filter(Boolean),
      status: publish ? 'published' : 'pending_review',
    };

    try {
      await updateStory(id, updates, bannerImageFile);
      navigate(`/resource/${id}`);
    } catch (err) {
      setError('Failed to update the story. Please try again.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2 mb-4">{error}</p>
        <Link to="/profile" className="mt-4 inline-block text-white px-4 py-2 rounded-lg" style={{ backgroundColor: '#16476A' }}>
          Go to My Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
        <h1 className="text-3xl font-bold text-brand-navy">Edit Your Story</h1>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Story Title</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-navy focus:border-brand-navy bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Story Content</label>
          <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={15} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-navy focus:border-brand-navy bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
        </div>
        
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Summary</label>
          <textarea id="summary" value={summary} onChange={e => setSummary(e.target.value)} rows={5} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-navy focus:border-brand-navy bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tags (comma-separated)</label>
          <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-navy focus:border-brand-navy bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Banner Image</label>
          {currentBannerUrl && <img src={currentBannerUrl} alt="Current banner" className="mt-2 rounded-lg max-h-48" />}
        </div>
        
        <div>
          <label htmlFor="banner-image" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Upload New Banner Image (Optional)</label>
          <input type="file" id="banner-image" onChange={e => setBannerImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-navy/10 file:text-brand-navy hover:file:bg-brand-navy/20"/>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t dark:border-slate-700">
          <button onClick={() => handleSave(false)} disabled={isUpdating} className="flex-1 justify-center py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none disabled:bg-slate-200 dark:disabled:bg-slate-500">
            {isUpdating ? <LoadingSpinner /> : 'Save Draft'}
          </button>
          <button onClick={() => handleSave(true)} disabled={isUpdating} className="flex-1 justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none disabled:bg-slate-400" style={{ backgroundColor: '#bf092f' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8b0621'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#bf092f'}>
            {isUpdating ? <LoadingSpinner /> : 'Publish Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStoryPage;
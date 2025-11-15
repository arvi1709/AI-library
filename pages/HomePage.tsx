import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RESOURCES, TEAM_MEMBERS, MENTORS, MOST_VIEWED_AUTHORS } from '../constants';
import ResourceCard from '../components/ResourceCard';
import WelcomeModal from '../components/WelcomeModal';
import { useAuth } from '../contexts/AuthContext';


const HomePage: React.FC = () => {
  const { currentUser, stories, likes, users } = useAuth();
  const navigate = useNavigate();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Show modal on load if user is not logged in.
    if (!currentUser) {
      // Use a timeout to make it feel less abrupt
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Ensure modal is hidden if user is logged in
      setShowWelcomeModal(false);
    }
  }, [currentUser]);

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
  };

  const allResources = useMemo(() => {
    const publishedStories = stories.filter(s => s.status === 'published');
    return [...RESOURCES, ...publishedStories];
  }, [stories]);

  const mostViewedAuthors = useMemo(() => {
    const authorStats: { [authorName: string]: { stories: number; likes: number; authorId?: string } } = {};

    allResources.forEach(story => {
      if (story.authorName) {
        if (!authorStats[story.authorName]) {
          authorStats[story.authorName] = { stories: 0, likes: 0, authorId: story.authorId };
        }
        authorStats[story.authorName].stories += 1;
        authorStats[story.authorName].likes += (likes[story.id] || []).length;
      }
    });

    const sortedAuthors = Object.entries(authorStats)
      .map(([name, stats]) => {
        const authorProfile = users.find(u => u.uid === stats.authorId);
        return {
          name,
          role: 'Author',
          bio: `${stats.stories} stories published`,
          imageUrl: authorProfile?.imageUrl || `https://picsum.photos/seed/${name.replace(/\s+/g, '')}/200/200`,
          score: stats.stories + stats.likes * 2, // Simple scoring: 1 point per story, 2 per like
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    // If we don't have enough dynamic authors, fill with static ones
    if (sortedAuthors.length < 4) {
      return [...sortedAuthors, ...MOST_VIEWED_AUTHORS.slice(0, 4 - sortedAuthors.length)];
    }

    return sortedAuthors;
  }, [allResources, likes, users]);

  const handleAuthorClick = (authorName: string) => {
    navigate(`/library?author=${encodeURIComponent(authorName)}`);
  };

  return (
    <>
      {showWelcomeModal && <WelcomeModal onClose={handleCloseModal} />}
      <div className="text-center py-16">
        <div 
          className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0),#fff)] -z-10" 
          style={{ backgroundSize: '32px 32px' }}>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-black dark:text-white mb-4">
          Welcome to Living Library 2.0
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
          Discover a new way to interact with knowledge. Explore resources, get instant AI-powered summaries, and chat with our intelligent assistant to deepen your understanding.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link 
            to="/library" 
            className="text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
            style={{ backgroundColor: '#bf092f' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8b0621'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#bf092f'}
          >
            Explore the Library
          </Link>
          <Link 
            to="/assistant" 
            className="text-black dark:text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 border-2 border-black dark:border-white"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.borderColor = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#000';
            }}
          >
            Talk to AI Assistant
          </Link>
        </div>
          <div className="mt-16 max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-brand-navy dark:border-brand-navy/60 transition-transform duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#bf092f' }}>Search & Discover</h3>
            <p className="text-slate-600 dark:text-slate-300">Effortlessly find resources across various categories with our intuitive search and filtering tools.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-brand-navy dark:border-brand-navy/60 transition-transform duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#bf092f' }}>Instant Summaries</h3>
            <p className="text-slate-600 dark:text-slate-300">Leverage the power of Gemini to get concise summaries of long documents in seconds.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-brand-navy dark:border-brand-navy/60 transition-transform duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#bf092f' }}>Interactive Learning</h3>
            <p className="text-slate-600 dark:text-slate-300">Engage with our AI Assistant to ask questions, clarify concepts, and explore topics further.</p>
          </div>
        </div>
        
        <div className="mt-24 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-12">Weekly Most Viewed Authors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {mostViewedAuthors.map((author) => (
              <div 
                key={author.name} 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => handleAuthorClick(author.name)}
              >
                <img className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg group-hover:scale-105 transition-transform" src={author.imageUrl} alt={author.name} loading="lazy" decoding="async" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200" onMouseEnter={(e) => e.currentTarget.style.color = '#bf092f'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>{author.name}</h3>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
};

export default HomePage;
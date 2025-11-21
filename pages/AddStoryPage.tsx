import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { processFileContent, processTextContent } from '../services/geminiService';

const AddStoryPage: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'details'>('upload');
  const [inputType, setInputType] = useState<'file' | 'text' | 'record'>('file');

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState(''); // For the new text area
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);

  // AI processed data
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState(''); // Stored as comma-separated string for the input field
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser, addStory } = useAuth();
  const navigate = useNavigate();
  
  const ALLOWED_TYPES = [
    'application/pdf',
    'text/plain',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (ALLOWED_TYPES.includes(selectedFile.type) || selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a valid PDF, DOC, TXT, or audio file.');
        setFile(null);
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
  };

  const handleNext = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (!currentUser) throw new Error("Authentication error.");

      let result;
      if (inputType === 'file') {
        if (!file) {
          setError('Please select a file before proceeding.');
          setIsLoading(false);
          return;
        }
        result = await processFileContent(file);
      } else if (inputType === 'text') {
        if (!textContent.trim()) {
          setError('Please write some content before proceeding.');
          setIsLoading(false);
          return;
        }
        result = await processTextContent(textContent);
      } else if (inputType === 'record') {
        if (!content.trim()) {
          setError('The transcript is empty. Please record something first.');
          setIsLoading(false);
          return;
        }
        // Use the existing transcript (including any user edits) for full AI processing
        result = await processTextContent(content);
      } else {
        setIsLoading(false);
        return; // Should not happen
      }
      
      // The content is now set from the result, preserving the source.
      setContent(result.content || '');
      setSummary(result.summary || '');
      setTags((result.tags || []).join(', '));
      setCategory((result.categories || []).join(', '));
      
      setStep('details');
    } catch (err) {
      console.error("Error processing content:", err);
      setError("There was an error processing your content. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      recorder.start();
      
      // Handle data
      const audioChunks: Blob[] = [];
      recorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      // Handle stop
      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
        handleProcessRecording(blob); // Auto-transcribe on stop
      };

      setIsRecording(true);
      setIsPaused(false);
      // Timer
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimerIntervalId(intervalId);

    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not start recording. Please ensure microphone permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && !isPaused) {
      mediaRecorder.pause();
      setIsPaused(true);
      if (timerIntervalId) clearInterval(timerIntervalId);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && isPaused) {
      mediaRecorder.resume();
      setIsPaused(false);
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimerIntervalId(intervalId);
    }
  };
  
  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    if (timerIntervalId) clearInterval(timerIntervalId);
    setMediaRecorder(null);
    setIsRecording(false);
    setIsPaused(false);
    setContent(''); // Clear transcript
    setFile(null); // Clear file reference
  };
  
  const handleProcessRecording = async (blob: Blob) => {
    if (!blob) return;
    const audioFile = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
    setFile(audioFile); // Set the file to be used in the next step
    
    setIsTranscribing(true);
    setError('');
    try {
      if (!currentUser) throw new Error("Authentication error.");
      const result = await processFileContent(audioFile);
      setContent(result.content || '');
      // We stop here to let the user see the transcript first.
      // The rest of the AI processing will happen on the 'Next' click.
    } catch (err) {
      console.error("Error transcribing audio:", err);
      setError("There was an error transcribing your recording. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent, status: 'published' | 'pending_review') => {
    e.preventDefault();
    if (!title || !category || !shortDescription || !content) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await addStory({ 
        title, 
        category: category.split(',').map(c => c.trim()).filter(Boolean), 
        shortDescription, 
        content,
        summary,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        fileName: file ? file.name : 'text-story.txt',
        status,
      }, bannerImageFile);
      navigate('/profile');
    } catch (err) {
      console.error("Error adding story:", err);
      setError("There was an unexpected error saving your story. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!currentUser) {
    return (
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-brand-navy">Login Required</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 mb-4">You need to be logged in to add your story.</p>
            <Link 
              to="/auth"
              className="text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
              style={{ backgroundColor: '#bf092f' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8b0621'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#bf092f'}
            >
              Go to Login
            </Link>
        </div>
    );
  }
  
  if (step === 'upload') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
           <div>
            <h1 className="text-3xl font-bold text-brand-navy mb-2">Add Your Story: Step 1 of 2</h1>
            <p className="text-slate-600 dark:text-slate-300">Start by uploading a document, audio file, writing your story directly, or recording it with your microphone.</p>
          </div>

          <div className="flex justify-center flex-wrap gap-4">
            {/* Upload File Button */}
            <div className="relative group">
              <button 
                onClick={() => setInputType('file')} 
                className={`p-4 rounded-lg transition-colors ${inputType === 'file' ? 'bg-brand-navy text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Upload File
              </span>
            </div>

            {/* Write Text Button */}
            <div className="relative group">
              <button 
                onClick={() => setInputType('text')} 
                className={`p-4 rounded-lg transition-colors ${inputType === 'text' ? 'bg-brand-navy text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Write Text
              </span>
            </div>
            
            {/* Record Audio Button */}
            <div className="relative group">
              <button 
                onClick={() => setInputType('record')} 
                className={`p-4 rounded-lg transition-colors ${inputType === 'record' ? 'bg-brand-navy text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Record Audio
              </span>
            </div>
          </div>

          {inputType === 'file' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Story File (Document or Audio)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-slate-600 dark:text-slate-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-brand-navy focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-navy" onMouseEnter={(e) => e.currentTarget.style.color = '#bf092f'} onMouseLeave={(e) => e.currentTarget.style.color = '#16476A'}>
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx,text/plain,audio/*" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">PDF, DOC, TXT, MP3, WAV up to 25MB</p>
                </div>
              </div>
              {file && !isLoading && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Selected file: <span className="font-medium">{file.name}</span>. Click Next to continue.</p>}
            </div>
          )}

          {inputType === 'text' && (
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="text-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Write your story</label>
                <button 
                  onClick={() => setTextContent('')} 
                  className="text-sm font-medium text-brand-navy hover:text-red-500 transition-colors px-3 py-1"
                >
                  Clear
                </button>
              </div>
              <textarea 
                id="text-input" 
                value={textContent} 
                onChange={handleTextChange} 
                rows={12} 
                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-navy focus:border-brand-navy bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                placeholder="Start writing your story here..."
              ></textarea>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex justify-between items-center">
                <span>
                  {`Characters: ${textContent.length} | Words: ${textContent.trim() ? textContent.trim().split(/\s+/).length : 0}`}
                </span>
                <span>
                  {`Reading time: ~${Math.ceil((textContent.trim() ? textContent.trim().split(/\s+/).length : 0) / 200)} min`}
                </span>
              </div>
            </div>
          )}

          {inputType === 'record' && (
            <div className="text-center space-y-4 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md">
              {!audioUrl ? (
                <div className="space-y-4">
                  <div className="flex justify-center items-center gap-4">
                    {!isRecording ? (
                       <button onClick={startRecording} className="px-6 py-3 rounded-full text-white font-bold text-lg bg-green-600 hover:bg-green-700">
                         Start Recording
                       </button>
                    ) : (
                      <>
                        <button onClick={isPaused ? resumeRecording : pauseRecording} className={`px-4 py-2 rounded-md text-white font-semibold ${isPaused ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
                          {isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button onClick={stopRecording} className="px-4 py-2 rounded-md text-white font-semibold bg-red-600 hover:bg-red-700">
                          Stop
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-slate-500">
                    {isRecording ? `Recording... ${new Date(recordingTime * 1000).toISOString().substr(14, 5)}` : 'Click "Start Recording" to begin'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                    <p className="font-semibold">Recording Complete</p>
                    <audio src={audioUrl} controls className="w-full" />
                    <div className="flex justify-center gap-4">
                      <button onClick={resetRecording} className="px-4 py-2 rounded-md text-sm font-medium bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">
                        Record Again
                      </button>
                    </div>
                </div>
              )}
              
              {isTranscribing && (
                <div className="mt-4 text-center">
                  <LoadingSpinner />
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Transcribing your recording...</p>
                </div>
              )}

              {content && !isLoading && (
                <div className="text-left">
                  <label htmlFor="transcript" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Your Transcript</label>
                  <textarea id="transcript" value={content} onChange={e => setContent(e.target.value)} rows={8} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-slate-50 dark:bg-slate-900 dark:bg-opacity-50" />
                  <p className="text-xs text-slate-500 mt-1">Review your transcript, then click 'Next' to proceed.</p>
                </div>
              )}
            </div>
          )}
          
           <div className="text-center pt-4">
            <button 
              onClick={handleNext} 
              disabled={isLoading || (inputType === 'record' && !content)} 
              className="text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 disabled:bg-slate-400" 
              style={{ backgroundColor: '#bf092f' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8b0621'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#bf092f'}>
              Next
            </button>
          </div>
          
           {isLoading && (
            <div className="mt-4 text-center">
              <LoadingSpinner />
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Analyzing your content with AI... this may take a moment.
              </p>
            </div>
          )}
          
           {error && <p className="text-sm text-red-600 text-center">{error}</p>}
           
           {file && !isLoading && inputType === 'file' && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Selected file: <span className="font-medium">{file.name}</span></p>}
        </div>
      </div>
    );
  }


  return ( // Step 2: Details
    <div className="max-w-4xl mx-auto">
      <form onSubmit={(e) => e.preventDefault()} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy mb-2">Add Your Story: Step 2 of 2</h1>
          <p className="text-slate-600 dark:text-slate-300">The AI has processed your file. Review the generated content, add your story details, and then either save it as a draft or publish it directly.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Story Title</label>
              <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-navy focus:border-brand-navy bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required />
            </div>
             <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category (comma-separated)</label>
              <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Personal, Fiction, History" className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-navy focus:border-brand-navy bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required />
            </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Short Description</label>
          <textarea id="description" value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-navy focus:border-brand-navy bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required />
        </div>
        
        <div>
          <label htmlFor="banner-image" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Banner Image</label>
          <input type="file" id="banner-image" onChange={e => setBannerImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-navy/10 file:text-brand-navy hover:file:bg-brand-navy/20"/>
        </div>

        <hr className="dark:border-slate-700"/>

        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">AI-Generated Content</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">You can edit the extracted content, summary, and tags below.</p>
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Extracted Story Content / Transcript</label>
          <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={10} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-navy focus:border-brand-navy bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white" />
        </div>
        
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-slate-700 dark:text-slate-300">AI-Generated Summary</label>
          <textarea id="summary" value={summary} onChange={e => setSummary(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-navy focus:border-brand-navy bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white" />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300">AI-Suggested Tags (comma-separated)</label>
          <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-navy focus:border-brand-navy bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t dark:border-slate-700">
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, 'pending_review')} 
              disabled={isLoading} 
              className="flex-1 justify-center py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none disabled:bg-slate-200 dark:disabled:bg-slate-500"
            >
              {isLoading ? <LoadingSpinner/> : 'Save as Draft'}
            </button>
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, 'published')} 
              disabled={isLoading} 
              className="flex-1 justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none disabled:bg-slate-400"
              style={{ backgroundColor: '#bf092f' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8b0621'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#bf092f'}
            >
              {isLoading ? <LoadingSpinner/> : 'Publish Story'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddStoryPage;

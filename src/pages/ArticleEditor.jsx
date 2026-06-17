import React, { useState, useRef } from 'react';
import { Save, Image as ImageIcon, X, Send, Eye, Type, Tag, ChevronLeft, Upload, FileVideo, CheckCircle2, User, Zap, Star } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createBlog, updateBlog, getOneBlog, uploadInlineMedia, saveDraft, getDrafts } from '../../services/api';
import { useSnackbar } from 'notistack';
import { useEffect, useCallback } from 'react';
import AICoAuthorPanel from '../components/AICoAuthorPanel';

export default function ArticleEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);
  const authorInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const inlineImageRef = useRef(null)
  const inlineVideoRef = useRef(null)
  const contentRef = useRef(null);
  const autoSaveTimer = useRef(null);

  const [draftId, setDraftId] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [authorDragActive, setAuthorDragActive] = useState(false);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
 const [uploadingImage, setUploadingImage] = useState(false);
const [uploadingVideo, setUploadingVideo] = useState(false);
  const [preview, setPreview] = useState(null);
  const [authorPreview, setAuthorPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [draftsList, setDraftsList] = useState([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);

  const openDraftsModal = async () => {
    setIsDraftModalOpen(true);
    setIsLoadingDrafts(true);
    try {
      const res = await getDrafts();
      if (res.success) {
        setDraftsList(res.data || []);
      }
    } catch (err) {
      enqueueSnackbar('Failed to fetch drafts', { variant: 'error' });
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  const loadDraft = (draft) => {
    setDraftId(draft._id);
    setFormData({
      title: draft.title || '',
      excerpt: draft.excerpt || '',
      category: draft.category || 'Basketball',
      subcategory: draft.subcategory || '',
      author: draft.author || '',
      content: draft.content || '',
      tags: draft.tags || '',
      featured: draft.featured || false,
      editorsPick: draft.editorsPick || false,
      breaking: draft.breaking || false,
      quote: draft.quote || '',
      videoUrl: draft.videoUrl || ''
    });
    setIsDraftModalOpen(false);
    enqueueSnackbar('Draft loaded successfully', { variant: 'success' });
  };

  const [files, setFiles] = useState({
    coverImg: null,
    authorImg: null,
    videoFile: null
  });

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: 'Basketball',
    subcategory: '',
    author: '',
    content: '',
    tags: '',
    featured: false,
    editorsPick: false,
    breaking: false,
    quote: '',
    videoUrl: ''
  });

  const categories = ["Faith","Christ", "Hoops", "Chelsea","Sports","Animals", "Tech", "Film", "VFX", "Basketball Film", "Finance", "Opinion", "Travel"];
  const subcategories = {
    "Sports": [ "Football", "Basketball", "Gym", "World Cup", "NBA Finals"],
  };

  // Load draft on mount — localStorage as fallback
  useEffect(() => {
    if (!isEditing) {
      // Fallback: restore from localStorage
      const savedDraft = localStorage.getItem('article_draft');
      if (savedDraft) {
        try {
          setFormData(JSON.parse(savedDraft));
        } catch (_) {}
      }
    } else {
      // Fetch blog data for editing
      const fetchBlog = async () => {
        try {
          const res = await getOneBlog(id);
          if (res.success) {
            const blog = res.data;
            setFormData({
              title: blog.title || '',
              excerpt: blog.excerpt || '',
              category: blog.category || 'Technology',
              subcategory: blog.subcategory || '',
              author: blog.author || '',
              content: Array.isArray(blog.content)
              ? blog.content.map(block => {
                if (block.type === 'text')  return block.value;
                if (block.type === 'image') return `![${block.alt || 'image'}](${block.url})`;
                if (block.type === 'video') return `!video[${block.caption || 'video'}](${block.url})`;
                if (block.type === 'embed') return `!embed[${block.caption || 'embed'}](${block.url})`;
                return '';
               }).join('\n\n')
             : blog.content || '',
              tags: blog.tags || '',
              featured: blog.featured || false,
              editorsPick: blog.editorsPick || false,
              breaking: blog.breaking || false,
              quote: blog.quote || '',
              videoUrl: blog.videoUrl || ''
            });
            if (blog.image) setPreview({ url: blog.image, type: 'image' });
            if (blog.authorImages?.webp) setAuthorPreview({ url: blog.authorImages.webp, type: 'image' });
            if (blog.videoUrl) setVideoPreview({ url: blog.videoUrl, type: 'video' });
          }
        } catch (err) {
          enqueueSnackbar('Failed to fetch article data', { variant: 'error' });
        }
      };
      fetchBlog();
    }
  }, [id, isEditing, enqueueSnackbar]);

  // Save draft to local storage on change
  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem('article_draft', JSON.stringify(formData));
    }
  }, [formData, isEditing]);

  // Auto-save draft to DB (debounced — 3s after user stops typing)
  const autoSaveDraft = useCallback(async (data, currentDraftId) => {
    if (isEditing) return; // Don't auto-save when editing a published post
    try {
      setIsSavingDraft(true);
      const payload = { ...data, id: currentDraftId || undefined };
      const res = await saveDraft(payload);
      if (res.success && res.data?._id && !currentDraftId) {
        setDraftId(res.data._id);
      }
    } catch (err) {
      // Silent fail — localStorage is the backup
      console.warn('Draft auto-save failed:', err.message);
    } finally {
      setIsSavingDraft(false);
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      autoSaveDraft(formData, draftId);
    }, 3000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [formData, draftId, isEditing, autoSaveDraft]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

 const insertAtCursor = (text) => {
  const textarea = contentRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart ?? formData.content.length;
  const end = textarea.selectionEnd ?? formData.content.length;

  const before = formData.content.slice(0, start);
  const after = formData.content.slice(end);

  const updated = before + text + after;

  setFormData((prev) => ({
    ...prev,
    content: updated,
  }));

  requestAnimationFrame(() => {
    textarea.focus();
    const pos = start + text.length;
    textarea.setSelectionRange(pos, pos);
  });
};;

  const handleFile = (file, type) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'cover') {
        setPreview({
          url: e.target.result,
          type: file.type.startsWith('video') ? 'video' : 'image',
          name: file.name
        });
        setFiles(prev => ({ ...prev, coverImg: file }));
      } else if (type === 'author') {
        setAuthorPreview({
          url: e.target.result,
          name: file.name
        });
        setFiles(prev => ({ ...prev, authorImg: file }));
      } else if (type === 'video') {
        setVideoPreview({
          url: e.target.result,
          type: 'video',
          name: file.name
        });
        setFiles(prev => ({ ...prev, videoFile: file }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (type === 'cover') setDragActive(true);
      else if (type === 'author') setAuthorDragActive(true);
      else if (type === 'video') setVideoDragActive(true);
    } else if (e.type === "dragleave") {
      if (type === 'cover') setDragActive(false);
      else if (type === 'author') setAuthorDragActive(false);
      else if (type === 'video') setVideoDragActive(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setAuthorDragActive(false);
    setVideoDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], type);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Detailed validation
    const missingFields = [];
    if (!formData.title) missingFields.push("Title");
    if (!formData.excerpt) missingFields.push("Excerpt");
    if (!formData.content) missingFields.push("Content");
    if (!formData.author) missingFields.push("Author Name");
    if (!isEditing && !files.coverImg) missingFields.push("Cover Image");

    if (missingFields.length > 0) {
      enqueueSnackbar(`Missing required fields: ${missingFields.join(", ")}`, { variant: 'warning' });
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('excerpt', formData.excerpt);
      data.append('content', formData.content);
      data.append('category', formData.category);
      data.append('subcategory', formData.subcategory);
      data.append('author', formData.author);
      data.append('quote', formData.quote);
      data.append('featured', formData.featured);
      data.append('editorsPick', formData.editorsPick);
      data.append('breaking', formData.breaking);
      data.append('videoUrl', formData.videoUrl);
      data.append('date', new Date().toISOString());

      if (files.coverImg) data.append('file', files.coverImg);
      if (files.authorImg) data.append('authorImageFile', files.authorImg);
      if (files.videoFile) data.append('videoFile', files.videoFile);

      setIsPublishing(true);
      if (isEditing) {
        await updateBlog(id, data);
        enqueueSnackbar('Article updated successfully!', { variant: 'success' });
      } else {
        await createBlog(data);
        enqueueSnackbar('Article published successfully!', { variant: 'success' });
        localStorage.removeItem('article_draft'); // Clear draft on success
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Submit error:', err);
      const errorMsg = err.response?.data?.message || err.message || "An unknown error occurred";
      enqueueSnackbar(`${isEditing ? 'Update' : 'Publish'} failed: ${errorMsg}`, { variant: 'error' });
    } finally {
      setIsPublishing(false);
    }

  };
const handleInlineImageUpload = async (file) => {
  if (!file) return;

  try {
    setUploadingImage(true);

    // Uses api.js uploadInlineMedia — Axios interceptor auto-attaches Bearer token
    const result = await uploadInlineMedia(file);

    if (!result?.success) {
      enqueueSnackbar(result?.message || "Image upload failed", { variant: "error" });
      return;
    }

    const url = result.urls?.webp || result.urls?.url;
    if (!url) throw new Error("No image URL returned");

    insertAtCursor(`![image](${url})`);

  } catch (err) {
    enqueueSnackbar(err?.response?.data?.message || err.message, { variant: "error" });
  } finally {
    setUploadingImage(false);
  }
};

const handleInlineVideoUpload = async (file) => {
  if (!file) return;

  try {
    setUploadingVideo(true);

    // Uses api.js uploadInlineMedia — Axios interceptor auto-attaches Bearer token
    const result = await uploadInlineMedia(file);

    if (!result?.success) {
      enqueueSnackbar(result?.message || "Video upload failed", { variant: "error" });
      return;
    }

    const url = result.urls?.url;
    if (!url) throw new Error("No video URL returned");

    insertAtCursor(`!video[video](${url})`);

  } catch (err) {
    enqueueSnackbar(err?.response?.data?.message || err.message, { variant: "error" });
  } finally {
    setUploadingVideo(false);
  }
};

const handleEmbedInsert = () => {
  const url = prompt("Enter embed URL (YouTube, etc):");
  if (!url) return;

  insertAtCursor(`!embed[embed](${url})`);
};
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border z-10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-muted rounded-full transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold font-righteous uppercase tracking-wider">{isEditing ? 'Edit Article' : 'New Article'}</h1>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing && (
              <span className="text-xs text-muted-foreground font-medium">
                {isSavingDraft ? 'Saving draft...' : draftId ? '✓ Draft saved' : ''}
              </span>
            )}
            {!isEditing && (
              <button
                onClick={openDraftsModal}
                type="button"
                className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-bold transition-all shadow-sm border border-border hover:bg-muted"
              >
                Drafts
              </button>
            )}
            <button
              onClick={() => handleSubmit()}
              disabled={isPublishing}
              className={`flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold transition-all shadow-lg shadow-primary/20 ${isPublishing ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Publish
                </>
              )}
            </button>

          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6 sm:p-10">
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-10" onSubmit={handleSubmit}>
          <div className="lg:col-span-2 space-y-8">
           <input
           ref={inlineImageRef}
           type="file"
           className="hidden"
           accept="image/*"
           onChange={(e) => handleInlineImageUpload(e.target.files[0])}
           />
           
           <input
           ref={inlineVideoRef}
           type="file"
           className="hidden"
           accept="video/*"
           onChange={(e) => handleInlineVideoUpload(e.target.files[0])}
           />
           
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Article Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a catchy title..."
                className="w-full bg-transparent text-4xl sm:text-5xl font-alfa border-none focus:ring-0 placeholder:text-muted/50 p-0"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Type size={18} />
                <span className="text-sm font-bold font-changa uppercase">Excerpt</span>
              </div>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Write a brief summary of your article..."
                className="w-full bg-muted/30 border border-border rounded-2xl p-4 text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px] resize-none"
              />
            </div>
            <div className="flex gap-3 mb-2">
  <button
    type="button"
    disabled={uploadingImage}
    onClick={() => inlineImageRef.current.click()}
    className="px-3 py-1 bg-red-600 rounded cursor-pointer"
  >
     Image
  </button>

  <button
    type="button"
    disabled={uploadingVideo}
    onClick={() => inlineVideoRef.current.click()}
    className="px-3 py-1 bg-red-600 rounded cursor-pointer"
  >
     Video
  </button>

  <button
    type="button"
    onClick={handleEmbedInsert}
    className="px-3 py-1 bg-red-600 rounded cursor-pointer"
  >
     Embed
  </button>

  {(uploadingVideo || uploadingImage) && (
    <span className="text-sm text-muted-foreground">
      Uploading...
    </span>
  )}
</div>
            <div className="space-y-4 pt-4 border-t border-border">
              <textarea
                ref={contentRef}
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Start telling your story here..."
                className="w-full bg-transparent border-none focus:ring-0 text-xl font-sans leading-relaxed min-h-[400px] p-0 resize-none"
              />
              <p className="text-lg text-red-600 mt-2">
                Tip: ![alt](url) • !video[caption](url) • !embed[caption](url)
                </p>
            </div>


            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm font-bold font-changa uppercase">Pull Quote</span>
              </div>
              <textarea
                name="quote"
                value={formData.quote}
                onChange={handleChange}
                placeholder="Enter a key highlight or quote..."
                className="w-full bg-muted/20 border border-border rounded-xl p-4 text-md italic focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px] resize-none"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={18} className="text-primary" />
                <h3 className="font-bold font-righteous uppercase tracking-tighter">Visibility & Story</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className={formData.featured ? "text-emerald-500" : "text-muted-foreground"} />
                    <span className="text-xs font-bold uppercase">Featured Story</span>
                  </div>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <Star size={16} className={formData.editorsPick ? "text-amber-500" : "text-muted-foreground"} />
                    <span className="text-xs font-bold uppercase">Editor's Pick</span>
                  </div>
                  <input
                    type="checkbox"
                    name="editorsPick"
                    checked={formData.editorsPick}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className={formData.breaking ? "text-red-500 animate-pulse" : "text-muted-foreground"} />
                    <span className="text-xs font-bold uppercase text-red-600 dark:text-red-400">Breaking News</span>
                  </div>
                  <input
                    type="checkbox"
                    name="breaking"
                    checked={formData.breaking}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-md border-red-500/30 text-red-600 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block">Primary Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => {
                      handleChange(e);
                      // Clear subcategory if main category changes
                      setFormData(prev => ({ ...prev, subcategory: '' }));
                    }}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {subcategories[formData.category] && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block">Subcategory</label>
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories[formData.category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileVideo size={18} className="text-primary" />
                <h3 className="font-bold font-righteous uppercase tracking-tighter">Video Story (Optional)</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block">Video URL (YouTube/Vimeo/Direct)</label>
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="relative border-t border-border/50 pt-4 mt-2">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 bg-card relative z-10">Or Upload Video</span>
                  </div>
                  <div
                    onDragEnter={(e) => handleDrag(e, 'video')}
                    onDragLeave={(e) => handleDrag(e, 'video')}
                    onDragOver={(e) => handleDrag(e, 'video')}
                    onDrop={(e) => handleDrop(e, 'video')}
                    className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center ${videoDragActive ? 'border-primary bg-primary/5 scale-[0.98]' : 'border-border hover:border-primary/50'}`}
                    onClick={() => videoInputRef.current.click()}
                  >
                    <input
                      ref={videoInputRef}
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={(e) => handleFile(e.target.files[0], 'video')}
                    />
                    {videoPreview ? (
                      <div className="flex items-center gap-3 w-full">
                        <FileVideo className="text-primary" size={24} />
                        <div className="text-left overflow-hidden">
                          <p className="text-[10px] font-bold text-emerald-500 uppercase">Video Attached</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{videoPreview.name || 'Video Attached'}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={18} className="text-muted-foreground mb-1" />
                        <p className="text-xs font-bold uppercase tracking-tighter">Upload Video</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={18} className="text-primary" />
                <h3 className="font-bold font-righteous uppercase tracking-tighter">Feature Media</h3>
              </div>

              <div className="space-y-4">
                <div
                  onDragEnter={(e) => handleDrag(e, 'cover')}
                  onDragLeave={(e) => handleDrag(e, 'cover')}
                  onDragOver={(e) => handleDrag(e, 'cover')}
                  onDrop={(e) => handleDrop(e, 'cover')}
                  className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center ${dragActive ? 'border-primary bg-primary/5 scale-[0.98]' : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => handleFile(e.target.files[0], 'cover')}
                  />

                  {preview ? (
                    <div className="space-y-2 w-full">
                      {preview.type === 'video' ? (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                          <FileVideo size={48} className="text-white/50" />
                        </div>
                      ) : (
                        <img src={preview.url} className="w-full aspect-video object-cover rounded-lg" alt="Preview" />
                      )}
                      <div className="flex items-center justify-center gap-1 text-emerald-500 text-xs font-bold">
                        <CheckCircle2 size={12} />
                        Cover Selected
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-muted rounded-full mb-3">
                        <Upload size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-bold">Cover Image</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Drag and drop or click</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User size={18} className="text-primary" />
                <h3 className="font-bold font-righteous uppercase tracking-tighter">Author Info</h3>
              </div>
              <div className="space-y-4">
                <div
                  onDragEnter={(e) => handleDrag(e, 'author')}
                  onDragLeave={(e) => handleDrag(e, 'author')}
                  onDragOver={(e) => handleDrag(e, 'author')}
                  onDrop={(e) => handleDrop(e, 'author')}
                  className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center ${authorDragActive ? 'border-primary bg-primary/5 scale-[0.98]' : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => authorInputRef.current.click()}
                >
                  <input
                    ref={authorInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFile(e.target.files[0], 'author')}
                  />

                  {authorPreview ? (
                    <div className="flex items-center gap-3 w-full">
                      <img src={authorPreview.url} className="w-12 h-12 rounded-full object-cover border border-border" alt="Author" />
                      <div className="text-left">
                        <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
                          <CheckCircle2 size={10} />
                          Avatar Set
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{authorPreview.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-muted rounded-full mb-2">
                        <Upload size={18} className="text-muted-foreground" />
                      </div>
                      <p className="text-xs font-bold">Author Picture</p>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Author Name"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* AI Co-Author integration */}
      <AICoAuthorPanel draftContent={formData.content} />

      {/* Drafts Modal */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-righteous uppercase">Select Draft</h3>
              <button onClick={() => setIsDraftModalOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {isLoadingDrafts ? (
                <div className="text-center p-4 text-muted-foreground animate-pulse">Loading drafts...</div>
              ) : draftsList.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">No drafts found.</div>
              ) : (
                draftsList.map(draft => (
                  <div 
                    key={draft._id} 
                    onClick={() => loadDraft(draft)}
                    className="p-4 border border-border rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <h4 className="font-bold text-sm mb-1 truncate">{draft.title || 'Untitled'}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      {new Date(draft.updatedAt || draft.date).toLocaleDateString()} • {draft.category}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

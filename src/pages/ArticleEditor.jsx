import React, { useState, useRef } from 'react';
import { Save, Image as ImageIcon, X, Send, Eye, Type, Tag, ChevronLeft, Upload, FileVideo, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ArticleEditor() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: 'Technology',
    author: '',
    authorImg: '',
    coverImg: '',
    content: '',
    tags: ''
  });

  const categories = ["Technology", "Business", "Entertainment", "Sports", "Health", "Science", "World"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview({
        url: e.target.result,
        type: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name
      });
      // In a real app, we'd upload here. For now, we just set a mock URL
      setFormData(prev => ({ ...prev, coverImg: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Posting article:', formData);
    alert('Article posted successfully (Mock)!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Top Nav */}
      <div className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border z-10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-muted rounded-full transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold font-righteous uppercase tracking-wider">New Article</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
              <Eye size={18} />
              Preview
            </button>
            <button 
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              <Send size={18} />
              Publish
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6 sm:p-10">
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-10" onSubmit={(e) => e.preventDefault()}>
          {/* Main Editor Section */}
          <div className="lg:col-span-2 space-y-8">
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

            <div className="space-y-4 pt-4 border-t border-border">
               <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Start telling your story here..."
                className="w-full bg-transparent border-none focus:ring-0 text-xl font-sans leading-relaxed min-h-[400px] p-0 resize-none"
              />
            </div>
          </div>

          {/* Sidebar / Settings Section */}
          <div className="space-y-8">
            {/* Category selection */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={18} className="text-primary" />
                <h3 className="font-bold font-righteous uppercase tracking-tighter">Categorization</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block">Primary Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase mb-2 block">Tags (Comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="AI, tech, future..."
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Media/Images Drag and Drop */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={18} className="text-primary" />
                <h3 className="font-bold font-righteous uppercase tracking-tighter">Feature Media</h3>
              </div>
              
              <div className="space-y-4">
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center ${
                    dragActive ? 'border-primary bg-primary/5 scale-[0.98]' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={onButtonClick}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={(e) => handleFile(e.target.files[0])}
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
                        File Selected
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate px-4">{preview.name}</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-muted rounded-full mb-3 group-hover:bg-primary/20 transition-colors">
                        <Upload size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm font-bold">Drag & drop or <span className="text-primary">browse</span></p>
                      <p className="text-[10px] text-muted-foreground mt-1">High-quality JPG, PNG, or MP4 supported</p>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">Or paste cover URL</label>
                  <input
                    type="text"
                    name="coverImg"
                    value={formData.coverImg}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value) setPreview({ url: e.target.value, type: 'image', name: 'External Link' });
                      else setPreview(null);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold font-righteous uppercase tracking-tighter mb-4">Author Details</h3>
              <div className="space-y-4">
                <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Author Name"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <input
                    type="text"
                    name="authorImg"
                    value={formData.authorImg}
                    onChange={handleChange}
                    placeholder="Author Avatar URL"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

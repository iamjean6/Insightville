import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FilePlus, MessageSquare, Eye, Heart, List, Settings, Trash2, Edit3, Search, Star, Zap, FileVideo, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getBlogs, deleteBlog, updateBlogStatus, getMedia, logout } from '../../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchComments();
    fetchMedia();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchMedia = async () => {
    try {
      const response = await getMedia();
      if (response && response.data) setMedia(response.data);
    } catch (err) {
      console.warn("Failed to fetch media", err);
    }
  };

  const fetchComments = async () => {
    try {
      const { getAllComments } = await import('../../services/api');
      const response = await getAllComments();
      if (response && response.data) setComments(response.data);
    } catch (err) {
      console.warn("Failed to fetch comments", err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getBlogs();
      if (response && response.data) {
        setPosts(response.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load posts.");
      // Fallback to mock data if API fails
      setPosts([
        { _id: '1', title: 'The Future of AI in Modern Journalism', date: new Date().toISOString(), category: 'Technology', views: 1200, featured: true, editorsPick: false },
        { _id: '2', title: 'Sustainable Cities: Post-Pandemic Urban Design', date: new Date().toISOString(), category: 'Architecture', views: 850, featured: false, editorsPick: true },
        { _id: '3', title: 'The Psychology of Color in Brand Identity', date: new Date().toISOString(), category: 'Design', views: 2400, featured: true, editorsPick: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await deleteBlog(id);
        if (response.status === 'success') {
          setPosts(posts.filter(post => post._id !== id));
        } else {
          alert("Delete failed: " + (response.message || "Unknown error"));
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "An unknown error occurred";
        alert("Delete failed: " + errorMsg);
      }
    }
  };

  const handleToggleStatus = async (id, field, currentValue) => {
    try {
      const statusData = { [field]: !currentValue };
      await updateBlogStatus(id, statusData);
      setPosts(posts.map(post => 
        post._id === id ? { ...post, [field]: !currentValue } : post
      ));
    } catch (err) {
      alert("Status update failed: " + err.message);
    }
  };

  const handleDeleteComment = async (id) => {
    if (confirm('Delete this comment?')) {
      try {
        const { deleteComment } = await import('../../services/api');
        await deleteComment(id);
        setComments(comments.filter(c => c._id !== id));
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  const stats = [
    { 
      label: 'Total Views', 
      value: posts.reduce((acc, curr) => acc + (curr.views || 0), 0).toLocaleString(), 
      icon: <Eye className="text-cyan-400" size={20} />, 
      trend: '+12%' 
    },
    { 
      label: 'Total Likes', 
      value: posts.reduce((acc, curr) => acc + (curr.likes || 0), 0).toLocaleString(), 
      icon: <Heart className="text-pink-500" size={20} />, 
      trend: '+5%' 
    },
    { label: 'Comments', value: comments.length.toString(), icon: <MessageSquare className="text-purple-400" size={20} />, trend: '+8%' },
    { label: 'Articles', value: posts.length.toString(), icon: <List className="text-yellow-400" size={20} />, trend: '+2' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-alfa tracking-tight mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground font-changa uppercase tracking-widest text-sm">Welcome back, Editor</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-3 rounded-xl font-bold hover:bg-destructive hover:text-destructive-foreground transition-all"
            >
              Logout
            </button>
            <Link 
              to="/admin/new-post"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              <FilePlus size={20} />
              Create Post
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-muted rounded-xl">
                  {stat.icon}
                </div>
                <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                  {stat.trend}
                </span>
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm font-changa uppercase mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold font-sans tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content Tabs */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
          <div className="flex border-b border-border bg-muted/30 p-1 flex-wrap">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-8 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'overview' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('manage')}
              className={`px-8 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'manage' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Manage Blogs
            </button>
            <button 
              onClick={() => setActiveTab('media')}
              className={`px-8 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'media' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Media
            </button>
            <button 
              onClick={() => setActiveTab('comments')}
              className={`px-8 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'comments' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Comments
            </button>
            <button 
              onClick={() => setActiveTab('layout')}
              className={`px-8 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'layout' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Layout
            </button>
          </div>
          
          <div className="p-4 sm:p-8">
            {activeTab === 'overview' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-righteous tracking-wide">Recent Activity</h2>
                </div>
                
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post._id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-colors border border-transparent hover:border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0">
                            <img src={post.image || `https://picsum.photos/seed/${post._id}/200`} alt="thumb" className="w-full h-full object-cover opacity-80" />
                        </div>
                        <div>
                          <h4 className="font-bold mb-0.5 leading-snug truncate max-w-[200px] sm:max-w-md">{post.title}</h4>
                          <p className="text-muted-foreground text-xs">{new Date(post.date).toLocaleDateString()} • {post.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] hidden sm:block border px-2 py-0.5 rounded-full font-bold uppercase ${post.featured ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                          {post.featured ? 'Featured' : 'Standard'}
                        </span>
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Views</p>
                            <p className="font-bold text-sm">{post.views || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'manage' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <h2 className="text-2xl font-righteous tracking-wide">Manage Content</h2>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search articles..." 
                      className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="pb-4 pr-4">Article</th>
                        <th className="pb-4 px-4 hidden md:table-cell">Category</th>
                        <th className="pb-4 px-4">Status</th>
                        <th className="pb-4 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {posts.map((post) => (
                        <tr key={post._id} className="group hover:bg-muted/30 transition-colors">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                                <img src={post.image || `https://picsum.photos/seed/${post._id}/100`} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-bold text-sm line-clamp-1">{post.title}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 hidden md:table-cell">
                            <span className="text-xs text-muted-foreground uppercase font-bold">{post.category}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleToggleStatus(post._id, 'featured', post.featured)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${post.featured ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-muted text-muted-foreground hover:bg-emerald-500/20'}`}
                                >
                                  <Zap size={10} />
                                  Featured
                                </button>
                                <button 
                                  onClick={() => handleToggleStatus(post._id, 'editorsPick', post.editorsPick)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${post.editorsPick ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-muted text-muted-foreground hover:bg-amber-500/20'}`}
                                >
                                  <Star size={10} />
                                  Editor's Pick
                                </button>
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground">{post.views || 0} views • {post.likes || 0} likes</span>
                            </div>
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link 
                                to={`/admin/edit/${post._id}`}
                                className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-muted-foreground" 
                                title="Edit"
                              >
                                <Edit3 size={18} />
                              </Link>
                              <button 
                                onClick={() => handleDelete(post._id)}
                                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors text-muted-foreground" 
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-righteous tracking-wide">Media Library</h2>
                </div>
                {media.length === 0 ? (
                  <div className="p-12 text-center bg-muted/20 border border-dashed border-border rounded-3xl">
                     <ImageIcon size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                     <p className="font-bold text-muted-foreground">No media assets found</p>
                     <p className="text-xs text-muted-foreground/60 mt-1">Images from blogs will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {media.map((item, idx) => (
                      <div key={idx} className="group relative bg-muted rounded-2xl overflow-hidden aspect-square border border-border shadow-sm hover:shadow-md transition-all">
                          <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.title} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                              <p className="text-white text-[10px] font-bold uppercase truncate mb-1">{item.title}</p>
                              <div className="flex gap-2">
                                 {item.videoUrl && <span className="p-1.5 bg-primary/30 rounded-lg text-white"><FileVideo size={12} /></span>}
                                 <span className="p-1.5 bg-cyan-500/30 rounded-lg text-white"><ImageIcon size={12} /></span>
                              </div>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-righteous tracking-wide mb-6">User Feedback</h2>
                {comments.length === 0 ? (
                  <div className="p-12 text-center bg-muted/20 border border-dashed border-border rounded-3xl">
                    <MessageSquare size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="font-bold text-muted-foreground">No comments yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="p-5 bg-card border border-border rounded-2xl flex justify-between items-start hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                               {(comment.userId?.name || 'A')[0]}
                             </div>
                             <span className="font-bold text-sm text-foreground">{comment.userId?.name || 'Anonymous User'}</span>
                             <span className="text-[10px] text-muted-foreground uppercase font-bold px-2">on</span>
                             <span className="text-xs font-bold text-primary hover:underline cursor-pointer line-clamp-1">{comment.blogId?.title || 'Unknown Post'}</span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed italic mt-1 font-serif">"{comment.comment}"</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteComment(comment._id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                          title="Delete Comment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-righteous tracking-wide">Homepage Layout</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Featured Selection */}
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-emerald-500 font-righteous">
                      <Zap size={20} /> Featured Stories
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4 font-changa uppercase">Top slot articles</p>
                    <div className="space-y-2">
                      {posts.filter(p => p.featured).map(post => (
                        <div key={post._id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl shadow-sm">
                          <span className="text-xs font-bold truncate max-w-[200px]">{post.title}</span>
                          <button onClick={() => handleToggleStatus(post._id, 'featured', true)} className="text-[10px] font-bold text-destructive hover:bg-destructive/10 px-2 py-1 rounded-lg uppercase transition-colors">Remove</button>
                        </div>
                      ))}
                      {posts.filter(p => p.featured).length === 0 && <p className="text-[10px] italic text-muted-foreground">No featured posts</p>}
                    </div>
                  </div>
                  
                  {/* Editor's Pick Selection */}
                  <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-amber-500 font-righteous">
                      <Star size={20} /> Editor's Picks
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4 font-changa uppercase">Handpicked highlights</p>
                    <div className="space-y-2">
                      {posts.filter(p => p.editorsPick).map(post => (
                        <div key={post._id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl shadow-sm">
                          <span className="text-xs font-bold truncate max-w-[200px]">{post.title}</span>
                          <button onClick={() => handleToggleStatus(post._id, 'editorsPick', true)} className="text-[10px] font-bold text-destructive hover:bg-destructive/10 px-2 py-1 rounded-lg uppercase transition-colors">Remove</button>
                        </div>
                      ))}
                      {posts.filter(p => p.editorsPick).length === 0 && <p className="text-[10px] italic text-muted-foreground">No editor's picks</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

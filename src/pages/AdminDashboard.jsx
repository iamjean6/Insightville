import React, { useState } from 'react';
import { LayoutDashboard, FilePlus, MessageSquare, Eye, Heart, List, Settings, Trash2, Edit3, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([
    { id: 1, title: 'The Future of AI in Modern Journalism', date: '2 days ago', category: 'Technology', views: '1.2k', status: 'Live' },
    { id: 2, title: 'Sustainable Cities: Post-Pandemic Urban Design', date: '5 days ago', category: 'Architecture', views: '850', status: 'Draft' },
    { id: 3, title: 'The Psychology of Color in Brand Identity', date: '1 week ago', category: 'Design', views: '2.4k', status: 'Live' },
    { id: 4, title: 'Exploring the Metaverse: A New Digital Frontier', date: '2 weeks ago', category: 'Technology', views: '3.1k', status: 'Live' },
  ]);

  const stats = [
    { label: 'Total Views', value: '12.4k', icon: <Eye className="text-cyan-400" />, trend: '+12%' },
    { label: 'Total Likes', value: '843', icon: <Heart className="text-pink-500" />, trend: '+5%' },
    { label: 'Comments', value: '156', icon: <MessageSquare className="text-purple-400" />, trend: '+8%' },
    { label: 'Articles', value: posts.length, icon: <List className="text-yellow-400" />, trend: '+2' },
  ];

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(post => post.id !== id));
    }
  };

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
          <div className="flex border-b border-border bg-muted/30 p-1">
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
            <button className="px-8 py-3 text-sm font-bold text-muted-foreground opacity-50 cursor-not-allowed">Settings</button>
          </div>
          
          <div className="p-4 sm:p-8">
            {activeTab === 'overview' ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-righteous tracking-wide">Recent Activity</h2>
                  <button className="text-primary text-sm font-bold hover:underline">View Log</button>
                </div>
                
                <div className="space-y-4">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-colors border border-transparent hover:border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0">
                            <img src={`https://picsum.photos/seed/${post.id + 10}/200`} alt="thumb" className="w-full h-full object-cover opacity-80" />
                        </div>
                        <div>
                          <h4 className="font-bold mb-0.5 leading-snug truncate max-w-[200px] sm:max-w-md">{post.title}</h4>
                          <p className="text-muted-foreground text-xs">{post.date} • {post.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] hidden sm:block border px-2 py-0.5 rounded-full font-bold uppercase ${post.status === 'Live' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                          {post.status}
                        </span>
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Views</p>
                            <p className="font-bold text-sm">{post.views}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
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
                        <th className="pb-4 px-4">Stats</th>
                        <th className="pb-4 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {posts.map((post) => (
                        <tr key={post.id} className="group hover:bg-muted/30 transition-colors">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                                <img src={`https://picsum.photos/seed/${post.id + 10}/100`} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-bold text-sm line-clamp-1">{post.title}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 hidden md:table-cell">
                            <span className="text-xs text-muted-foreground">{post.category}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{post.views} views</span>
                              <span className={`text-[9px] font-bold uppercase ${post.status === 'Live' ? 'text-emerald-500' : 'text-yellow-500'}`}>{post.status}</span>
                            </div>
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-muted-foreground" title="Edit">
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(post.id)}
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
          </div>
        </div>
      </div>
    </div>
  );
}

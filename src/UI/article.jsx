import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { mockArticles } from "../../constants/index";
import {
    getOneBlog,
    likeBlog,
    getBlogComments,
    postComment,
    streamTTS,
    getPopularBlogs,
    getRelatedBlogs
} from "../../services/api";

import { Play, Pause, MailCheckIcon, Tag, ThumbsUpIcon, Share2, Clipboard, MessageCircle, Send, Volume2 } from "lucide-react";
import Overlay from "../cards/overlay";
import Button from "./button";
import { enqueueSnackbar } from "notistack";


export default function Article() {
    const { id } = useParams();
    const [likes, setLikes] = useState(Math.floor(Math.random() * 500) + 100);
    const [isLiked, setIsLiked] = useState(false);
    const [viewCount, setViewCount] = useState(0);
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const audioRef = useRef(null);
    const [relatedStories, setRelatedStories] = useState([]);
    const [popularStories, setPopularStories] = useState([]);

    // Clean up audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const fetchArticleData = async () => {
            try {
                // Fetch Article (Backend now increments views on getOneBlog)
                const response = await getOneBlog(id);
                if (response && response.data) {
                    setArticle(response.data);
                    setLikes(response.data.likes || 0);
                    setViewCount(response.data.views || 0);
                } else {
                    const fallback = mockArticles.find((a) => String(a._id || a.id) === String(id));
                    setArticle(fallback);
                    setLikes(Math.floor(Math.random() * 500) + 100);
                    setViewCount(5000);
                }
                // Fetch Related Blogs
                const relatedRes = await getRelatedBlogs(id);
                console.log("Related Blogs Response:", relatedRes);
                if (relatedRes && relatedRes.success) {
                    setRelatedStories(relatedRes.data);
                }

                // Fetch Popular Blogs
                const popularRes = await getPopularBlogs();
                console.log("Popular Blogs Response:", popularRes);
                if (popularRes && popularRes.success) {
                    setPopularStories(popularRes.data);
                }

                // Fetch Comments
                const commentsResponse = await getBlogComments(id);
                if (commentsResponse && commentsResponse.success) {
                    setComments(commentsResponse.data);
                }
            } catch (err) {
                console.warn("API unavailable, using mock data:", err);
                const fallback = mockArticles.find((a) => String(a._id || a.id) === String(id));
                setArticle(fallback);
                setLikes(Math.floor(Math.random() * 500) + 100);
                setViewCount(5000);
            } finally {
                setLoading(false);
            }
        };

        fetchArticleData();
        window.scrollTo(0, 0);
    }, [id]);

    const handleLike = async () => {
        if (isLiked) return; // Simple prevent multiple likes for now

        try {
            const res = await likeBlog(id);
            if (res.success) {
                setIsLiked(true);
                setLikes(res.data.likes);
            }
        } catch (err) {
            console.error("Failed to like:", err);
            // Fallback for mock/offline
            setIsLiked(!isLiked);
            setLikes(prev => isLiked ? prev - 1 : prev + 1);
        }
    };

    const handleShare = (platform) => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(article.title);

        let shareUrl = "";
        switch (platform) {
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                break;
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
            case "whatsapp":
                shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
                break;
            case "copy":
                navigator.clipboard.writeText(window.location.href);
                // You could add a toast here
                enqueueSnackbar("Link copied to clipboard!", { variant: "success" });
                return;
            default:
                return;
        }
        window.open(shareUrl, "_blank", "width=600,height=400");
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            const res = await postComment(id, { comment: newComment });
            if (res.success) {
                setComments(prev => [...prev, res.data]);
                setNewComment("");
            }
        } catch (err) {
            console.error("Failed to post comment:", err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handlePlayAudio = async () => {
        if (isSpeaking) {
            audioRef.current.pause();
            setIsSpeaking(false);
            return;
        }

        if (audioRef.current) {
            audioRef.current.play();
            setIsSpeaking(true);
            return;
        }

        setIsLoadingAudio(true);
        try {
            const fullText = `${article.title}. ${article.excerpt}. ${article.content}`;
            console.log("Fetching TTS for text length:", fullText.length);
            const blob = await streamTTS(fullText);
            console.log("Received blob:", blob.type, blob.size);

            if (blob.size < 100) {
                const text = await blob.text();
                console.error("Blob too small, might be an error message:", text);
                throw new Error("Invalid audio received from server");
            }

            const url = URL.createObjectURL(blob);
            console.log("Created Audio URL:", url);

            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(url);
                audioRef.current = null;
            };

            audio.onerror = () => {
                console.error("Audio playback error");
                setIsSpeaking(false);
                setIsLoadingAudio(false);
                audioRef.current = null;
            };

            await audio.play();
            setIsSpeaking(true);
        } catch (err) {
            console.error("Failed to play audio:", err);
        } finally {
            setIsLoadingAudio(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full bg-background py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="w-full bg-background py-20 text-center">
                <h2 className="text-2xl font-bold text-foreground">Article Not Found</h2>
                <Link to="/" className="text-primary hover:underline mt-4 block">Return to Home</Link>
            </div>
        );
    }

    const currentId = article._id || article.id;

    return (
        <div className="w-full bg-background py-8 lg:py-12 text-foreground transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* breadcrumb / top bar */}
                <div className="w-full lg:w-3/4 flex items-center h-12 bg-card border border-border rounded-xl mb-8 px-6 overflow-hidden">
                    <p className="text-muted-foreground font-medium text-sm flex items-center gap-2 truncate">
                        <Link to="/" className="hover:text-primary transition-colors shrink-0">Home</Link>
                        <span className="shrink-0">/</span>
                        <span className="text-muted-foreground shrink-0">{article.category}</span>
                        <span className="shrink-0">/</span>
                        <span className="text-foreground font-bold truncate">{article.title}</span>
                    </p>
                </div>

                {/* main layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* ARTICLE CONTENT */}
                    <article className="lg:col-span-2 space-y-8">

                        <div className="space-y-6">
                            <span className="inline-block font-boldwinn text-primary font-extrabold text-xs uppercase tracking-widest">
                                {article.category}
                            </span>

                            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight font-vend">
                                {article.title}
                            </h1>

                            <p className="text-xl text-muted-foreground leading-relaxed font-light italic border-l-4 border-border pl-6">
                                {article.excerpt}
                            </p>

                            {/* ElevenLabs Audio Player */}
                            <div className="flex items-center gap-4 py-4 px-6 bg-card border border-border rounded-2xl shadow-sm">
                                <button
                                    onClick={handlePlayAudio}
                                    disabled={isLoadingAudio}
                                    className="w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:scale-105 transition-all shadow-lg disabled:opacity-50"
                                >
                                    {isLoadingAudio ? (
                                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                    ) : isSpeaking ? (
                                        <Pause size={24} fill="currentColor" />
                                    ) : (
                                        <Play size={24} fill="currentColor" className="ml-1" />
                                    )}
                                </button>
                                <div>
                                    <p className="font-bold text-foreground flex items-center gap-2">
                                        <Volume2 size={16} className="text-primary" />
                                        {isSpeaking ? "Speaking..." : "Listen to this article"}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Powered by ElevenLabs AI
                                    </p>
                                </div>
                                {isSpeaking && (
                                    <div className="flex-grow flex items-center gap-1 ml-4 h-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div
                                                key={i}
                                                className="w-1 bg-primary rounded-full animate-pulse"
                                                style={{
                                                    height: `${Math.random() * 100}%`,
                                                    animationDelay: `${i * 0.1}s`,
                                                    animationDuration: '0.5s'
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border py-6">
                                {/* author */}
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={article.authorImage || "/img/picture.avif"}
                                            alt={article.author}
                                            className="w-14 h-14 rounded-full object-cover ring-4 ring-card"
                                        />
                                        <div>
                                            <p className="text-foreground font-bold text-lg font-galantic">
                                                By <span className="text-primary hover:underline cursor-pointer transition-all">{article.author}</span>
                                            </p>
                                            <p className="text-muted-foreground text-sm font-medium font-blackwood">{new Date(article.date).toLocaleDateString()} • 5 min read</p>

                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleLike}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all shadow-sm font-bold ${isLiked ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
                                                }`}
                                        >
                                            <ThumbsUpIcon size={18} fill={isLiked ? "currentColor" : "none"} />
                                            {likes}
                                        </button>
                                        <button
                                            onClick={() => handleShare('copy')}
                                            className="p-2.5 rounded-full bg-card text-muted-foreground hover:bg-muted transition-all shadow-sm"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* featured image */}
                            <div className="w-full relative group">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full aspect-[16/9] object-cover rounded-2xl shadow-2xl"
                                />
                            </div>

                            {/* views + social */}
                            <div className="flex items-center justify-between border-b border-border pb-6">

                                <div className="flex items-baseline gap-2">
                                    <p className="text-foreground font-bold text-3xl font-oldlondon">
                                        {viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}K` : viewCount}
                                    </p>
                                    <p className="text-muted-foreground font-semibold text-xl font-blackwood lowercase">
                                        views
                                    </p>
                                </div>

                                <div className="flex gap-4 items-center grayscale hover:grayscale-0 transition-all">
                                    <img src="/img/facebook.svg" onClick={() => handleShare('facebook')} alt="Share on Facebook" className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" title="Share on Facebook" />
                                    <img src="/img/twitter.svg" onClick={() => handleShare('twitter')} alt="Share on X" className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" title="Share on X" />
                                    <img src="/img/linkedin.svg" onClick={() => handleShare('linkedin')} alt="Share on LinkedIn" className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" title="Share on LinkedIn" />
                                    <img src="/img/whatsapp.svg" onClick={() => handleShare('whatsapp')} alt="Share on WhatsApp" className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" title="Share on WhatsApp" />
                                </div>

                            </div>

                            <p className="text-lg md:text-2xl leading-relaxed text-foreground/90 max-w-prose font-blogger">
                                {article.content}
                            </p>
                            {article.videoUrl && (
                                <div className="w-full mt-10 rounded-2xl overflow-hidden shadow-2xl border border-border group relative">
                                    {article.videoUrl.includes('youtube.com') || article.videoUrl.includes('youtu.be') || article.videoUrl.includes('vimeo.com') ? (
                                        <div className="aspect-video w-full">
                                            <iframe
                                                src={article.videoUrl.includes('youtube.com') || article.videoUrl.includes('youtu.be')
                                                    ? `https://www.youtube.com/embed/${article.videoUrl.split('v=')[1]?.split('&')[0] || article.videoUrl.split('/').pop()}`
                                                    : `https://player.vimeo.com/video/${article.videoUrl.split('/').pop()}`
                                                }
                                                className="w-full h-full border-0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                title="Article video"
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <video
                                            src={article.videoUrl}
                                            controls
                                            className="w-full h-auto"
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                </div>
                            )}

                            {article.quote && (
                                <div className="bg-card border-l-8 border-primary p-10 rounded-2xl shadow-inner relative overflow-hidden group">
                                    <div className="absolute top-4 right-8 text-primary/20 group-hover:text-primary transition-colors">
                                        <Clipboard size={80} strokeWidth={0.5} />
                                    </div>
                                    <p className="text-foreground text-2xl font-bold font-changa italic relative z-10 leading-snug">
                                        <span className="text-primary text-6xl font-serif absolute -left-6 -top-4 opacity-30">"</span>
                                        {article.quote}
                                    </p>
                                    <div className="mt-6 flex items-center gap-3 relative z-10">
                                        <div className="h-px w-8 bg-primary"></div>
                                        <p className=" text-primary uppercase tracking-widest text-lg font-aristotelica">
                                            {article.author}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* tags */}
                            <div className="flex items-center gap-4 pt-8">
                                <div className="p-2 text-primary">
                                    <Tag size={20} />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-4 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground cursor-pointer transition-all font-boldwinn text-sm font-semibold text-muted-foreground">
                                        #{article.category.replace(/\s+/g, '')}
                                    </span>
                                    <span className="px-4 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground cursor-pointer transition-all font-boldwinn text-sm font-semibold text-muted-foreground">
                                        #Insights
                                    </span>
                                    <span className="px-4 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground cursor-pointer transition-all font-boldwinn text-sm font-semibold text-muted-foreground">
                                        #Trending
                                    </span>
                                </div>
                            </div>

                            {/* related stories */}
                            <div className="space-y-8 pt-12">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-bold text-foreground font-vend uppercase tracking-tight">Related Stories</h2>
                                    <div className="flex-grow h-px bg-border"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {relatedStories.map((related) => (
                                        <div
                                            key={related._id || related.id}
                                            className="flex-[0_0_85%] sm:flex-[0_0_75%] lg:flex-[0_0_30%] min-w-0"
                                        >
                                            <Overlay article={related} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* comments */}
                            <div className="pt-12 space-y-6">
                                <form onSubmit={handleCommentSubmit} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold text-foreground font-vend uppercase">Comments ({comments.length})</h2>
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Join the conversation..."
                                            className="w-full h-32 p-4 bg-muted/20 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-sans text-foreground"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSubmittingComment || !newComment.trim()}
                                            className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            {isSubmittingComment ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <Send size={20} />
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {comments.length > 0 ? (
                                    <div className="space-y-6">
                                        {comments.map((comment, idx) => (
                                            <div key={comment._id || idx} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                        {comment.authorName ? comment.authorName[0] : "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">{comment.authorName || "User"}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(comment.createdAt || Date.now()).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed">{comment.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full bg-muted/30 p-8 rounded-2xl border border-dashed border-border text-center space-y-4">
                                        <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto shadow-sm">
                                            <MessageCircle className="text-muted-foreground/30" />
                                        </div>
                                        <p className="text-muted-foreground font-medium italic">
                                            Join the conversation. No comments yet on this remarkable story.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>

                    {/* SIDEBAR */}
                    <aside className="lg:col-span-1 space-y-10 self-start">

                        {/* popular stories */}
                        <div className="space-y-6">

                            <p className="text-foreground font-bold text-xl uppercase tracking-tighter">
                                Popular Stories
                            </p>

                            <div className="space-y-6">
                                {popularStories.map((story, index) => (
                                    <Link to={`/article/${story._id || story.id}`} key={story._id || story.id} className="flex gap-4 items-center group">
                                        <p className="flex shrink-0 w-10 h-10 items-center justify-center text-white bg-primary rounded-full text-lg font-grunge shadow-lg shadow-primary/20">
                                            {index + 1}
                                        </p>
                                        <p className="font-semibold text-foreground/80 group-hover:text-primary text-xl font-grunge leading-tight transition-colors">
                                            {story.title}
                                        </p>
                                    </Link>
                                ))}
                            </div>

                        </div>

                        {/* tags */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Tag size={24} className="text-primary" />
                                <h2 className="text-2xl uppercase font-bold tracking-tighter">
                                    Tags
                                </h2>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {["Health", "Science", "Lifestyle", "Research"].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-card border border-border font-oldlondon-alt text-2xl font-semibold text-foreground/80 cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all rounded-md">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-border pt-8">
                            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                                <h2 className="text-foreground text-2xl font-vend font-semibold mb-3">
                                    Newsletter
                                </h2>

                                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                    The best of Insightville, delivered straight to your inbox daily.
                                </p>

                                <div className="space-y-3">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/50 transition-all font-sans"
                                    />

                                    <Button
                                        title="Subscribe"
                                        containerClass="
                                            w-full
                                            inline-flex items-center justify-center 
                                            px-6 py-3
                                            !bg-primary text-primary-foreground 
                                            font-bold rounded-xl
                                            shadow-lg shadow-primary/20
                                            gap-2 
                                            hover:opacity-90 
                                            transition-all active:scale-95
                                        "
                                        rightIcon={<MailCheckIcon size={18} />}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* stay connected */}
                        <div className="space-y-4 pb-12">
                            <h2 className="text-xl font-bold tracking-tight">
                                Stay Connected
                            </h2>
                            <div className="w-12 h-1 bg-primary rounded-full"></div>

                            <div className="space-y-3 pt-2">
                                {[
                                    { icon: "/img/facebook.svg", label: "Facebook", bg: "hover:bg-blue-600", count: "142k" },
                                    { icon: "/img/twitter.svg", label: "Twitter", bg: "hover:bg-sky-400", count: "89k" },
                                    { icon: "/img/ig.svg", label: "Instagram", bg: "hover:bg-pink-600", count: "210k" }
                                ].map((social) => (
                                    <button
                                        key={social.label}
                                        className={`w-full flex items-center justify-between bg-card border border-border p-3 rounded-xl group ${social.bg} hover:text-white transition-all hover:border-transparent hover:shadow-lg`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={social.icon} alt="" className="w-6 h-6 group-hover:brightness-0 group-hover:invert transition-all" />
                                            <p className="font-bold text-sm tracking-wide">
                                                {social.label}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground group-hover:text-white/80">{social.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

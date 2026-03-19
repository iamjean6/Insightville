import { mockArticles } from "../../constants/index";
import Card4 from "../cards/card4";
import useEmblaCarousel from 'embla-carousel-react'
import { getPopularBlogs } from "../../services/api";
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Overlay from "../cards/overlay";
import { useCategory } from "../utils/CategoryContext";


export default function Popular() {

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { selectedCategory } = useCategory();
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(6);
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        loop: false,
        dragFree: true,
        containScroll: 'trimSnaps'
    })

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])


    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true)
            try {
                const response = await getPopularBlogs()
                if (response && response.success) {
                    setPosts(response.data)
                } else {
                    setPosts(mockArticles)
                }
            } catch (err) {
                console.warn("API unavailable, using mock data:", err)
                setPosts(mockArticles)
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()
    }, [])


    useEffect(() => {
        if (selectedCategory === "All") {
            setFilteredPosts(posts);
        } else {
            setFilteredPosts(posts.filter(post => post.category === selectedCategory));
        }
        setCurrentPage(1);
    }, [selectedCategory, posts]);

    if (loading) {
        return (
            <div>
                <div className="w-full min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        )

    }
    if (!selectedCategory) {
        return (
            <div>
                <div className="w-full min-h-screen flex items-center justify-center">
                    <p className="text-foreground font-changa text-lg mb-4 max-w-2xl">
                        No Category Selected
                    </p>
                </div>
            </div>
        )
    }
    return (
        <div className="w-full bg-background transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl lg:text-4xl text-foreground font-bold tracking-tight font-vend mb-3 drop-shadow-md">
                            Trending Now
                        </h2>
                        <div className="border-t-2 border-primary w-16 shadow-lg shadow-primary/40"></div>
                    </div>

                    {/* Carousel Navigation */}
                    <div className="flex gap-2">
                        <button
                            className="bg-muted hover:bg-primary text-primary-foreground p-2 rounded-full transition-colors hidden sm:block"
                            onClick={scrollPrev}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            className="bg-muted hover:bg-primary text-primary-foreground p-2 rounded-full transition-colors hidden sm:block"
                            onClick={scrollNext}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Embla Carousel Viewport */}
                {filteredPosts.length === 0 ? (
                    <div className="w-full py-20 text-center rounded-3xl bg-muted/5 backdrop-blur-sm">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto shadow-sm border border-border">
                                <img src="/img/not_found.gif" alt="" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground font-vend">No articles found</h3>
                            <p className="text-muted-foreground font-medium italic">
                                There are currently no articles in the <span className="text-primary font-bold">"{selectedCategory}"</span> category for this section.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden" ref={emblaRef}>
                        {/* Embla Carousel Container */}
                        <div className="flex gap-4 sm:gap-6 -ml-4 pl-4 pt-4 pb-8">
                            {filteredPosts.map((article) => (
                                <div
                                    key={article._id || article.id}
                                    className="flex-[0_0_85%] sm:flex-[0_0_75%] lg:flex-[0_0_30%] min-w-0"
                                >
                                    <Overlay article={article} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

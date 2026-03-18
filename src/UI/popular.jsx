import { mockArticles } from "../../constants/index";
import Card4 from "../cards/card4";
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Overlay from "../cards/overlay";

export default function Popular() {
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
                <div className="overflow-hidden" ref={emblaRef}>
                    {/* Embla Carousel Container */}
                    <div className="flex gap-4 sm:gap-6 -ml-4 pl-4 pt-4 pb-8">
                        {mockArticles.map((article) => (
                            <div
                                key={article._id || article.id}
                                className="flex-[0_0_85%] sm:flex-[0_0_75%] lg:flex-[0_0_30%] min-w-0"
                            >
                                <Overlay article={article} />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

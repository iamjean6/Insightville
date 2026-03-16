import Card3 from "../cards/card3";
import { mockArticles } from "../../constants/indes";


export default function Latestnews() {
    return (
        <div className="w-full min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <div className="mb-8">
                    <h2 className="text-3xl text-foreground font-bold tracking-tight font-vend mb-3 drop-shadow-md">
                        Latest News
                    </h2>
                    <div className="border-t-2 border-primary w-16 shadow-lg shadow-primary/40"></div>
                </div>

                {/* Make it 1 column strictly on smaller views, 2 columns on lg displays for standard horizontal feel. */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    {mockArticles.map((article) => (
                        <Card3 key={article.id} article={article} />
                    ))}
                </div>
                <div className="flex justify-center bg-transparent mt-8 px-16">
                    <img src="/img/journal.svg" alt="" className="w-1/2 h-48" />
                </div>
            </div>
        </div>
    )
}
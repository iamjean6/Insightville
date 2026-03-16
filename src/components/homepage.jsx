import Navbar from "../UI/navbar"
import HeroCTA from "../UI/heroCTA"
import Featuredstories from "../UI/Featuredstories"
import Latestnews from "../UI/latestnews"
import Popular from "../UI/popular"
import EditorsPick from "../UI/editorspick"
import Footer from "../UI/footer"

export default function Homepage() {
    return (
        <div className="min-h-screen w-full bg-black flex flex-col">

            <main className="flex-1">
                <HeroCTA />
                <Featuredstories />
                <EditorsPick />
                <Popular />
                <Latestnews />
            </main>

        </div>
    )
}
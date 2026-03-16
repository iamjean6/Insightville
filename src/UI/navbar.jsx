import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, Palette, Check, Sun, Moon } from "lucide-react"
import Sidebar from "./sidebar"
import { useTheme } from "../utils/ThemeContext"

export default function Navbar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isThemeOpen, setIsThemeOpen] = useState(false)
    const { theme: currentTheme, setTheme, isDark, toggleDarkMode } = useTheme()

    const themes = [
        { name: "Default", id: "default" },
        { name: "Clean", id: "clean" },
        { name: "Noir", id: "noir" },
        { name: "Modern", id: "modern" },
        { name: "Sky", id: "sky" },
        { name: "Elegant", id: "elegant" },
        { name: "Vivid", id: "vivid" },
        { name: "Vintage", id: "vintage" },

    ]

    const categories = [
        "Technology",
        "Business",
        "Entertainment",
        "Sports",
        "Health",
        "Science",
        "World",
        "Politics",
        "Opinion",
        "Style",
        "Travel",
        "Food",
        "Culture",
        "Video",
        "More"
    ]
    return (
        <nav className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm font-sans transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <img src="/img/zap.svg" alt="Insightville" className="w-12 h-12 object-contain rounded-full" />
                        <p className="text-2xl font-alfa text-primary tracking-wide drop-shadow-sm">Insightville</p>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        <Link to="/" className="font-changa hidden md:block text-muted-foreground hover:text-primary tracking-wide transition-colors">
                            Home
                        </Link>
                        <Link to="/about" className="font-changa hidden md:block text-muted-foreground hover:text-primary tracking-wide transition-colors">
                            About
                        </Link>
                        <Link to="/features" className="font-changa hidden md:block text-muted-foreground hover:text-primary tracking-wide transition-colors">
                            Contact us
                        </Link>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="text-muted-foreground hover:text-primary transition-colors p-1 flex items-center justify-center"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDark ? <Sun size={22} /> : <Moon size={22} />}
                        </button>

                        {/* Theme Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setIsThemeOpen(!isThemeOpen)}
                                className="text-muted-foreground hover:text-primary transition-colors p-1 flex items-center gap-1"
                                aria-label="Change Theme"
                            >
                                <Palette size={22} />
                            </button>

                            {isThemeOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsThemeOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl py-2 z-50 overflow-hidden">
                                        <div className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border mb-1">
                                            Themes
                                        </div>
                                        {themes.map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    setTheme(t.id);
                                                    setIsThemeOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-muted transition-colors ${currentTheme === t.id ? 'text-primary font-bold' : 'text-foreground'
                                                    }`}
                                            >
                                                {t.name}
                                                {currentTheme === t.id && <Check size={14} className="text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-muted-foreground hover:text-primary transition-colors p-1"
                            aria-label="Open Menu"
                        >
                            <Menu size={26} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-3/4 mx-auto border-b border-primary/20"></div>

            {/* Categories Bar */}
            <div className="w-full overflow-hidden bg-black/95">
                <div className="flex w-fit animate-scroll hover:animation-paused py-3 items-center">
                    {/* Render the list twice for seamless infinite scrolling */}
                    {[...categories, ...categories, ...categories, ...categories].map((category, idx) => (
                        <div key={`${category}-${idx}`} className="px-2">
                            <button
                                className="font-righteous flex-shrink-0 rounded-xl border-2 border-primary bg-background px-6 py-2 text-sm uppercase tracking-widest text-primary transition-all duration-200 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-4px_4px_0px_var(--tw-shadow-color)] shadow-primary hover:bg-card hover:text-primary active:translate-y-0 active:translate-x-0 active:shadow-none whitespace-nowrap"
                            >
                                {category}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    )
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import { X, Palette, Sun, Moon } from "lucide-react";
import { useTheme } from "../utils/ThemeContext";

// Helper component to async load Lottie files from public URLs or local paths
const LottieIcon = ({ url }) => {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        fetch(url)
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.log("Lottie load error for:", url, err));
    }, [url]);

    if (!animationData) {
        return <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse shrink-0"></div>;
    }

    return (
        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
};

export default function Sidebar({ isOpen, onClose }) {
    const { isDark, toggleDarkMode } = useTheme();

    return (
        <>
            {/* Backdrop Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar Slider */}
            <div
                className={`fixed inset-y-0 left-0 w-80 bg-card border-r border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6 h-full flex flex-col">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-border">
                        <p className="text-2xl font-alfa text-primary tracking-wide drop-shadow-sm">Insightville</p>
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-primary bg-muted hover:bg-accent p-2 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-6 font-vend text-xl">
                        <Link to="/" onClick={onClose} className="text-foreground hover:text-primary transition-colors flex items-center gap-4">
                            <LottieIcon url="/img/Home.json" /> Home
                        </Link>
                        <Link to="/about" onClick={onClose} className="text-foreground hover:text-primary transition-colors flex items-center gap-4">
                            <LottieIcon url="/img/About _us.json" /> About Us
                        </Link>
                        <Link to="/features" onClick={onClose} className="text-foreground hover:text-primary transition-colors flex items-center gap-4">
                            <LottieIcon url="/img/iPhone.json" /> Contact
                        </Link>
                        <Link to="/collaborate" onClick={onClose} className="text-foreground hover:text-primary transition-colors flex items-center gap-4">
                            <LottieIcon url="/img/Writing.json" /> Write for us
                        </Link>
                        <Link to="/admin" onClick={onClose} className="text-foreground hover:text-primary transition-colors flex items-center gap-4 mt-4 pt-4 border-t border-border border-dashed">
                            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                                <Palette size={20} />
                            </div>
                            Admin Dashboard
                        </Link>

                        {/* Dark Mode Toggle for Mobile */}
                        <button
                            onClick={toggleDarkMode}
                            className="text-foreground hover:text-primary transition-colors flex items-center gap-4 mt-2"
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-full text-muted-foreground group-hover:text-primary">
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </div>
                            {isDark ? "Light Mode" : "Dark Mode"}
                        </button>
                    </div>

                    {/* Bottom CTA / Socials area */}
                    <div className="mt-auto pt-8 border-t border-border">
                        <p className="text-sm text-muted-foreground font-changa mb-4 uppercase tracking-widest font-bold">Follow us</p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                                <img src="/img/facebook.svg" alt="Facebook" className="w-6 h-6" />
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                                <img src="/img/linkedin.svg" alt="Linkedin" className="w-6 h-6" />
                            </div>
                            <div className="w-10 h-10 round-full flex items-center justify-center cursor-pointer">
                                <img src="/img/ig.svg" alt="Instagram" className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

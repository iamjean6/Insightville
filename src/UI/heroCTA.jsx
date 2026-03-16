import { Search, ArrowRight } from "lucide-react";

export default function HeroCTA() {
    return (
        <div className="w-full relative overflow-hidden py-20 lg:py-32 flex flex-col items-center justify-center text-center px-4 transition-colors duration-300">
            
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                
                <h1 className="text-5xl md:text-7xl font-alfa text-foreground mb-6 tracking-tight leading-tight drop-shadow-lg">
                    Uncover The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Extraordinary</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground font-changa max-w-2xl mb-10 leading-relaxed">
                    Dive into our curated insights, cutting-edge trends, and compelling stories from around the globe. Stay curious.
                </p>

                {/* Search Bar */}
                <div className="w-full max-w-lg mb-8 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search for articles, trends, or topics..." 
                        className="w-full bg-card border-2 border-border text-foreground placeholder-muted-foreground rounded-full py-4 pl-12 pr-32 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-vend text-lg shadow-inner"
                    />
                    <button className="absolute inset-y-2 right-2 bg-primary hover:bg-primary/90 text-primary-foreground font-righteous uppercase text-sm tracking-wider px-6 rounded-full transition-colors flex items-center gap-2 shadow-lg shadow-primary/30">
                        Search
                    </button>
                </div>

                <div className="flex gap-4 items-center text-sm font-vend text-muted-foreground">
                    <span>Popular:</span>
                    <span className="cursor-pointer hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">AI Design</span>
                    <span className="cursor-pointer hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">Travel Guide</span>
                    <span className="cursor-pointer hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">Web Dev</span>
                </div>

            </div>
        </div>
    );
}

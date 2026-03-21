import { Twitter, Instagram, Linkedin, Github, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="w-full bg-card border-t border-border pt-16 pb-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">

                    {/* Brand & Description */}
                    <div className="flex flex-col">
                        <p className="text-3xl font-alfa text-primary tracking-wide drop-shadow-sm mb-6">Insightville</p>
                        <p className="text-muted-foreground text-sm leading-relaxed font-changa mb-6">
                            Insightville is a digital news platform delivering timely, accurate, and in-depth coverage across a wide spectrum of topics.
                            We deliver credible journalism that informs, educates, and drives conversation.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-all shadow-sm">
                                <img src="/img/facebook.svg" alt="Facebook" className="w-6 h-6" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-all shadow-sm">
                                <img src="/img/ig.svg" alt="Instagram" className="w-6 h-6" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-all shadow-sm">
                                <img src="/img/linkedin.svg" alt="Linkedin" className="w-6 h-6" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-all shadow-sm">
                                <img src="/img/gmail.svg" alt="gmail" className="w-6 h-6" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-foreground font-righteous uppercase tracking-widest text-lg mb-6 flex items-center gap-2">
                            <span className="w-6 h-px bg-primary"></span> Links
                        </h4>
                        <ul className="flex flex-col gap-3 font-vend text-muted-foreground">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Collaborations */}
                    <div>
                        <h4 className="text-foreground font-righteous uppercase tracking-widest text-lg mb-6 flex items-center gap-2">
                            <span className="w-6 h-px bg-primary"></span> Collaborate
                        </h4>
                        <p className="text-muted-foreground text-sm font-changa mb-4">
                            Partner with Insightville to reach a diverse and engaged audience. We offer tailored advertising solutions across our digital platforms to help amplify your brand and connect with the right audience.
                        </p>
                        <button className="bg-transparent border border-primary text-primary hover:bg-primary/10 font-vend px-5 py-2 rounded-lg transition-colors w-full text-center">
                            Write for Us
                        </button>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-foreground font-righteous uppercase tracking-widest text-lg mb-6 flex items-center gap-2">
                            <span className="w-6 h-px bg-primary"></span>Contact Us
                        </h4>
                        <ul className="flex flex-col gap-4 font-vend text-muted-foreground text-sm">
                            <li className="flex items-start gap-3 hover:text-primary transition-colors">
                                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                                <span>P.O. Box 40100<br />KISUMU, Kenya</span>
                            </li>
                            <li className="flex items-center gap-3 hover:text-primary transition-colors">
                                <Phone size={18} className="text-primary shrink-0" />
                                <span>+254 705748503</span>
                            </li>
                            <li className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer">
                                <Mail size={18} className="text-primary shrink-0" />
                                <span>hello@insightville.io</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-vend text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Insightville. All rights reserved.</p>
                    <p>Powered by <span className="text-primary">UrbanvilleSports</span></p>
                </div>

            </div>
        </footer>
    );
}

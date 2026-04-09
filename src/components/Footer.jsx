import { Link } from 'react-router-dom';
import { Code2, Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative border-t border-white/10 bg-white/5 backdrop-blur-xl mt-auto overflow-hidden">
            {/* Animated Background Blobs internally */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-6 md:col-span-2 relative z-10">
                        <Link to="/" className="flex items-center space-x-2">
                            <Code2 className="h-8 w-8 text-blue-500" />
                            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Codeminati
                            </span>
                        </Link>
                        <p className="text-gray-400 text-base leading-relaxed max-w-md">
                            The ultimate online cloud compiler and development environment. Write, run, and share your code from anywhere with blazing fast speeds.
                        </p>
                        {/* <div className="flex space-x-5">
                            <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-gray-400 transition-all flex items-center justify-center">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2] text-gray-400 transition-all flex items-center justify-center">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-[#0A66C2]/20 hover:text-[#0A66C2] text-gray-400 transition-all flex items-center justify-center">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div> */}
                    </div>

                    {/* Quick Links */}
                    <div className="relative z-10">
                        <h3 className="text-white font-bold mb-6 text-lg tracking-wide">Platform</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/compiler" className="text-gray-400 hover:text-blue-400 transition-colors text-base flex items-center space-x-2">
                                    <span>Online Compiler</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/problems" className="text-gray-400 hover:text-blue-400 transition-colors text-base flex items-center space-x-2">
                                    <span>DSA Problems</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/contests" className="text-gray-400 hover:text-blue-400 transition-colors text-base flex items-center space-x-2">
                                    <span>Contests</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div className="relative z-10">
                        <h3 className="text-white font-bold mb-6 text-lg tracking-wide">Support & Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/support" className="text-gray-400 hover:text-blue-400 transition-colors text-base">
                                    Contact & Feedback
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors text-base">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-gray-400 hover:text-blue-400 transition-colors text-base">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="relative z-10 border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center bg-transparent backdrop-blur-0 !bg-opacity-0">
                    <p className="text-gray-500 mb-4 md:mb-0">
                        © {new Date().getFullYear()} Codeminati. All rights reserved.
                    </p>

                    <div className="flex items-center space-x-2 px-4 py-2 rounded-full border border-white/5 bg-white/5">
                        <span className="text-sm font-medium text-gray-400">Made with</span>
                        <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                        <span className="text-sm font-medium text-gray-400">for developers</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import { Link } from 'react-router-dom';
import { Code2, Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-gray-800 bg-[#13131a]/50 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <Code2 className="h-8 w-8 text-primary" />

                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Codeminati
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm">
                            Master coding challenges, land your dream job, and compete with the best developers worldwide.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-[#1DA1F2] transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-[#0A66C2] transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Platform</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/problems" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    Problems
                                </Link>
                            </li>
                            <li>
                                <Link to="/contests" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    Contests
                                </Link>
                            </li>

                            <li>
                                <Link to="/compiler" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    Online Compiler
                                </Link>
                            </li>
                        </ul>
                    </div>



                    {/* Legal & Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support & Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/support" className="text-gray-400 hover:text-primary transition-colors text-sm font-medium">
                                    Contact & Feedback
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors text-sm">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Codeminati. All rights reserved.
                    </p>

                    <div className="my-4 md:my-0">
                        <img src="/codeminati.png" alt="Codeminati" className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="flex items-center space-x-1 text-sm text-gray-500 mt-4 md:mt-0">
                        <span>Made with</span>
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        <span>for developers</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

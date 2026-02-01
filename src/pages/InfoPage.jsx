import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const InfoPage = ({ title, type }) => {
    const navigate = useNavigate();

    const renderContent = () => {
        switch (type) {
            case 'blog':
                return (
                    <div className="space-y-8">
                        <div className="p-6 rounded-2xl glass hover:bg-white/5 transition-all">
                            <h2 className="text-2xl font-bold mb-3 text-primary">Mastering Dynamic Programming</h2>
                            <p className="text-gray-400 mb-4">Learn the secrets to solving complex DP problems with ease. From memoization to tabulation, we cover it all.</p>
                            <span className="text-sm text-gray-500">Dec 21, 2025 • 5 min read</span>
                        </div>
                        <div className="p-6 rounded-2xl glass hover:bg-white/5 transition-all">
                            <h2 className="text-2xl font-bold mb-3 text-primary">System Design Interview Guide</h2>
                            <p className="text-gray-400 mb-4">A comprehensive guide to acing your system design interviews at top tech companies.</p>
                            <span className="text-sm text-gray-500">Dec 18, 2025 • 12 min read</span>
                        </div>
                        <div className="p-6 rounded-2xl glass hover:bg-white/5 transition-all">
                            <h2 className="text-2xl font-bold mb-3 text-primary">Graph Algorithms Explained</h2>
                            <p className="text-gray-400 mb-4">BFS, DFS, Dijkstra's - understand the core graph algorithms through interactive examples.</p>
                            <span className="text-sm text-gray-500">Dec 15, 2025 • 8 min read</span>
                        </div>
                    </div>
                );
            case 'docs':
                return (
                    <div className="space-y-8">
                        <div className="p-6 rounded-2xl glass border border-gray-800">
                            <h3 className="text-2xl font-bold mb-4 text-blue-400">Platform Overview</h3>
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                Codeminati is a comprehensive competitive programming and hackathon platform. It features a Training Ground for practice, a Contest Arena for live competitions, and an integrated Compiler for testing your logic.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <h4 className="font-bold text-white mb-2">Training Ground</h4>
                                    <p className="text-xs text-gray-400">Practice problems ranging from Easy to Hard difficulties.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <h4 className="font-bold text-white mb-2">Contests</h4>
                                    <p className="text-xs text-gray-400">Join time-bound hackathons to compete for global ranking.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <h4 className="font-bold text-white mb-2">Social Feed</h4>
                                    <p className="text-xs text-gray-400">Discuss algorithms and share insights with peers.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl glass border border-gray-800">
                            <h3 className="text-xl font-bold mb-4 text-purple-400">Technical Documentation</h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-white mb-2">Input / Output Format</h4>
                                    <p className="text-gray-400 text-sm mb-2">
                                        For most problems, you need to implement a function or a class method. You do not need to handle raw stdin/stdout unless specified (e.g., "Standard I/O" problems).
                                    </p>
                                    <pre className="bg-black/50 p-3 rounded-lg text-xs font-mono text-gray-300 border border-gray-700">
// Example: Two Sum
                                        // You just implement the function:
                                        class Solution:
                                        def solve(self, nums, target):
                                        # return result
                                    </pre>
                                </div>

                                <div>
                                    <h4 className="font-bold text-white mb-2">Execution Environment</h4>
                                    <ul className="list-disc pl-5 text-gray-400 text-sm space-y-1">
                                        <li><strong>Time Limit:</strong> Usually 1-2 seconds per test case.</li>
                                        <li><strong>Memory Limit:</strong> Typically 256MB unless strict constraints apply.</li>
                                        <li><strong>Libraries:</strong> Standard libraries are supported. External packages (like numpy in Python) are generally NOT available unless specified.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl glass border border-gray-800">
                            <h3 className="text-xl font-bold mb-4 text-green-400">Contest Rules</h3>
                            <ul className="list-disc pl-5 text-gray-300 space-y-2">
                                <li><strong>Scoring:</strong> Points are awarded upon passing ALL test cases for a problem.</li>
                                <li><strong>Penalty:</strong> Incorrect submissions may incur a time penalty in ranking, but do not reduce the raw score.</li>
                                <li><strong>Integrity:</strong> Copying code from external sources or other participants is strictly prohibited and monitored.</li>
                            </ul>
                        </div>
                    </div>
                );
            case 'community':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-8 rounded-2xl border border-blue-500/20 text-center">
                            <h3 className="text-2xl font-bold mb-4">Join our Discord</h3>
                            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">Connect with thousands of other developers, discuss problems, and participate in exclusive community events.</p>
                            <button className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-medium transition-colors">
                                Join Server
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 rounded-xl glass flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-lg">Weekly Discussion</h4>
                                    <p className="text-gray-400 text-sm">Topic: Best practices for React Performance</p>
                                </div>
                                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">Active</span>
                            </div>
                        </div>
                    </div>
                );
            case 'faq':
                return (
                    <div className="space-y-4">
                        <details className="group p-4 glass rounded-xl cursor-pointer">
                            <summary className="font-semibold list-none flex justify-between items-center text-lg">
                                How is the score calculated?
                                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-gray-400 mt-3 pl-2 border-l-2 border-primary/50">
                                Contest scores are calculated based on the number of problems solved and the time taken. Penalties are added for incorrect submissions.
                                <br /><br />
                                For standard practice problems, points are awarded based on difficulty: Easy (20), Medium (30), and Hard (50).
                            </p>
                        </details>
                        <details className="group p-4 glass rounded-xl cursor-pointer">
                            <summary className="font-semibold list-none flex justify-between items-center text-lg">
                                Which programming languages are supported?
                                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-gray-400 mt-3 pl-2 border-l-2 border-primary/50">
                                We currently support Python, C, C++, Java, and JavaScript/Node.js. You can switch languages freely between submissions, but cannot mix languages within a single solution file.
                            </p>
                        </details>
                        <details className="group p-4 glass rounded-xl cursor-pointer">
                            <summary className="font-semibold list-none flex justify-between items-center text-lg">
                                What is the difference between 'Run' and 'Submit'?
                                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-gray-400 mt-3 pl-2 border-l-2 border-primary/50">
                                <strong>Run:</strong> Executes your code against the public test cases to verify logic. It does not affect your score or submission history.
                                <br />
                                <strong>Submit:</strong> Runs your code against both public and hidden test cases. If all pass, your solution is accepted and points are awarded.
                            </p>
                        </details>
                        <details className="group p-4 glass rounded-xl cursor-pointer">
                            <summary className="font-semibold list-none flex justify-between items-center text-lg">
                                How can I become a Judge or Admin?
                                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-gray-400 mt-3 pl-2 border-l-2 border-primary/50">
                                Roles are assigned by the platform administrators based on contribution and trust. Judges are typically selected from top-performing users who have demonstrated consistent activity and integrity.
                            </p>
                        </details>
                        <details className="group p-4 glass rounded-xl cursor-pointer">
                            <summary className="font-semibold list-none flex justify-between items-center text-lg">
                                I found a bug or have a feature request.
                                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-gray-400 mt-3 pl-2 border-l-2 border-primary/50">
                                Please visit our <Link to="/support" className="text-blue-400 hover:underline">Support Page</Link> and choose "Bug Report" or "Feedback" to let us know. We appreciate your help in improving Codeminati!
                            </p>
                        </details>
                    </div>
                );
            case 'privacy':
                return (
                    <div className="prose prose-invert max-w-none text-gray-300">
                        <p className="text-sm text-gray-400 mb-8">Last updated: February 1, 2026</p>
                        <p className="mb-6">
                            At Codeminati, we value your privacy and are committed to protecting your personal data. This policy explains what we collect and how we use it.
                        </p>

                        <h3 className="text-xl font-bold text-white mt-6 mb-3">1. Information Collection</h3>
                        <p className="mb-4">
                            We collect basic account information (name, email) and technical data necessary for the platform's operation (IP address, browser type). When you participate in contests, we also record your submission code, execution results, and timestamps.
                        </p>

                        <h3 className="text-xl font-bold text-white mt-6 mb-3">2. Usage of Data</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li><strong>Service Provision:</strong> To authenticate you, process your code submissions, and maintain leaderboards.</li>
                            <li><strong>Integrity:</strong> To detect plagiarism and prevent cheating during hackathons.</li>
                            <li><strong>Communication:</strong> To send important updates regarding your account or contests you've registered for.</li>
                        </ul>

                        <h3 className="text-xl font-bold text-white mt-6 mb-3">3. Data Protection</h3>
                        <p className="mb-4">
                            We implement standard security measures including password hashing (bcrypt), JWT authentication, and secure HTTPS connections to protect your data. We do not sell your personal information to third parties.
                        </p>

                        <h3 className="text-xl font-bold text-white mt-6 mb-3">4. Anti-Cheat Monitoring</h3>
                        <p className="mb-4">
                            During active hackathons, the platform may monitor specific browser events (such as tab switching or copy-paste actions) solely for the purpose of ensuring fair play. This data is processed automatically and used only for contest integrity verification.
                        </p>
                    </div>
                );
            case 'terms':
                return (
                    <div className="prose prose-invert max-w-none text-gray-300">
                        <p className="text-sm text-gray-400 mb-8">Last updated: February 1, 2026</p>

                        <p className="mb-6">
                            Welcome to <strong>Codeminati</strong>. By accessing or using our platform, participating in our hackathons, or using our services, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use our services.
                        </p>

                        <h3 className="text-xl font-bold text-white mt-8 mb-4">1. Eligibility</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>You must be at least 13 years of age or older to use this platform.</li>
                            <li>If you are under 18, you represent that you have your parent or guardian's permission to use the Service.</li>
                            <li>Participants in hackathons must meet specific eligibility criteria outlined for each individual event (e.g., student status, geographic location).</li>
                        </ul>

                        <h3 className="text-xl font-bold text-white mt-8 mb-4">2. Registration and Account Security</h3>
                        <p className="mb-4">
                            To access certain features, you must register for an account. You agree to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Provide accurate, current, and complete information during the registration process.</li>
                            <li>Maintain the security of your password and accept all risks of unauthorized access to your account.</li>
                            <li>Notify us immediately if you discover or suspect any security breaches related to your account.</li>
                        </ul>

                        <h3 className="text-xl font-bold text-white mt-8 mb-4">3. Code of Conduct</h3>
                        <p className="mb-4">
                            We are committed to providing a safe and inclusive environment. You agree NOT to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Harass, abuse, or harm another person or group.</li>
                            <li>Submit code that contains viruses, malware, or malicious scripts.</li>
                            <li>Engage in plagiarism or cheating during contests and hackathons. All submissions must be your original work.</li>
                            <li>Attempt to intentionally degrade the performance of our servers (e.g., DDoS attacks).</li>
                        </ul>

                        <h3 className="text-xl font-bold text-white mt-8 mb-4">4. Hackathon Rules & Integrity</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li><strong>Cheating:</strong> Using multiple accounts, sharing solutions during active contests, or exploiting platform vulnerabilities will result in immediate disqualification and a permanent ban.</li>
                            <li><strong>Submission Rights:</strong> You retain ownership of the code you write. However, by submitting to a public hackathon, you grant the host a non-exclusive license to review, test, and act upon your submission for judging purposes.</li>
                            <li><strong>Prizes:</strong> Prizes are awarded at the sole discretion of the event organizers. We function as the platform host and are not liable for prize fulfillment unless explicitly stated otherwise.</li>
                        </ul>

                        <h3 className="text-xl font-bold text-white mt-8 mb-4">5. Intellectual Property</h3>
                        <p className="mb-6">
                            The Codeminati platform, including its code, logo, and branding, is the intellectual property of Codeminati. User-generated content (problem statements, discussing posts) remains the property of the creator but we are granted a license to display it.
                        </p>

                        <h3 className="text-xl font-bold text-white mt-8 mb-4">6. Limitation of Liability</h3>
                        <p className="mb-6">
                            To the maximum extent permitted by law, Codeminati shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
                        </p>

                        <h3 className="text-xl font-bold text-white mt-8 mb-4">7. Termination</h3>
                        <p className="mb-6">
                            We reserve the right to suspend or terminate your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                        </p>

                        <h3 className="text-xl font-bold text-white mt-8 mb-4">8. Changes to Terms</h3>
                        <p className="mb-6">
                            We reserve the right to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                        </p>

                        <h3 className="text-xl font-bold text-white mt-8 mb-4">9. Contact Us</h3>
                        <p className="mb-6">
                            If you have any questions about these Terms, please contact us at <Link to="/support" className="text-blue-400 hover:text-blue-300">support</Link>.
                        </p>
                    </div>
                );
            case 'cookie':
                return (
                    <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300">Last updated: December 21, 2025</p>
                        <p className="text-gray-300">
                            We use cookies to enhance your experience. This policy explains what cookies are, how we use them, and your choices.
                        </p>
                        <h3 className="text-xl font-bold text-white mt-6 mb-3">1. What Are Cookies</h3>
                        <p className="text-gray-300">
                            Cookies are small text files that are used to store small pieces of information. They are stored on your device when the website is loaded on your browser.
                        </p>
                        <h3 className="text-xl font-bold text-white mt-6 mb-3">2. Essential Cookies</h3>
                        <p className="text-gray-300">
                            These cookies are necessary for the website to function properly and cannot be switched off in our systems.
                        </p>
                    </div>
                );
            default:
                return <p className="text-gray-400">Content coming soon...</p>;
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f15] py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                </button>

                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent w-fit">
                        {title}
                    </h1>
                    <div className="h-1 w-20 bg-primary/50 rounded-full"></div>
                </div>

                <div className="bg-[#13131a]/50 p-8 rounded-3xl border border-gray-800 backdrop-blur-sm">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default InfoPage;

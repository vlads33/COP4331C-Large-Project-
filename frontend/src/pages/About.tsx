import React from "react";
import Navbar from "../components/Navbar";

const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-4xl font-bold text-yellow-400 mb-6 text-center">
                    About Knights Marketplace ⚔️
                </h1>

                <p className="text-gray-300 text-lg leading-relaxed mb-8 text-center">
                    Knights Marketplace is a student-to-student buying and selling platform
                    created for the University of Central Florida community. It’s a safe and
                    simple way for students to exchange everyday
                    essentials<br/> All within the UCF network.
                </p>


                {/* Team Section */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-10">
                    <h2 className="text-2xl font-semibold text-yellow-400 mb-4 text-center">
                        👥 Team 18
                    </h2>

                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="text-yellow-400 border-b border-gray-700">
                            <th className="py-2 px-4">Team Member</th>
                            <th className="py-2 px-4">Role</th>
                        </tr>
                        </thead>
                        <tbody className="text-gray-300">
                        <tr className="border-b border-gray-700">
                            <td className="py-2 px-4">Vlad Sefer</td>
                            <td className="py-2 px-4">Database</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="py-2 px-4">Ethan Vincent</td>
                            <td className="py-2 px-4">Project Manager</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="py-2 px-4">Riley Kuiper</td>
                            <td className="py-2 px-4">API Developer</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="py-2 px-4">Adrian Salgado</td>
                            <td className="py-2 px-4">Frontend Developer</td>
                        </tr>
                        <tr>
                            <td className="py-2 px-4">Vraj Patel</td>
                            <td className="py-2 px-4">Frontend Developer</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                {/* GitHub Section */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center mb-10">
                    <h2 className="text-2xl font-semibold text-yellow-400 mb-3">
                        View Our Project on GitHub
                    </h2>
                    <p className="text-gray-300 mb-4">
                        Check out our full source code below:
                    </p>
                    <a
                        href="https://github.com/vlads33/COP4331C-Large-Project-"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg transition duration-300"
                    >
                        🌐 Visit GitHub Repository
                    </a>
                </div>

                <footer className="text-center text-gray-500 text-sm mt-10">
                    © {new Date().getFullYear()} Knights Marketplace
                </footer>
            </div>
        </div>
    );
};

export default About;

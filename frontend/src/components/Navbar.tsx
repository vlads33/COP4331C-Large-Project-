import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem("accessToken");
    const username = localStorage.getItem("username");

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("username");
        navigate("/");
    };

    return (
        <nav className="bg-gray-900 text-white flex items-center justify-between px-8 py-4 shadow-lg">
            <h1
                className="text-2xl font-bold text-yellow-400 cursor-pointer"
                onClick={() => navigate("/home")}
            >
                Knights<span className="text-white">Marketplace</span>
            </h1>

            <ul className="hidden md:flex gap-8 text-lg font-medium">
                <li><Link to="/home" className="hover:text-yellow-400">Home</Link></li>
                <li><Link to="/listing" className="hover:text-yellow-400">Listings</Link></li>
                <li><Link to="/sell" className="hover:text-yellow-400">Sell</Link></li>
                <li><Link to="/profile" className="hover:text-yellow-400">Profile</Link></li>
                <li><Link to="/about" className="hover:text-yellow-400">About</Link></li>
            </ul>

            <ul>
                <li>
                    <Link to="/cart" className="hover:text-yellow-400 text-2xl">
                        🛒
                    </Link>
                </li>
            </ul>

            {isLoggedIn ? (
                <div className="flex items-center gap-6">
                    <div className="text-right text-sm">
                        {username && (
                            <div className="text-gray-300">
                                Welcome, <span className="text-yellow-400">{username}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => navigate("/")}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                >
                    Login
                </button>
            )}
        </nav>
    );
};

export default Navbar;


import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="hover:text-red-500 transition-colors">
                            Home
                        </Link>
                        <Link to="/watchlist" className="hover:text-red-500 transition-colors">
                            Watchlist
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
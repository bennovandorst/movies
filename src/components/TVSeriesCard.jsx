import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

const TVSeriesCard = ({ series }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isInWatchlist, setIsInWatchlist] = useState(false);

    useEffect(() => {
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        setIsInWatchlist(watchlist.some(item => item.id === series.id && item.type === "tv"));
    }, [series.id]);

    const toggleWatchlist = (e) => {
        e.preventDefault();
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        const isInList = watchlist.some(item => item.id === series.id && item.type === "tv");

        if (isInList) {
            const updatedWatchlist = watchlist.filter(item => !(item.id === series.id && item.type === "tv"));
            localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
        } else {
            const updatedWatchlist = [...watchlist, { id: series.id, type: "tv", addedAt: new Date().toISOString() }];
            localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
        }

        setIsInWatchlist(!isInWatchlist);
    };

    return (
        <Link 
            to={`/tv/${series.id}`} 
            className="block transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="bg-gray-800 text-white rounded-xl shadow-lg overflow-hidden w-64 h-96 flex flex-col relative group">
                <div className="flex-grow relative">
                    <img
                        src={series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : "https://via.placeholder.com/500"}
                        alt={series.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={toggleWatchlist}
                            className={`p-2 rounded-full transition-colors ${
                                isInWatchlist
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                        >
                            <svg className="w-5 h-5" fill={isInWatchlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-all duration-300 transform ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{series.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                        <span>{series.first_air_date ? new Date(series.first_air_date).getFullYear() : ""}</span>
                        {series.vote_average && (
                            <>
                                <span>•</span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {series.vote_average.toFixed(1)}
                                </span>
                            </>
                        )}
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">{series.overview}</p>
                </div>
            </div>
        </Link>
    );
};

export default TVSeriesCard; 
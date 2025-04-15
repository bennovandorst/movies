import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const SharedWatchlist = () => {
    const [searchParams] = useSearchParams();
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("addedAt");
    const [filterType, setFilterType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid");

    useEffect(() => {
        const loadSharedWatchlist = async () => {
            try {
                const data = searchParams.get("data");
                if (!data) {
                    setError("No watchlist data provided");
                    setLoading(false);
                    return;
                }

                const watchlistData = JSON.parse(decodeURIComponent(data));
                const watchlistWithDetails = await Promise.all(
                    watchlistData.map(async (item) => {
                        try {
                            if (item.type !== "movie" && item.type !== "tv") {
                                return null;
                            }

                            const response = await axios.get(
                                `https://api.themoviedb.org/3/${item.type}/${item.id}?api_key=${import.meta.env.VITE_API_KEY}`
                            );
                            return {
                                ...response.data,
                                type: item.type,
                                addedAt: item.addedAt,
                                note: item.note || ""
                            };
                        } catch (err) {
                            console.error(`Error fetching details for ${item.type} ${item.id}:`, err);
                            return null;
                        }
                    })
                );
                setWatchlist(watchlistWithDetails.filter(Boolean));
            } catch (err) {
                setError("Failed to load shared watchlist");
                console.error("Error loading shared watchlist:", err);
            } finally {
                setLoading(false);
            }
        };

        loadSharedWatchlist();
    }, [searchParams]);

    const filterWatchlist = (items) => {
        return items.filter((item) => {
            const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                item.name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === "all" || item.type === filterType;
            return matchesSearch && matchesType;
        });
    };

    const sortWatchlist = (items) => {
        return [...items].sort((a, b) => {
            switch (sortBy) {
                case "title":
                    return (a.title || a.name).localeCompare(b.title || b.name);
                case "rating":
                    return b.vote_average - a.vote_average;
                case "year":
                    const yearA = new Date(a.release_date || a.first_air_date).getFullYear();
                    const yearB = new Date(b.release_date || b.first_air_date).getFullYear();
                    return yearB - yearA;
                case "addedAt":
                default:
                    return new Date(b.addedAt) - new Date(a.addedAt);
            }
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
                    <p className="text-gray-400">This shared watchlist may have expired or is invalid.</p>
                </div>
            </div>
        );
    }

    const filteredAndSortedWatchlist = sortWatchlist(filterWatchlist(watchlist));

    return (
        <div className="container mx-auto p-4 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Shared Watchlist</h1>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search watchlist..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="all">All Items</option>
                        <option value="movie">Movies</option>
                        <option value="tv">TV Shows</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="addedAt">Recently Added</option>
                        <option value="title">Title</option>
                        <option value="rating">Rating</option>
                        <option value="year">Year</option>
                    </select>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === "grid"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === "list"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {filteredAndSortedWatchlist.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No items found in this watchlist.</p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredAndSortedWatchlist.map((item) => (
                        <div
                            key={`${item.type}-${item.id}`}
                            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                            <Link to={`/${item.type}/${item.id}`}>
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                    alt={item.title || item.name}
                                    className="w-full h-auto object-cover"
                                />
                            </Link>
                            <div className="p-4">
                                <Link to={`/${item.type}/${item.id}`}>
                                    <h3 className="text-lg font-semibold text-white mb-2 truncate">
                                        {item.title || item.name}
                                    </h3>
                                </Link>
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <span>{new Date(item.release_date || item.first_air_date).getFullYear()}</span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        {item.vote_average.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAndSortedWatchlist.map((item) => (
                        <div
                            key={`${item.type}-${item.id}`}
                            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="flex">
                                <Link to={`/${item.type}/${item.id}`} className="flex-shrink-0">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                        alt={item.title || item.name}
                                        className="w-32 h-auto object-cover"
                                    />
                                </Link>
                                <div className="flex-1 p-4">
                                    <Link to={`/${item.type}/${item.id}`}>
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            {item.title || item.name}
                                        </h3>
                                    </Link>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {item.overview}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-gray-400">
                                        <div className="flex items-center space-x-4">
                                            <span>{new Date(item.release_date || item.first_air_date).getFullYear()}</span>
                                            <span>•</span>
                                            <span>{item.type === "movie" ? item.runtime + " min" : item.number_of_seasons + " seasons"}</span>
                                        </div>
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {item.vote_average.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SharedWatchlist; 
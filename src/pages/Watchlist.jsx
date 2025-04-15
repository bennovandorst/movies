import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("addedAt");
    const [filterType, setFilterType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid");
    const [editingNote, setEditingNote] = useState(null);
    const [noteText, setNoteText] = useState("");
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState("");
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const savedWatchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
                const watchlistWithDetails = await Promise.all(
                    savedWatchlist.map(async (item) => {
                        try {
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
                setError("Failed to load watchlist");
                console.error("Error loading watchlist:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlist();
    }, []);

    const updateItemNote = (id, type) => {
        const updatedWatchlist = watchlist.map(item => {
            if (item.id === id && item.type === type) {
                return { ...item, note: noteText };
            }
            return item;
        });
        setWatchlist(updatedWatchlist);
        localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist.map(item => ({
            id: item.id,
            type: item.type,
            addedAt: item.addedAt,
            note: item.note
        }))));
        setEditingNote(null);
        setNoteText("");
    };

    const removeFromWatchlist = (id, type) => {
        const updatedWatchlist = watchlist.filter(item => !(item.id === id && item.type === type));
        setWatchlist(updatedWatchlist);
        localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist.map(item => ({
            id: item.id,
            type: item.type,
            addedAt: item.addedAt,
            note: item.note
        }))));
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

    const filterWatchlist = (items) => {
        let filtered = items;
        
        if (filterType !== "all") {
            filtered = filtered.filter(item => item.type === filterType);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                (item.title || item.name).toLowerCase().includes(query) ||
                item.overview.toLowerCase().includes(query) ||
                (item.note && item.note.toLowerCase().includes(query))
            );
        }

        return filtered;
    };

    const filteredAndSortedWatchlist = sortWatchlist(filterWatchlist(watchlist));

    const handleShare = () => {
        const watchlistData = JSON.parse(localStorage.getItem("watchlist") || "[]");
        const shareableData = watchlistData.map(item => ({
            id: item.id,
            type: item.type,
            addedAt: item.addedAt
        }));
        const encodedData = encodeURIComponent(JSON.stringify(shareableData));
        const shareUrl = `${window.location.origin}/movies/#/shared-watchlist?data=${encodedData}`;
        setShareLink(shareUrl);
        setShowShareModal(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
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
                    <p className="text-gray-400">Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">My Watchlist</h1>
                
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
                        <button
                            onClick={handleShare}
                            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Share Your Watchlist</h3>
                            <p className="text-gray-400">Anyone with this link can view your watchlist</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={shareLink}
                                    readOnly
                                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={copyToClipboard}
                                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    Copy Link
                                </button>

                                {showCopiedMessage && (
                                    <div className="text-center text-green-400 text-sm animate-fade-in">
                                        Link copied to clipboard!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {filteredAndSortedWatchlist.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-white">No items found</h3>
                    <p className="mt-1 text-sm text-gray-400">
                        {watchlist.length === 0
                            ? "Add movies and TV shows to your watchlist to keep track of what you want to watch."
                            : "Try adjusting your search or filters to find what you're looking for."}
                    </p>
                    {watchlist.length === 0 && (
                        <Link
                            to="/"
                            className="mt-4 inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
                        >
                            Browse Movies & TV Shows
                        </Link>
                    )}
                </div>
            ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {filteredAndSortedWatchlist.map((item) => (
                        <div key={`${item.type}-${item.id}`} className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-300 ${viewMode === "list" ? "flex" : ""}`}>
                            <Link to={`/${item.type}/${item.id}`} className={viewMode === "list" ? "flex-shrink-0 w-48" : ""}>
                                <div className="relative">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${item.poster_path || item.backdrop_path}`}
                                        alt={item.title || item.name}
                                        className={`${viewMode === "list" ? "h-full w-full" : "w-full h-[400px]"} object-cover transition-transform duration-300 group-hover:scale-115`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute top-2 right-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeFromWatchlist(item.id, item.type);
                                            }}
                                            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </Link>
                            <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                                <Link to={`/${item.type}/${item.id}`}>
                                    <h3 className="text-xl font-semibold text-white hover:text-red-500 transition-colors">
                                        {item.title || item.name}
                                    </h3>
                                </Link>
                                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                                    <span>{new Date(item.release_date || item.first_air_date).getFullYear()}</span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        {item.vote_average.toFixed(1)}
                                    </span>
                                    <span>•</span>
                                    <span className="text-xs text-gray-500">
                                        Added {new Date(item.addedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-2">{item.overview}</p>
                                {editingNote === `${item.type}-${item.id}` ? (
                                    <div className="mt-2">
                                        <textarea
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            placeholder="Add a note..."
                                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            rows="2"
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                onClick={() => {
                                                    setEditingNote(null);
                                                    setNoteText("");
                                                }}
                                                className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => updateItemNote(item.id, item.type)}
                                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-2">
                                        {item.note ? (
                                            <div className="flex items-start justify-between">
                                                <p className="text-sm text-gray-400 italic">{item.note}</p>
                                                <button
                                                    onClick={() => {
                                                        setEditingNote(`${item.type}-${item.id}`);
                                                        setNoteText(item.note);
                                                    }}
                                                    className="text-gray-500 hover:text-white transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setEditingNote(`${item.type}-${item.id}`)}
                                                className="text-sm text-gray-500 hover:text-white transition-colors"
                                            >
                                                + Add note
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Watchlist; 
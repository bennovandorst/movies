import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInWatchlist, setIsInWatchlist] = useState(false);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_API_KEY}&append_to_response=credits`
                );
                setMovie(response.data);

                const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
                setIsInWatchlist(watchlist.some(item => item.id === Number(id) && item.type === "movie"));
            } catch (err) {
                setError("Failed to load movie details");
                console.error("Error fetching movie details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

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

    if (!movie) {
        return null;
    }

    const handleWatchlistClick = () => {
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        
        if (isInWatchlist) {
            const updatedWatchlist = watchlist.filter(item => !(item.id === Number(id) && item.type === "movie"));
            localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
            setIsInWatchlist(false);
        } else {
            const newItem = {
                id: Number(id),
                type: "movie",
                addedAt: new Date().toISOString(),
                note: ""
            };
            localStorage.setItem("watchlist", JSON.stringify([...watchlist, newItem]));
            setIsInWatchlist(true);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCrew = (credits) => {
        if (!credits?.crew) return { director: null, writer: null };
        return {
            director: credits.crew.find(member => member.job === "Director")?.name,
            writer: credits.crew.find(member => member.job === "Writer" || member.job === "Screenplay")?.name
        };
    };

    const getCast = (credits) => {
        if (!credits?.cast) return [];
        return credits.cast.slice(0, 3).map(actor => actor.name);
    };

    return (
        <div className="container mx-auto p-4 min-h-screen">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
                <div className="relative h-[500px]">
                    <img
                        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
                            <button
                                onClick={handleWatchlistClick}
                                className={`p-3 rounded-full transition-colors ${
                                    isInWatchlist
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white"
                                }`}
                            >
                                <svg className="w-6 h-6" fill={isInWatchlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center space-x-4 text-gray-300">
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                            <span>•</span>
                            <span>{movie.runtime} minutes</span>
                            <span>•</span>
                            <span className="flex items-center">
                                <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {movie.vote_average.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                            <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Details</h2>
                            <div className="space-y-2 text-gray-300">
                                <p><span className="font-semibold">Release Date:</span> {formatDate(movie.release_date)}</p>
                                <p><span className="font-semibold">Runtime:</span> {movie.runtime} minutes</p>
                                <p><span className="font-semibold">Genres:</span> {movie.genres?.map(genre => genre.name).join(", ")}</p>
                                <p><span className="font-semibold">Budget:</span> ${movie.budget?.toLocaleString() || "N/A"}</p>
                                <p><span className="font-semibold">Revenue:</span> ${movie.revenue?.toLocaleString() || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <div className="bg-gray-700 p-6 rounded-lg">
                            <div className="bg-gray-800 rounded-lg overflow-hidden">
                                <div className="p-4 border-b border-gray-700">
                                    <h4 className="text-xl font-bold text-white mb-2">Movie Information</h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                                        <span>{movie.runtime} minutes</span>
                                        <span>•</span>
                                        <span>{formatDate(movie.release_date)}</span>
                                        <span>•</span>
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {movie.vote_average.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-700 p-4 rounded-lg">
                                            <h5 className="text-lg font-semibold text-white mb-2">Behind the Scenes</h5>
                                            <div className="space-y-2 text-sm text-gray-300">
                                                {(() => {
                                                    const crew = getCrew(movie.credits);
                                                    return (
                                                        <>
                                                            {crew.director && (
                                                                <p className="flex items-center">
                                                                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span className="text-gray-400 mr-2">Director:</span>
                                                                    {crew.director}
                                                                </p>
                                                            )}
                                                            {crew.writer && (
                                                                <p className="flex items-center">
                                                                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    <span className="text-gray-400 mr-2">Writer:</span>
                                                                    {crew.writer}
                                                                </p>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        <div className="bg-gray-700 p-4 rounded-lg">
                                            <h5 className="text-lg font-semibold text-white mb-2">Cast</h5>
                                            <div className="space-y-2 text-sm text-gray-300">
                                                {(() => {
                                                    const cast = getCast(movie.credits);
                                                    if (cast.length === 0) {
                                                        return <p className="text-gray-400">No cast information available</p>;
                                                    }
                                                    return cast.map((actor, index) => (
                                                        <p key={index} className="flex items-center">
                                                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {actor}
                                                        </p>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
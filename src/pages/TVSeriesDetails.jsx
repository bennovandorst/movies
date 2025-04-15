import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TVSeriesDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [series, setSeries] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [episodes, setEpisodes] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const [isInWatchlist, setIsInWatchlist] = useState(false);

    useEffect(() => {
        const fetchSeriesDetails = async () => {
            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3/tv/${id}?api_key=${import.meta.env.VITE_API_KEY}`
                );
                setSeries(response.data);
                setSeasons(response.data.seasons || []);
                
                const episodesData = {};
                for (const season of response.data.seasons) {
                    const seasonResponse = await axios.get(
                        `https://api.themoviedb.org/3/tv/${id}/season/${season.season_number}?api_key=${import.meta.env.VITE_API_KEY}`
                    );
                    episodesData[season.season_number] = seasonResponse.data.episodes;
                }
                setEpisodes(episodesData);

                const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
                setIsInWatchlist(watchlist.some(item => item.id === Number(id) && item.type === "tv"));
            } catch (err) {
                setError("Failed to load TV series details");
                console.error("Error fetching TV series details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSeriesDetails();
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

    if (!series) {
        return null;
    }

    const handleWatchlistClick = () => {
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        
        if (isInWatchlist) {
            const updatedWatchlist = watchlist.filter(item => !(item.id === Number(id) && item.type === "tv"));
            localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
            setIsInWatchlist(false);
        } else {
            const newItem = {
                id: Number(id),
                type: "tv",
                addedAt: new Date().toISOString(),
                note: ""
            };
            localStorage.setItem("watchlist", JSON.stringify([...watchlist, newItem]));
            setIsInWatchlist(true);
        }
    };

    const getEpisodeCount = (seasonNumber) => {
        const season = seasons.find(s => s.season_number === seasonNumber);
        return season ? season.episode_count : 0;
    };

    const getEpisodeDetails = (seasonNumber, episodeNumber) => {
        const seasonEpisodes = episodes[seasonNumber];
        if (!seasonEpisodes) return null;
        return seasonEpisodes.find(ep => ep.episode_number === episodeNumber);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getGuestStars = (episode) => {
        if (!episode?.guest_stars) return [];
        return episode.guest_stars.slice(0, 3).map(star => star.name);
    };

    const getCrew = (episode) => {
        if (!episode?.crew) return { director: null, writer: null };
        return {
            director: episode.crew.find(member => member.job === "Director")?.name,
            writer: episode.crew.find(member => member.job === "Writer" || member.job === "Screenplay")?.name
        };
    };

    return (
        <div className="container mx-auto p-4 min-h-screen">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
                <div className="relative h-[500px]">
                    <img
                        src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`}
                        alt={series.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-4xl font-bold text-white">{series.name}</h1>
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
                            <span>{new Date(series.first_air_date).getFullYear()}</span>
                            <span>•</span>
                            <span>{series.number_of_seasons} Seasons</span>
                            <span>•</span>
                            <span>{series.number_of_episodes} Episodes</span>
                            <span>•</span>
                            <span className="flex items-center">
                                <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {series.vote_average.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                            <p className="text-gray-300 leading-relaxed">{series.overview}</p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Details</h2>
                            <div className="space-y-2 text-gray-300">
                                <p><span className="font-semibold">Status:</span> {series.status}</p>
                                <p><span className="font-semibold">Network:</span> {series.networks?.map(network => network.name).join(", ") || "N/A"}</p>
                                <p><span className="font-semibold">Genres:</span> {series.genres?.map(genre => genre.name).join(", ")}</p>
                                <p><span className="font-semibold">Created by:</span> {series.created_by?.map(creator => creator.name).join(", ") || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <div className="bg-gray-700 p-6 rounded-lg">
                            <h3 className="text-xl font-bold text-white mb-4">Select Season and Episode</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-300 mb-2">Season</label>
                                    <select
                                        value={selectedSeason}
                                        onChange={(e) => {
                                            const newSeason = Number(e.target.value);
                                            setSelectedSeason(newSeason);
                                            setSelectedEpisode(1);
                                        }}
                                        className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        {seasons.map(season => (
                                            <option key={season.season_number} value={season.season_number}>
                                                Season {season.season_number} ({season.episode_count} episodes)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Episode</label>
                                    <select
                                        value={selectedEpisode}
                                        onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                                        className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        {Array.from({ length: getEpisodeCount(selectedSeason) }, (_, i) => i + 1).map(episode => (
                                            <option key={episode} value={episode}>Episode {episode}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="bg-gray-800 rounded-lg overflow-hidden">
                                <div className="p-4 border-b border-gray-700">
                                    <h4 className="text-xl font-bold text-white mb-2">
                                        {getEpisodeDetails(selectedSeason, selectedEpisode)?.name || "Episode Title"}
                                    </h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                                        <span>Season {selectedSeason} • Episode {selectedEpisode}</span>
                                        <span>•</span>
                                        <span>{formatDate(getEpisodeDetails(selectedSeason, selectedEpisode)?.air_date)}</span>
                                        {getEpisodeDetails(selectedSeason, selectedEpisode)?.vote_average && (
                                            <>
                                                <span>•</span>
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    {getEpisodeDetails(selectedSeason, selectedEpisode)?.vote_average.toFixed(1)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-gray-300 mb-4">
                                        {getEpisodeDetails(selectedSeason, selectedEpisode)?.overview || "No description available for this episode."}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-700 p-4 rounded-lg">
                                            <h5 className="text-lg font-semibold text-white mb-2">Behind the Scenes</h5>
                                            <div className="space-y-2 text-sm text-gray-300">
                                                {(() => {
                                                    const crew = getCrew(getEpisodeDetails(selectedSeason, selectedEpisode));
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
                                            <h5 className="text-lg font-semibold text-white mb-2">Guest Stars</h5>
                                            <div className="space-y-2 text-sm text-gray-300">
                                                {(() => {
                                                    const guestStars = getGuestStars(getEpisodeDetails(selectedSeason, selectedEpisode));
                                                    if (guestStars.length === 0) {
                                                        return <p className="text-gray-400">No guest stars in this episode</p>;
                                                    }
                                                    return guestStars.map((star, index) => (
                                                        <p key={index} className="flex items-center">
                                                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {star}
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

export default TVSeriesDetails; 
import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieList from "../components/MovieList";
import TVSeriesList from "../components/TVSeriesList";
import MovieCarousel from "../components/MovieCarousel";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";


const Home = () => {
    const [movies, setMovies] = useState([]);
    const [tvSeries, setTVSeries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [featuredMovies, setFeaturedMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState("movies");

    const fetchMovies = async (page = 1) => {
        try {
            const url = searchTerm
                ? `https://api.themoviedb.org/3/search/movie?query=${searchTerm}&page=${page}&api_key=${import.meta.env.VITE_API_KEY}`
                : `https://api.themoviedb.org/3/trending/movie/day?page=${page}&api_key=${import.meta.env.VITE_API_KEY}`;
            const response = await axios.get(url);
            setMovies(response.data.results || []);
            setTotalPages(response.data.total_pages || 1);
        } catch (error) {
            console.error("Error fetching movies:", error);
        }
    };

    const fetchTVSeries = async (page = 1) => {
        try {
            const url = searchTerm
                ? `https://api.themoviedb.org/3/search/tv?query=${searchTerm}&page=${page}&api_key=${import.meta.env.VITE_API_KEY}`
                : `https://api.themoviedb.org/3/trending/tv/day?page=${page}&api_key=${import.meta.env.VITE_API_KEY}`;
            const response = await axios.get(url);
            setTVSeries(response.data.results || []);
            setTotalPages(response.data.total_pages || 1);
        } catch (error) {
            console.error("Error fetching TV series:", error);
        }
    };

    const fetchGenres = async () => {
        try {
            const [movieGenres, tvGenres] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${import.meta.env.VITE_API_KEY}`),
                axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${import.meta.env.VITE_API_KEY}`)
            ]);

            const allGenres = [...movieGenres.data.genres, ...tvGenres.data.genres];
            const uniqueGenres = Array.from(new Set(allGenres.map(genre => genre.id)))
                .map(id => allGenres.find(genre => genre.id === id));
            setGenres(uniqueGenres);
        } catch (error) {
            console.error("Error fetching genres:", error);
        }
    };

    const fetchFeaturedMovies = async () => {
        try {
            const response = await axios.get(
                `https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_API_KEY}`
            );
            setFeaturedMovies(response.data.results || []);
        } catch (error) {
            console.error("Error fetching featured movies:", error);
        }
    };

    useEffect(() => {
        if (activeTab === "movies") {
            fetchMovies(currentPage);
        } else {
            fetchTVSeries(currentPage);
        }
    }, [searchTerm, currentPage, activeTab]);

    useEffect(() => {
        fetchMovies(currentPage);
        fetchGenres();
        fetchFeaturedMovies();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedGenre, activeTab]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const filteredContent = selectedGenre
        ? (activeTab === "movies" ? movies : tvSeries).filter((item) => 
            item.genre_ids.includes(parseInt(selectedGenre)))
        : (activeTab === "movies" ? movies : tvSeries);

    return (
        <div className="container mx-auto p-4 min-h-screen text-white">
            <MovieCarousel featuredMovies={featuredMovies} onSelectMovie={setSearchTerm} />
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} genres={genres} selectedGenre={selectedGenre} setSelectedGenre={setSelectedGenre} />
            
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab("movies")}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        activeTab === "movies"
                            ? "bg-red-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                >
                    Movies
                </button>
                <button
                    onClick={() => setActiveTab("tv")}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        activeTab === "tv"
                            ? "bg-red-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                >
                    TV Series
                </button>
            </div>

            <h2 className="text-3xl font-semibold mb-4">
                {activeTab === "movies" ? "Movies" : "TV Series"}
            </h2>
            
            {filteredContent.length ? (
                activeTab === "movies" ? (
                    <MovieList movies={filteredContent} />
                ) : (
                    <TVSeriesList series={filteredContent} />
                )
            ) : (
                <div className="flex flex-col items-center justify-center h-64">
                    <span role="img" aria-label="Popcorn" className="text-6xl mb-4">🍿</span>
                    <p className="text-center text-2xl font-semibold mb-2">
                        Uh-oh! It's like a {activeTab === "movies" ? "movie" : "show"} without a plot...
                    </p>
                    <p className="text-center text-lg text-gray-500 mb-4">
                        We couldn't find any results for your search.
                    </p>
                    <p className="text-center text-sm italic text-gray-400">
                        (Try another search, or just grab some popcorn and browse instead!)
                    </p>
                </div>
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
    );
};

export default Home;
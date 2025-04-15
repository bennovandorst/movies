import { useState, useEffect } from "react";
import axios from "axios";
import carousel from "../data/carousel.json";

const MovieCarousel = () => {
    const [content, setContent] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {

                const customContentData = await Promise.all(
                    carousel.carouselContent.map(async (item) => {
                        try {
                            const response = await axios.get(
                                `https://api.themoviedb.org/3/${item.type}/${item.id}?api_key=${import.meta.env.VITE_API_KEY}`
                            );
                            return {
                                ...response.data,
                                contentType: item.type
                            };
                        } catch (err) {
                            console.error(`Failed to fetch ${item.type} ${item.id}:`, err);
                            return null;
                        }
                    })
                );


                const validCustomContent = customContentData.filter(item => item !== null);


                const [popularMoviesResponse, popularTVResponse] = await Promise.all([
                    axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_API_KEY}&language=en-US&page=1`),
                    axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${import.meta.env.VITE_API_KEY}&language=en-US&page=1`)
                ]);


                const popularMovies = popularMoviesResponse.data.results.map(movie => ({
                    ...movie,
                    contentType: 'movie'
                }));
                const popularTV = popularTVResponse.data.results.map(tv => ({
                    ...tv,
                    contentType: 'tv'
                }));


                const combinedContent = [...validCustomContent, ...popularMovies, ...popularTV];
                setContent(combinedContent);
            } catch (err) {
                setError("Failed to load content");
                console.error("Error fetching content:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [content.length]);

    if (loading) {
        return (
            <div className="relative h-[600px] bg-gray-900 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative h-[600px] bg-gray-900">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
                        <p className="text-gray-400">Please try again later.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!content.length) {
        return null;
    }

    const currentItem = content[currentIndex];
    const title = currentItem.title || currentItem.name;
    const releaseDate = currentItem.release_date || currentItem.first_air_date;
    const link = currentItem.contentType === 'movie' 
        ? `/movie/${currentItem.id}`
        : `/tv/${currentItem.id}`;

    return (
        <div className="relative h-[600px] overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src={`https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/50 to-transparent"></div>
            </div>
            <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {title}
                        </h2>
                        <p className="text-lg text-gray-300 mb-6 line-clamp-3">
                            {currentItem.overview}
                        </p>
                        <div className="flex items-center space-x-4 mb-6">
                            <span className="text-white">
                                {new Date(releaseDate).getFullYear()}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center text-white">
                                <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {currentItem.vote_average.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {content.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentIndex ? "bg-red-500 w-4" : "bg-gray-400"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default MovieCarousel;

import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import TVSeriesDetails from "./pages/TVSeriesDetails";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Watchlist from "./pages/Watchlist";
import SharedWatchlist from "./pages/SharedWatchlist";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/tv/:id" element={<TVSeriesDetails />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/shared-watchlist" element={<SharedWatchlist />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
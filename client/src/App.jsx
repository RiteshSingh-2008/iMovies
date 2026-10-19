import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import Auth from "./Auth";
import Showtimes from "./Showtimes";
import Seats from "./Seats";
import BookingConfirmation from "./BookingConfirmation";
import MyBookings from "./MyBookings";
import MyFavorites from "./MyFavorites";
import AdminDashboard from "./AdminDashboard";
import "./App.css";

const API_URL = "http://localhost:5000";

function Home({ user, onLogout }) {
  const [movies, setMovies] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteError, setFavoriteError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  
  async function toggleFavorite(movieId) {
    if (!user) {
      navigate("/login");
      return;
    }

    const token = JSON.parse(
      sessionStorage.getItem("imoviesAuth")
    )?.token;

    if (!token) {
      setFavoriteError("Please log in again to manage favorites.");
      return;
    }

    const isFavorite = favoriteIds.includes(movieId);

    try {
      setFavoriteError("");

      const response = await fetch(
        `${API_URL}/api/favorites/${movieId}`,
        {
          method: isFavorite ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update favorites.");
      }

      setFavoriteIds((current) =>
        isFavorite
          ? current.filter((id) => id !== movieId)
          : [...current, movieId]
      );
    } catch (error) {
      setFavoriteError(error.message);
    }
  }


  useEffect(() => {
    fetch(`${API_URL}/api/movies`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load movies");
        return response.json();
      })
      .then(setMovies)
      .catch(() => setError("Could not load movies. Check that the backend is running."))
      .finally(() => setLoading(false));
  }, []);

   
useEffect(() => {
  if (!user) {
    setFavoriteIds([]);
    return;
  }

  const token = JSON.parse(
    sessionStorage.getItem("imoviesAuth")
  )?.token;

  if (!token) {
    setFavoriteError("Please log in again to load your favorites.");
    return;
  }

  let cancelled = false;

  async function loadFavorites() {
    try {
      const response = await fetch(`${API_URL}/api/favorites/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load favorites.");
      }

      if (!cancelled) {
        setFavoriteIds(
          data.favorites.map((favorite) => favorite.movie?._id).filter(Boolean)
        );
      }
    } catch (error) {
      if (!cancelled) {
        setFavoriteError(error.message);
      }
    }
  }

  loadFavorites();

  return () => {
    cancelled = true;
  };
}, [user]);

return (
  <div className="app">
    <header className="navbar">
      <Link className="logo" to="/">
        i<span>MOVIES</span>
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        >
         {menuOpen ? "✕" : "☰"}
      </button>

      <nav className={`desktop-nav ${menuOpen ? "menu-open" : ""}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#movies" onClick={() => setMenuOpen(false)}>Movies</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>

          {user && (
            <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>
              My Bookings
            </Link>
          )}

          {user && (
            <Link to="/my-favorites" onClick={() => setMenuOpen(false)}>
              My Favorites
            </Link>
          )}
      </nav>

      {user ? (
        <div className="user-actions">
          <span className="welcome-user">Hi, {user.name}</span>
          <button className="login-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : (
        <button
          className="login-button"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      )}
    </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">YOUR NEXT MOVIE NIGHT STARTS HERE</p>

            <h1>
              Unfold the Drama.. 
              <br />
              <span>We’ve Got the Tickets..</span>
            </h1>

            <p className="hero-description">
              Discover unforgettable movies, choose your seats,
              and make your next cinema night special.
            </p>

            <a className="primary-button" href="#movies">
              Explore Movies ↓
            </a>

            <div className="hero-highlights">
              <span>✦ Discover movies</span>
              <span>✦ Choose your seats</span>
              <span>✦ Book your experience</span>
            </div>
          </div>
        </section>

        <section className="movies-section" id="movies">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NOW SHOWING</p>
              <h2>Explore Movies</h2>
            </div>
            <span className="movie-count">{movies.length} movies</span>
          </div>

          {loading && <p className="message">Loading movies...</p>}
          {error && <p className="message error">{error}</p>}
          {favoriteError && (
          <p className="message error">{favoriteError}</p>
          )}
          {!loading && !error && movies.length === 0 && (
            <p className="message">No movies available right now.</p>
          )}
          <div className="movie-filters">
            <input
              type="text"
              placeholder="Search movies by title..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="movie-search-input"
            />

            <select
              value={selectedGenre}
              onChange={(event) => setSelectedGenre(event.target.value)}
              className="movie-filter-select"
            >
              <option value="All">All Genres</option>
              <option value="Action">Action</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Thriller">Thriller</option>
              <option value="Romance">Romance</option>
            </select>

            <select
              value={selectedLanguage}
              onChange={(event) => setSelectedLanguage(event.target.value)}
              className="movie-filter-select"
            >
              <option value="All">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
              <option value="Korean">Korean</option>
            </select>
          </div>

          <div className="movie-grid">
             
          {movies
            .filter((movie) =>
              movie.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
            )
            .filter((movie) =>
              selectedGenre === "All" ||
              movie.genre.some(
                (genre) => genre.toLowerCase() === selectedGenre.toLowerCase()
              )              
            )
            .filter((movie) =>
            selectedLanguage === "All" ||
            movie.language?.toLowerCase() === selectedLanguage.toLowerCase()
            )
            .map((movie) => (

              <article className="movie-card" key={movie._id}>
                                
                <div className="poster-placeholder">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={`${movie.title} poster`}
                      className="movie-poster-image"
                    />
                  ) : (
                    <>
                      <span>IMOVIES</span>
                      <strong>{movie.title}</strong>
                      <small>{movie.language}</small>
                    </>
                  )}
                </div>

                
          <div className="movie-info">
          <div>
            <h3>{movie.title}</h3>
            <p>{movie.duration} min · {movie.genre.join(" / ")}</p>
          </div>

          <div className="movie-actions">
            <button
              type="button"
              className="favorite-button"
              aria-label={
                favoriteIds.includes(movie._id)
                  ? `Remove ${movie.title} from favorites`
                  : `Add ${movie.title} to favorites`
              }
              aria-pressed={favoriteIds.includes(movie._id)}
              onClick={() => toggleFavorite(movie._id)}
            >
              {favoriteIds.includes(movie._id) ? "♥ Saved" : "♡ Favorite"}
            </button>

            <button
              className="book-button"
              onClick={() => {
                if (user) {
                  navigate(`/showtimes/${movie._id}`);
                } else {
                  navigate(`/login?next=booking&movie=${movie._id}`);
                }
              }}
            >
              Book
            </button>
          </div>
        </div>

              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <h2>Your movie. Your moment.</h2>
          <p>Find a film, choose a show, and get ready for the big screen.</p>
        </section>
      </main>

      <footer>
        <Link className="logo" to="/">i<span>MOVIES</span></Link>
        <p>(Made by --RSR and team--)</p>
      </footer>
    </div>
  );
}

function AppContent() {
  const [authData, setAuthData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("imoviesAuth")) || null;
    } catch {
      return null;
    }
  });

  function handleLogin(data) {
    const next = new URLSearchParams(window.location.search).get("next");
    sessionStorage.setItem("imoviesAuth", JSON.stringify(data));
    setAuthData(data);
    if (next === "booking") {
      // Booking flow will be connected in the next step.
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("imoviesAuth");
    setAuthData(null);
  }

  return (
    <Routes>
      <Route path="/" element={<Home user={authData?.user} onLogout={handleLogout} />} />
      <Route path="/login" element={<Auth mode="login" onLogin={handleLogin} />} />
      <Route path="/register" element={<Auth mode="register" onLogin={handleLogin} />} />
      <Route path="/showtimes/:movieId" element={<Showtimes />} />
      <Route path="/seats/:showId" element={<Seats />} />
      <Route path="/confirm-booking/:showId" element={<BookingConfirmation />}/>
      <Route path="/my-favorites" element={<MyFavorites />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route
         path="/admin"
          element={
            authData?.user?.role === "admin" ? (
          <AdminDashboard />
       ) : (
      <Navigate to="/login" replace />
    )
  }
/>
      <Route path="*" element={<Home user={authData?.user} onLogout={handleLogout} />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

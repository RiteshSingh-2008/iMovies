import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:5000";

function MyFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadFavorites() {
    const authData = JSON.parse(
      sessionStorage.getItem("imoviesAuth") || "null"
    );
    const token = authData?.token;

    if (!token) {
      setError("Please log in to view your favorites.");
      setLoading(false);
      return;
    }

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

      setFavorites(data.favorites || []);
    } catch (err) {
      setError(err.message || "Unable to load favorites.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  async function removeFavorite(movieId) {
    const authData = JSON.parse(
      sessionStorage.getItem("imoviesAuth") || "null"
    );

    try {
      const response = await fetch(
        `${API_URL}/api/favorites/${movieId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authData?.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove favorite.");
      }

      setFavorites((current) =>
        current.filter((favorite) => favorite.movie?._id !== movieId)
      );
    } catch (err) {
      setError(err.message || "Unable to remove favorite.");
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <Link className="logo" to="/">
          i<span>MOVIES</span>
        </Link>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/my-bookings">My Bookings</Link>
        </nav>
      </header>

      <main className="movies-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR COLLECTION</p>
            <h2>My Favorites</h2>
          </div>
          <span className="movie-count">
            {favorites.length} movies
          </span>
        </div>

        {loading && <p className="message">Loading favorites...</p>}

        {error && <p className="message error">{error}</p>}

        {!loading && !error && favorites.length === 0 && (
          <div className="message">
            <p>You haven't saved any favorite movies yet.</p>
            <Link className="primary-button" to="/">
              Explore Movies
            </Link>
          </div>
        )}

        {!loading && favorites.length > 0 && (
          <div className="movie-grid">
            {favorites.map((favorite) => {
              const movie = favorite.movie;

              if (!movie) return null;

              return (
                <article className="movie-card" key={favorite._id}>
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
                      <p>
                        {movie.duration} min ·{" "}
                        {(movie.genre || []).join(" / ")}
                      </p>
                    </div>

                    <div className="movie-actions">
                      <button
                        className="favorite-button"
                        onClick={() => removeFavorite(movie._id)}
                      >
                        ♥ Remove
                      </button>

                      <button
                        className="book-button"
                        onClick={() =>
                          navigate(`/showtimes/${movie._id}`)
                        }
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyFavorites;

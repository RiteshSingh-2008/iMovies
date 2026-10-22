import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000";

function AdminDashboard() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    genre: "",
    duration: "",
    language: "English",
    posterUrl: "",
    releaseDate: "",
    certificate: "UA",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
const [movies, setMovies] = useState([]);
const [showMessage, setShowMessage] = useState("");
const [showError, setShowError] = useState("");
const [showLoading, setShowLoading] = useState(false);
const [editingMovieId, setEditingMovieId] = useState(null);

async function loadShowtimes() {
  setShowtimesLoading(true);

  try {
    const auth = JSON.parse(
      sessionStorage.getItem("imoviesAuth")
    );
    const token = auth?.token;

    const response = await fetch(`${API_URL}/api/shows`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not load showtimes");
    }

    setShowtimes(data);
  } catch (error) {
    setShowError(error.message);
  } finally {
    setShowtimesLoading(false);
  }
}

const [showForm, setShowForm] = useState({
  movieId: "",
  cinemaName: "IMovies Cinema",
  screenName: "Screen 1",
  showDate: "",
  startTime: "",
  ticketPrice: "200",
  totalSeats: "50",
});
const [showtimes, setShowtimes] = useState([]);
const [showtimesLoading, setShowtimesLoading] = useState(false);


useEffect(() => {
  async function loadMovies() {
    try {
      const response = await fetch(`${API_URL}/api/movies`);

      if (!response.ok) {
        throw new Error("Could not load movies");
      }

      const data = await response.json();
      setMovies(data);
    } catch (err) {
      setShowError(err.message);
    }
  }

   loadMovies();
   loadShowtimes();
}, []);


async function handleDeleteShowtime(showId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this showtime?"
  );

  if (!confirmed) return;

  try {
    const auth = JSON.parse(
      sessionStorage.getItem("imoviesAuth")
    );
    const token = auth?.token;

    const response = await fetch(`${API_URL}/api/shows/${showId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete showtime");
    }

    setShowtimes((current) =>
      current.filter((show) => show._id !== showId)
    );
    setShowMessage("Showtime deleted successfully!");
    setShowError("");
  } catch (error) {
    setShowError(error.message);
  }
}


  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  
function handleEditMovie(movie) {
  setEditingMovieId(movie._id);

  setForm({
    title: movie.title || "",
    description: movie.description || "",
    genre: Array.isArray(movie.genre) ? movie.genre.join(", ") : "",
    duration: String(movie.duration ?? ""),
    language: movie.language || "English",
    posterUrl: movie.posterUrl || "",
    releaseDate: movie.releaseDate
      ? movie.releaseDate.slice(0, 10)
      : "",
    certificate: movie.certificate || "UA",
  });

  setMessage("");
  setError("");
  window.scrollTo({ top: 0, behavior: "smooth" });
}


async function handleDeleteMovie(movieId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this movie? This action cannot be undone."
  );

  if (!confirmed) return;

  setMessage("");
  setError("");

  try {
    const authData = JSON.parse(
      sessionStorage.getItem("imoviesAuth") || "null"
    );

    const response = await fetch(`${API_URL}/api/movies/${movieId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authData?.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete movie");
    }

    setMovies((currentMovies) =>
      currentMovies.filter((movie) => movie._id !== movieId)
    );

    setMessage("Movie deleted successfully!");
  } catch (err) {
    setError(err.message);
  }
}

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const authData = JSON.parse(
      sessionStorage.getItem("imoviesAuth") || "null"
    );

    if (!authData?.token) {
      setError("Please log in first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
         editingMovieId
          ? `${API_URL}/api/movies/${editingMovieId}`
         : `${API_URL}/api/movies`,
          {
        method: editingMovieId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify({
          ...form,
          genre: form.genre.split(",").map((item) => item.trim()).filter(Boolean),
          duration: Number(form.duration),
          releaseDate: form.releaseDate || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add the movie.");
      }

      setMessage(
        editingMovieId
         ? "Movie updated successfully!"
         : "Movie added successfully!"
    );

    setEditingMovieId(null);

      setForm({
        title: "",
        description: "",
        genre: "",
        duration: "",
        language: "English",
        posterUrl: "",
        releaseDate: "",
        certificate: "UA",
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  
async function handleShowSubmit(event) {
  event.preventDefault();
  setShowMessage("");
  setShowError("");

  const authData = JSON.parse(
    sessionStorage.getItem("imoviesAuth") || "null"
  );

  if (!authData?.token) {
    setShowError("Please log in first.");
    return;
  }

  setShowLoading(true);

  try {
    const response = await fetch(`${API_URL}/api/shows`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.token}`,
      },
      body: JSON.stringify({
        ...showForm,
        ticketPrice: Number(showForm.ticketPrice),
        totalSeats: Number(showForm.totalSeats),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not create showtime.");
    }

    setShowMessage("Showtime created successfully!");
    setShowForm((current) => ({
      ...current,
      showDate: "",
      startTime: "",
    }));
  } catch (err) {
    setShowError(err.message || "Something went wrong.");
  } finally {
    setShowLoading(false);
  }
}


  const fields = [
    ["title", "Movie title", "text"],
    ["description", "Description", "textarea"],
    ["genre", "Genres (comma-separated)", "text"],
    ["duration", "Duration in minutes", "number"],
    ["language", "Language", "text"],
    ["posterUrl", "Poster image URL", "url"],
    ["releaseDate", "Release date", "date"],
    ["certificate", "Certificate (e.g. U, UA, A)", "text"],
  ];

  return (
    <main className="admin-dashboard">
      <Link to="/" style={{ color: "#c4a7ff" }}>← Back to Movies</Link>
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">
        Manage your movie catalogue and scheduled showtimes.
        </p>

      {message && <p style={{ color: "#86efac" }}>{message}</p>}
      {error && <p style={{ color: "#ff8b8b" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, marginTop: 24 }}>
        {fields.map(([name, label, type]) => (
          <label key={name} style={{ display: "grid", gap: 8 }}>
            {label}
            {type === "textarea" ? (
              <textarea
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
                rows={4}
              />
            ) : (
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                required={["title", "genre", "duration", "language"].includes(name)}
                min={type === "number" ? 1 : undefined}
              />
            )}
          </label>
        ))}

        <button type="submit" disabled={loading} style={{
          padding: 14,
          border: 0,
          borderRadius: 8,
          background: "#c084fc",
          color: "#190d23",
          fontWeight: 700,
          cursor: "pointer",
        }}>
          {loading ? "Adding movie..." : "Add Movie"}
        </button>
      </form>
      
        <section style={{ marginTop: 48 }}>
        <h2>Schedule a Showtime</h2>
        <p>Select a movie and enter its screening details.</p>

        {showMessage && (
            <p style={{ color: "#86efac" }}>{showMessage}</p>
        )}
        {showError && (
            <p style={{ color: "#ff8b8b" }}>{showError}</p>
        )}

        <form
            onSubmit={handleShowSubmit}
            style={{ display: "grid", gap: 16, marginTop: 24 }}
        >
            <label>
            Movie
            <select
                required
                value={showForm.movieId}
                onChange={(event) =>
                setShowForm((current) => ({
                    ...current,
                    movieId: event.target.value,
                }))
                }
            >
                <option value="">Select a movie</option>
                {movies.map((movie) => (
                <option key={movie._id} value={movie._id}>
                    {movie.title}
                </option>
                ))}
            </select>
            </label>

            {[
            ["cinemaName", "Cinema name", "text"],
            ["screenName", "Screen name", "text"],
            ["showDate", "Show date", "date"],
            ["startTime", "Start time", "time"],
            ["ticketPrice", "Ticket price (₹)", "number"],
            ["totalSeats", "Total seats", "number"],
            ].map(([name, label, type]) => (
            <label key={name} style={{ display: "grid", gap: 8 }}>
                {label}
                <input
                type={type}
                required
                min={
                    name === "ticketPrice" ? 0
                    : name === "totalSeats" ? 1
                    : undefined
                }
                value={showForm[name]}
                onChange={(event) =>
                    setShowForm((current) => ({
                    ...current,
                    [name]: event.target.value,
                    }))
                }
                />
            </label>
            ))}

            <button type="submit" disabled={showLoading}>
            {showLoading ? "Saving showtime..." : "Create Showtime"}
            </button>
        </form>
        </section>

        <section className="manage-movies-section">
          <h2>Manage Movies</h2>

          <div className="manage-movies-list">
            {movies.map((movie) => (
              <div className="manage-movie-row" key={movie._id}>
                <div className="manage-movie-info">
                  <strong>{movie.title}</strong>
                  <p>
                    {movie.language} · {movie.duration} min
                  </p>
                </div>

                <div className="manage-movie-actions">
                  <button
                    type="button"
                    className="edit-movie-btn"
                    onClick={() => handleEditMovie(movie)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-movie-btn"
                    onClick={() => handleDeleteMovie(movie._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        
        <section style={{ marginTop: "48px" }}>
        <h2>Manage Showtimes</h2>

        {showtimesLoading ? (
            <p>Loading showtimes...</p>
        ) : showtimes.length === 0 ? (
            <p>No showtimes found.</p>
        ) : (
            showtimes.map((show) => (
            <div
                key={show._id}
                style={{
                padding: "16px",
                marginBottom: "12px",
                border: "1px solid #49376a",
                borderRadius: "8px",
                }}
            >
                <strong>{show.movie?.title || "Unknown movie"}</strong>
                <p>Cinema: {show.cinemaName}</p>
                <p>Screen: {show.screenName}</p>
                <p>Date: {new Date(show.showDate).toLocaleDateString()}</p>
                <p>Time: {show.startTime}</p>
                <p>Ticket Price: ₹{show.ticketPrice}</p>
                <p>
                Seats booked: {show.bookedSeats?.length || 0} / {show.totalSeats}
                </p>
                
                <button
                type="button"
                onClick={() => handleDeleteShowtime(show._id)}
                style={{
                    marginTop: "8px",
                    padding: "8px 12px",
                    background: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                }}
                >
                Delete Showtime
                </button>

            </div>
            ))
        )}
        </section>
   </main>
  );
}

export default AdminDashboard;

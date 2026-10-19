import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");


async function handleCancelBooking(bookingId) {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this booking?"
  );

  if (!confirmed) return;

  setCancellingId(bookingId);
  setCancelMessage("");

  try {
    const authData = JSON.parse(
      sessionStorage.getItem("imoviesAuth") || "null"
    );

    const response = await fetch(
      `${API_URL}/api/bookings/${bookingId}/cancel`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authData?.token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to cancel booking");
    }

    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking._id === bookingId
          ? { ...booking, status: "cancelled" }
          : booking
      )
    );

    setCancelMessage("Booking cancelled successfully.");
  } catch (error) {
    setCancelMessage(error.message);
  } finally {
    setCancellingId("");
  }
}


  useEffect(() => {
    async function loadBookings() {
      try {
        const authData = JSON.parse(
          sessionStorage.getItem("imoviesAuth") || "null"
        );

        if (!authData?.token) {
          setError("Please log in to view your bookings.");
          return;
        }

        const response = await fetch(`${API_URL}/api/bookings/my`, {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load bookings.");
        }

        setBookings(Array.isArray(data) ? data : data.bookings || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  return (
    <main style={{ padding: "32px", color: "white", minHeight: "70vh" }}>
      <Link to="/" style={{ color: "#c4a7ff" }}>
        ← Back to Movies
      </Link>

      <h1
        style={{
            margin: "0 0 16px",
            color: "#c4b5fd",
            fontSize: "32px",
            lineHeight: 1.2,
            fontWeight: 700,
        }}
        >
        Booking Confirmed!
        </h1>
      <p>View your booked movie tickets here.</p>

      {loading && <p>Loading your bookings...</p>}
      {error && <p style={{ color: "#ff8b8b" }}>{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p>You haven't booked any tickets yet.</p>
      )}

      <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
        {bookings.map((booking) => {
          const show = booking.show;
          const movie = show?.movie;

          return (
            <article
              key={booking._id}
              style={{
                background: "#211a35",
                border: "1px solid #49376a",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <h2>{movie?.title || "Movie details unavailable"}</h2>
              <p>
                Cinema: {show?.cinemaName || "Not available"}
              </p>
              <p>
                Screen: {show?.screenName || "Not available"}
              </p>
              <p>
                Date:{" "}
                {show?.showDate
                  ? new Date(show.showDate).toLocaleDateString()
                  : "Not available"}
              </p>
              <p>Time: {show?.startTime || "Not available"}</p>
              <p>Seats: {booking.seats?.join(", ") || "Not available"}</p>
              <p>Total amount: ₹{booking.totalAmount}</p>
              <p>Status: {booking.status || "confirmed"}</p>
              
                {booking.status !== "cancelled" && (
                <button
                    onClick={() => handleCancelBooking(booking._id)}
                    disabled={cancellingId === booking._id}
                    style={{
                    marginTop: "12px",
                    padding: "10px 16px",
                    background: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 700,
                    }}
                >
                    {cancellingId === booking._id
                    ? "Cancelling..."
                    : "Cancel Booking"}
                </button>
                )}

            </article>
          );
        })}
      </div>
      {cancelMessage && <p>{cancelMessage}</p>}
    </main>
  );
}

export default MyBookings;

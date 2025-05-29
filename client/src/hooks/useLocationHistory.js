import { useState, useEffect } from "react";
import axios from "axios";

export const useLocationHistory = (locationName) => {
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      // Reset states
      setHistory(null);
      setError(null);

      // Validate locationName
      if (
        !locationName ||
        typeof locationName !== "string" ||
        !locationName.trim()
      ) {
        setError("Invalid location name");
        return;
      }

      setIsLoading(true);

      try {
        const sanitizedLocation = locationName.trim();
        const response = await axios.get(
          `http://localhost:5000/api/history/${encodeURIComponent(sanitizedLocation)}`,
        );

        if (response.data.status === "success") {
          setHistory(response.data.data.history);
        } else {
          setError("No history data available");
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch history. Please try again later.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [locationName]);

  return { history, isLoading, error };
};

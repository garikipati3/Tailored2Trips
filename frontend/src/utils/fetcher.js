const uri = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function fetcher(endpoint, options = {}) {
  if (!uri) {
    throw new Error("VITE_API_URL is not defined in environment variables");
  }

  const fullUrl = `${uri}${endpoint}`;

  const fetchOptions = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // if you use cookies for auth
  };

  try {
    const res = await fetch(fullUrl, fetchOptions);
    return await res.json();
  } catch (err) {
    console.error("❌ Fetcher Error:", err.message);
    throw err;
  }
}

export default fetcher;

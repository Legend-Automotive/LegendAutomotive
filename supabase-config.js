// Supabase Configuration
// This file exports the Supabase client instance for use across the application.

// Ensure the Supabase library is loaded before this script runs.
// Add <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> to your HTML head.

// TODO: Provide the new Supabase URL and Anon Key below
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";

// Expose key globally for admin usage
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

// Initialize the client if the library is available
if (typeof window.supabase !== "undefined") {
  if (window.supabase.createClient) {
    // First time initialization: Library is present
    const client = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          storageKey: "legend-admin-auth",
          storage: window.sessionStorage,
        },
      },
    );
    // Overwrite the library object with the client instance
    // This allows 'supabase' global to be used for queries (supabase.from...)
    window.supabase = client;
  } else {
    // Already initialized (window.supabase is now the client)
    console.log("Supabase client already initialized.");
  }
} else {
  console.warn(
    "Supabase JS library not loaded. Ensure the CDN script is included in your HTML.",
  );
}

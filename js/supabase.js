console.log("🔥 SUPABASE.JS CARREGADO!");

const SUPABASE_URL =
  "https://ylswdixgbyaznosavsjl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_PB181O1Cy3W3KeEO-gQFyw_wWgKh6Aa";

window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("CLIENTE:", window.supabaseClient);
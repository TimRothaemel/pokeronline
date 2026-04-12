import { createClient } from "@supabase/supabase-js";

const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicnhydGJmeWx0eWZkbmxiY2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTA4NDcsImV4cCI6MjA4Nzc4Njg0N30.4Q-EHWFm4TQ-wwpAM7FAHieqDKC2AluuUSpp9Mkb0uc";
const url =
  import.meta.env.VITE_SUPABASE_URL ?? "https://dbrxrtbfyltyfdnlbcfy.supabase.co";

const supabase = createClient(url, anonKey);

export default supabase;

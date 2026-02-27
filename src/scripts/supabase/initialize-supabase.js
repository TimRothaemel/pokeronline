import { createClient } from '../../../node_modules/@supabase/supabase-js';

const anonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicnhydGJmeWx0eWZkbmxiY2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTA4NDcsImV4cCI6MjA4Nzc4Njg0N30.4Q-EHWFm4TQ-wwpAM7FAHieqDKC2AluuUSpp9Mkb0uc"
const url = "https://dbrxrtbfyltyfdnlbcfy.supabase.co"

// Create a single supabase client for interacting with your database
const supabaseClient = createClient(url, anonKey)

console.log("Supabase client initialized:", supabaseClient);

export default supabaseClient

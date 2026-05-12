import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oetsoahjhtcsyacflali.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ldHNvYWhqaHRjc3lhY2ZsYWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjQwNzgsImV4cCI6MjA4OTYwMDA3OH0.7V3jb5fJHry3GQkdkQE7OcDt2xNaYHkBYPIxaCwNIus';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

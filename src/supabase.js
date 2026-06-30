import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const key = supabaseServiceRoleKey || supabaseAnonKey;
const invalidUrl = !supabaseUrl || supabaseUrl.includes('tu_url') || !/^https?:\/\//i.test(supabaseUrl);
const invalidKey = !key || key.includes('tu_anon_key');

if (invalidUrl || invalidKey) {
  throw new Error(
    'Configura correctamente SUPABASE_URL y SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY en el archivo .env.\n' +
    'Ejemplo:\n' +
    'SUPABASE_URL=https://<tu-proyecto>.supabase.co\n' +
    'SUPABASE_ANON_KEY=eyJ...\n' +
    'SUPABASE_SERVICE_ROLE_KEY=eyJ... (opcional, necesario si Row Level Security está activado)'
  );
}

if (!supabaseServiceRoleKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY no está configurado. Si tienes RLS activado, las operaciones de escritura pueden fallar.');
}

export const supabase = createClient(supabaseUrl, key);
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Player {
  id: string;
  name: string;
  document_type: 'cnpj' | 'cpf' | 'passport';
  document: string;
  bank_format: 'br' | 'routing' | 'swift';
  bank_name: string;
  bank_branch?: string;
  bank_account: string;
  routing_number?: string;
  swift_code?: string;
  iban?: string;
  created_at?: string;
}

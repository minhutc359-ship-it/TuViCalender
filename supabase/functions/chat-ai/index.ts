import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createChatHandler } from '../_shared/chat-handler.ts';

Deno.serve(createChatHandler({ createClient, env: (name) => Deno.env.get(name), fetch }));

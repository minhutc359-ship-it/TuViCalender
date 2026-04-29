# Supabase Edge Functions

## Setup

### 1. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
curl -fsSL https://raw.githubusercontent.com/supabase/supabase/master/docker/docker-compose.yml -o docker-compose.yml
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to your project

```bash
supabase link --project-ref your-project-ref
```

## Deploy Functions

### Deploy AI Chat Function

```bash
# Set OpenAI API key as secret
supabase secrets set OPENAI_API_KEY=sk-your-openai-key

# Deploy function
supabase functions deploy chat-ai
```

### Deploy Good Days Calculator

```bash
supabase functions deploy good-days
```

## Test Locally

### Start Supabase locally

```bash
supabase start
```

### Run function locally

```bash
supabase functions serve chat-ai
```

### Test with curl

```bash
# Test chat-ai
curl -i --location --request POST 'http://localhost:54321/functions/v1/chat-ai' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"message":"Hôm nay có may mắn không?","context":{"currentDate":"2026-04-29"}}'

# Test good-days
curl -i --location --request POST 'http://localhost:54321/functions/v1/good-days' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"year":2026,"month":5,"eventType":"wedding"}'
```

## Environment Variables

Edge Functions can access these environment variables:

- `SUPABASE_URL` - Auto-injected
- `SUPABASE_ANON_KEY` - Auto-injected
- `OPENAI_API_KEY` - Set via `supabase secrets set`

## Invoke from Frontend

```typescript
import { supabase } from './lib/supabase';

// Call chat-ai function
const { data, error } = await supabase.functions.invoke('chat-ai', {
  body: {
    message: 'Hôm nay có may mắn không?',
    chatHistory: [],
    context: getCurrentContext()
  }
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('AI Reply:', data.reply);
}
```

## Monitoring

View function logs:

```bash
supabase functions logs chat-ai
```

## Cost Optimization

### 1. Caching

Cache AI responses for common questions:

```typescript
// Check cache first
const { data: cached } = await supabase
  .from('ai_responses_cache')
  .select('*')
  .eq('message_hash', hash(message))
  .single();

if (cached && Date.now() - cached.created_at < 3600000) {
  return cached.response;
}

// Call OpenAI and cache result
const aiResponse = await callOpenAI(message);
await supabase.from('ai_responses_cache').insert({
  message_hash: hash(message),
  response: aiResponse
});
```

### 2. Rate Limiting

```typescript
// Check rate limit
const { count } = await supabase
  .from('chat_histories')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .gte('created_at', new Date(Date.now() - 86400000).toISOString());

const limit = user.subscription === 'premium' ? 100 : 10;
if (count >= limit) {
  throw new Error('Rate limit exceeded');
}
```

## Security

### Row Level Security

Edge Functions run with `service_role` permissions by default. To respect RLS:

```typescript
// Use anon key to respect RLS
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
);
```

### CORS

All functions include CORS headers for browser access. Restrict origins in production:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

## Troubleshooting

**Function not found:**
- Make sure you deployed: `supabase functions deploy chat-ai`
- Check function name matches in invoke call

**Unauthorized error:**
- Include `Authorization` header with JWT token
- Use `supabase.auth.getSession()` to get token

**OpenAI API error:**
- Check secret is set: `supabase secrets list`
- Verify API key is valid and has credits

**CORS error:**
- Ensure OPTIONS request returns 200
- Check `Access-Control-Allow-Origin` header

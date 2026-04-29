/**
 * Supabase Edge Function: AI Chat
 * Handles AI chat requests securely with API key on server-side
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, chatHistory, context } = await req.json();

    // Validate input
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt with context
    const systemPrompt = `Bạn là chuyên gia tử vi và chiêm tinh AI, kết hợp kiến thức phương Đông và phương Tây.

# Kiến thức của bạn:

## Phương Đông:
- Bát tự, Can Chi, Ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ)
- Tử vi đẩu số
- Phong thủy: Hướng nhà, màu sắc, số may mắn
- Lịch vạn niên: Ngày hoàng đạo, hắc đạo, giờ đẹp
- 12 Trực, 28 Tú

## Phương Tây:
- 12 cung hoàng đạo
- Hành tinh chi phối
- Aspects

# Cách trả lời:
1. Ngắn gọn, dễ hiểu
2. Dùng emoji, bullet points
3. Lời khuyên cụ thể
4. Tích cực, động viên

# Thông tin ngày hiện tại:
${context ? `
- Dương lịch: ${context.currentDate || ''}
- Âm lịch: ${context.lunarDate || ''}
- Can Chi: ${context.canChi || ''}
- Ngày ${context.dayAnalysis?.truc || ''} (${context.dayAnalysis?.isHoangDao ? 'Hoàng Đạo' : 'Hắc Đạo'})
- Điểm: ${context.dayAnalysis?.score || 0}/100
- Giờ tốt: ${context.dayAnalysis?.luckyHours?.join(', ') || ''}
` : ''}`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).slice(-10), // Last 10 messages
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const aiData = await openaiResponse.json();
    const aiReply = aiData.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

    // Save chat to database
    await supabaseClient.from('chat_histories').insert([
      { user_id: user.id, role: 'user', content: message },
      { user_id: user.id, role: 'assistant', content: aiReply }
    ]);

    return new Response(
      JSON.stringify({ reply: aiReply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Supabase Edge Function: Good Days Calculator
 * Calculate good days for a specific event type
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified lunar calendar functions for Edge Function
// (In production, you'd import from a shared module or npm package)

const TRUC = [
  'Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp',
  'Phá', 'Nguy', 'Thành', 'Thâu', 'Khai', 'Bế'
];

const HOANG_DAO = ['Kiến', 'Trừ', 'Mãn', 'Định', 'Chấp', 'Thành', 'Khai'];

function getTruc(lunarDay: number, lunarMonth: number): string {
  const index = (lunarMonth + lunarDay - 2) % 12;
  return TRUC[index];
}

function isHoangDao(truc: string): boolean {
  return HOANG_DAO.includes(truc);
}

// Simplified lunar conversion (use proper library in production)
function solarToLunar(day: number, month: number, year: number) {
  // This is a placeholder - use proper lunar calendar library
  // For demo purposes, we'll return approximate values
  return {
    day: day - 15 > 0 ? day - 15 : day + 15,
    month: month,
    year: year,
    isLeap: false
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { year, month, eventType, birthYear } = await req.json();

    if (!year || !month) {
      return new Response(
        JSON.stringify({ error: 'Year and month are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const goodDays = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const lunar = solarToLunar(day, month, year);
      const truc = getTruc(lunar.day, lunar.month);
      const isGood = isHoangDao(truc);

      if (isGood) {
        let score = 70; // Base score for Hoàng Đạo

        // Adjust score based on event type
        if (eventType === 'wedding' && ['Kiến', 'Định', 'Thành'].includes(truc)) {
          score += 20;
        } else if (eventType === 'business' && ['Khai', 'Thành'].includes(truc)) {
          score += 20;
        }

        goodDays.push({
          day,
          lunar,
          truc,
          score,
          description: `Ngày ${truc} - Hoàng Đạo`
        });
      }
    }

    // Sort by score
    goodDays.sort((a, b) => b.score - a.score);

    return new Response(
      JSON.stringify({ goodDays: goodDays.slice(0, 10) }),
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

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, missionType } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    const now = new Date();

    // Check daily mission limit (5 missions per day)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayMissions, error: dailyError } = await supabase
      .from('mission_completions')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString());

    if (dailyError) {
      console.error('Database error:', dailyError);
    }

    const dailyCount = todayMissions?.length || 0;
    const dailyLimit = 5;

    if (dailyCount >= dailyLimit) {
      return NextResponse.json({
        allowed: false,
        reason: 'daily_limit',
        message: `You have reached the daily limit of ${dailyLimit} missions`,
        cooldownEnds: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        remainingMissions: 0,
      });
    }

    // Check mission type cooldown (24 hours between same mission type)
    if (missionType) {
      const cooldownHours = 24;
      const cooldownStart = new Date(now.getTime() - cooldownHours * 60 * 60 * 1000);

      const { data: recentMissions, error: cooldownError } = await supabase
        .from('mission_completions')
        .select('created_at, mission_type')
        .eq('user_id', userId)
        .eq('mission_type', missionType)
        .gte('created_at', cooldownStart.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (cooldownError) {
        console.error('Database error:', cooldownError);
      }

      if (recentMissions && recentMissions.length > 0) {
        const lastCompletion = new Date(recentMissions[0].created_at);
        const cooldownEnds = new Date(lastCompletion.getTime() + cooldownHours * 60 * 60 * 1000);
        const hoursRemaining = Math.ceil((cooldownEnds.getTime() - now.getTime()) / (1000 * 60 * 60));

        return NextResponse.json({
          allowed: false,
          reason: 'mission_cooldown',
          message: `You must wait ${hoursRemaining} hours before completing this mission type again`,
          cooldownEnds: cooldownEnds.toISOString(),
          lastCompletion: lastCompletion.toISOString(),
        });
      }
    }

    // Check rate limiting (minimum 30 minutes between any missions)
    const rateLimitMinutes = 30;
    const rateLimitStart = new Date(now.getTime() - rateLimitMinutes * 60 * 1000);

    const { data: recentAnyMission, error: rateError } = await supabase
      .from('mission_completions')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', rateLimitStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (rateError) {
      console.error('Database error:', rateError);
    }

    if (recentAnyMission && recentAnyMission.length > 0) {
      const lastCompletion = new Date(recentAnyMission[0].created_at);
      const cooldownEnds = new Date(lastCompletion.getTime() + rateLimitMinutes * 60 * 1000);
      const minutesRemaining = Math.ceil((cooldownEnds.getTime() - now.getTime()) / (1000 * 60));

      return NextResponse.json({
        allowed: false,
        reason: 'rate_limit',
        message: `Please wait ${minutesRemaining} minutes before starting another mission`,
        cooldownEnds: cooldownEnds.toISOString(),
      });
    }

    return NextResponse.json({
      allowed: true,
      remainingMissions: dailyLimit - dailyCount,
      dailyCount,
      dailyLimit,
    });
  } catch (error: any) {
    console.error('Cooldown check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check cooldown' },
      { status: 500 }
    );
  }
}

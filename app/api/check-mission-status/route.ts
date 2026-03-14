import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, missionId } = await request.json();

    if (!userId || !missionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for active mission start
    const { data: missionStart, error } = await supabase
      .from('mission_starts')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .eq('completed', false)
      .order('started_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to check mission status' },
        { status: 500 }
      );
    }

    if (!missionStart || missionStart.length === 0) {
      return NextResponse.json({
        status: 'not_started',
        canStart: true,
      });
    }

    const start = missionStart[0];
    const now = new Date();
    const expiresAt = new Date(start.expires_at);
    const isExpired = now > expiresAt;

    if (isExpired) {
      return NextResponse.json({
        status: 'expired',
        canStart: true,
        startedAt: start.started_at,
        expiresAt: start.expires_at,
      });
    }

    // Calculate time remaining
    const timeRemaining = expiresAt.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({
      status: 'in_progress',
      canComplete: true,
      startedAt: start.started_at,
      expiresAt: start.expires_at,
      timeRemaining: {
        hours: hoursRemaining,
        minutes: minutesRemaining,
        total: timeRemaining,
      },
    });
  } catch (error: any) {
    console.error('Check mission status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check mission status' },
      { status: 500 }
    );
  }
}

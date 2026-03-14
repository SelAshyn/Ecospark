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

    // Check if user already has an active (non-expired) start for this mission
    const { data: existingStart, error: checkError } = await supabase
      .from('mission_starts')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .eq('completed', false)
      .gte('expires_at', new Date().toISOString())
      .order('started_at', { ascending: false })
      .limit(1);

    if (checkError) {
      console.error('Database error:', checkError);
    }

    // If already started and not expired, return existing
    if (existingStart && existingStart.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyStarted: true,
        startedAt: existingStart[0].started_at,
        expiresAt: existingStart[0].expires_at,
      });
    }

    // Create new mission start
    const expiresAt = new Date(Date.now() + 36 * 60 * 60 * 1000); // 36 hours from now

    const { data: newStart, error: insertError } = await supabase
      .from('mission_starts')
      .insert({
        user_id: userId,
        mission_id: missionId,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        completed: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to start mission' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyStarted: false,
      startedAt: newStart.started_at,
      expiresAt: newStart.expires_at,
    });
  } catch (error: any) {
    console.error('Start mission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start mission' },
      { status: 500 }
    );
  }
}

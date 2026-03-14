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

    // Delete or mark the mission start as withdrawn
    const { error } = await supabase
      .from('mission_starts')
      .delete()
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .eq('completed', false);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to withdraw mission' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mission withdrawn successfully',
    });
  } catch (error: any) {
    console.error('Withdraw mission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to withdraw mission' },
      { status: 500 }
    );
  }
}

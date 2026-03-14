import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// @ts-ignore - imghash doesn't have type definitions
import { hash } from 'imghash';
import sharp from 'sharp';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, userId } = await request.json();

    if (!imageBase64 || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate perceptual hash (detects similar images)
    const perceptualHash = await hash(buffer, 16);

    // Generate exact hash using crypto
    const exactHash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Check for exact duplicates
    const { data: exactDuplicates, error: exactError } = await supabase
      .from('mission_completions')
      .select('id, user_id, created_at')
      .eq('image_hash', exactHash)
      .limit(5);

    if (exactError) {
      console.error('Database error:', exactError);
    }

    // Check for similar images (perceptual hash)
    const { data: allHashes, error: hashError } = await supabase
      .from('mission_completions')
      .select('id, user_id, perceptual_hash, created_at')
      .not('perceptual_hash', 'is', null)
      .limit(1000);

    if (hashError) {
      console.error('Database error:', hashError);
    }

    // Calculate hamming distance for similar images
    const similarImages: any[] = [];
    if (allHashes) {
      for (const record of allHashes) {
        if (record.perceptual_hash) {
          const distance = hammingDistance(perceptualHash, record.perceptual_hash);
          // Threshold: 0-5 = very similar, 6-10 = similar
          if (distance <= 10) {
            similarImages.push({
              ...record,
              similarity: 100 - (distance * 10), // Convert to percentage
            });
          }
        }
      }
    }

    const isDuplicate = (exactDuplicates && exactDuplicates.length > 0) || similarImages.length > 0;
    const isSelfDuplicate = exactDuplicates?.some((d: any) => d.user_id === userId) ||
                           similarImages.some((d: any) => d.user_id === userId);

    return NextResponse.json({
      isDuplicate,
      isSelfDuplicate,
      exactHash,
      perceptualHash,
      exactDuplicates: exactDuplicates || [],
      similarImages: similarImages.sort((a, b) => b.similarity - a.similarity).slice(0, 5),
      warnings: isDuplicate ? [
        isSelfDuplicate
          ? 'You have already submitted this or a very similar image'
          : 'This image has been submitted by another user'
      ] : [],
    });
  } catch (error: any) {
    console.error('Duplicate check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check for duplicates' },
      { status: 500 }
    );
  }
}

// Calculate hamming distance between two hex strings
function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 999;

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const xor = parseInt(hash1[i], 16) ^ parseInt(hash2[i], 16);
    distance += xor.toString(2).split('1').length - 1;
  }
  return distance;
}

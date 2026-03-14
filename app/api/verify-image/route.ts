import { NextRequest, NextResponse } from 'next/server';
import exifParser from 'exif-parser';
import { getDistance } from 'geolib';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, userLocation } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const metadata = await sharp(buffer).metadata();

    let exifData: any = null;
    let warnings: string[] = [];
    let isValid = true;

    // Try to extract EXIF data
    try {
      const parser = exifParser.create(buffer);
      exifData = parser.parse();

      if (!exifData.tags || Object.keys(exifData.tags).length === 0) {
        exifData = null;
      }
    } catch (error) {
      exifData = null;
    }

    // CRITICAL CHECK: No EXIF = Screenshot/Downloaded image
    if (!exifData || !exifData.tags) {
      return NextResponse.json({
        isValid: false,
        warnings: ['REJECTED: No EXIF data - This is a screenshot or downloaded image, not an original camera photo'],
        exifData: null,
        locationValid: false,
        distanceFromUser: null,
        metadata: {
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
        },
      });
    }

    // Check for camera information (REQUIRED)
    const hasCameraInfo = exifData.tags.Make || exifData.tags.Model;
    if (!hasCameraInfo) {
      warnings.push('REJECTED: No camera information found');
      isValid = false;
    }

    // Check for timestamp (REQUIRED)
    if (!exifData.tags.DateTimeOriginal) {
      warnings.push('REJECTED: No timestamp found in photo');
      isValid = false;
    } else {
      const photoTimestamp = new Date(exifData.tags.DateTimeOriginal * 1000);
      const now = new Date();
      const hoursDiff = (now.getTime() - photoTimestamp.getTime()) / (1000 * 60 * 60);

      // Changed to 1.5 days (36 hours)
      if (hoursDiff > 36) {
        warnings.push(`REJECTED: Photo is ${Math.round(hoursDiff)} hours old (must be within 36 hours / 1.5 days)`);
        isValid = false;
      }

      if (hoursDiff < 0) {
        warnings.push('REJECTED: Photo timestamp is in the future');
        isValid = false;
      }
    }

    // Check GPS coordinates (REQUIRED for location verification)
    let locationValid = false;
    let distanceFromUser = null;

    if (exifData.tags.GPSLatitude && exifData.tags.GPSLongitude) {
      if (userLocation) {
        const photoLocation = {
          latitude: exifData.tags.GPSLatitude,
          longitude: exifData.tags.GPSLongitude,
        };

        distanceFromUser = getDistance(
          { latitude: userLocation.lat, longitude: userLocation.lng },
          photoLocation
        );

        // Allow 5km radius
        if (distanceFromUser > 5000) {
          warnings.push(`REJECTED: Photo location is ${(distanceFromUser / 1000).toFixed(1)}km away from your current location (max 5km allowed)`);
          isValid = false;
        } else {
          locationValid = true;
        }
      }
    } else {
      // GPS data is missing - this is suspicious for modern phones
      warnings.push('WARNING: No GPS data in photo - location cannot be verified');
      // Don't fail completely as some cameras don't include GPS, but flag it
    }

    // Check for editing software
    if (exifData.tags.Software) {
      const software = exifData.tags.Software.toLowerCase();
      if (software.includes('photoshop') || software.includes('gimp') || software.includes('editor') || software.includes('snip')) {
        warnings.push('REJECTED: Photo shows signs of editing software');
        isValid = false;
      }
    }

    // Check metadata count - real photos have lots of EXIF data
    const tagCount = Object.keys(exifData.tags).length;
    if (tagCount < 5) {
      warnings.push(`REJECTED: Too few EXIF tags (${tagCount}) - likely screenshot`);
      isValid = false;
    }

    return NextResponse.json({
      isValid,
      warnings,
      exifData: {
        timestamp: exifData.tags.DateTimeOriginal ? new Date(exifData.tags.DateTimeOriginal * 1000).toISOString() : null,
        location: exifData.tags.GPSLatitude ? {
          lat: exifData.tags.GPSLatitude,
          lng: exifData.tags.GPSLongitude,
        } : null,
        camera: {
          make: exifData.tags.Make || null,
          model: exifData.tags.Model || null,
        },
        software: exifData.tags.Software || null,
        tagCount,
      },
      locationValid,
      distanceFromUser,
      metadata: {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
      },
    });
  } catch (error: any) {
    console.error('EXIF verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify image' },
      { status: 500 }
    );
  }
}

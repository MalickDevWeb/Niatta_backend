import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env before anything else
config({ path: path.resolve(process.cwd(), '.env') });

import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from './cloudinary';

async function runTest() {
  console.log('Testing Cloudinary Integration...');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);

  // Create a dummy image file for testing
  const dummyFilePath = path.resolve(__dirname, 'dummy.png');
  // Just a 1x1 transparent PNG buffer
  const dummyBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  
  try {
    console.log('\n1. Testing Upload...');
    const url = await uploadToCloudinary(dummyBuffer, 'test_folder');
    console.log('Upload successful! URL:', url);

    console.log('\n2. Testing Public ID Extraction...');
    const publicId = extractPublicId(url);
    console.log('Extracted Public ID:', publicId);

    if (!publicId) {
      throw new Error('Failed to extract public ID');
    }

    console.log('\n3. Testing Deletion...');
    await deleteFromCloudinary(publicId);
    console.log('Deletion successful!');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();

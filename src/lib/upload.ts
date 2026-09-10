import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function saveFile(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name;
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const uniqueName = `${uuidv4()}${extension}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const path = join(uploadDir, uniqueName);

    await writeFile(path, buffer);
    
    // URL relative qui sera servie par Next.js
    return `http://localhost:3000/uploads/${uniqueName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    return null;
  }
}

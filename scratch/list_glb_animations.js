import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const glbPath = path.join(__dirname, '..', 'public', 'char2.glb');

try {
  const buffer = fs.readFileSync(glbPath);
  
  // Read GLB header
  const magic = buffer.readUInt32LE(0);
  const version = buffer.readUInt32LE(4);
  const totalLength = buffer.readUInt32LE(8);
  
  if (magic !== 0x46546C67) {
    console.error('Invalid GLB file: bad magic number');
    process.exit(1);
  }
  
  // Read chunk 0 (JSON)
  const chunkLength = buffer.readUInt32LE(12);
  const chunkType = buffer.readUInt32LE(16);
  
  if (chunkType !== 0x4E4F534A) { // "JSON"
    console.error('Invalid GLB file: chunk 0 is not JSON');
    process.exit(1);
  }
  
  const jsonBuffer = buffer.slice(20, 20 + chunkLength);
  const gltf = JSON.parse(jsonBuffer.toString('utf8'));
  
  if (gltf.animations && gltf.animations.length > 0) {
    console.log('Animations found in char2.glb:');
    gltf.animations.forEach((anim, idx) => {
      console.log(`[${idx}] Name: "${anim.name}"`);
    });
  } else {
    console.log('No animations found in char2.glb');
  }
} catch (err) {
  console.error('Error reading GLB:', err);
}

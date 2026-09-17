import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import { uploadToCloudinary } from './src/lib/cloudinary';

const prisma = new PrismaClient();

async function run() {
  console.log("🔍 Test: Création d'une boutique avec preuve photo...");
  
  // 1. Lire une image locale et la convertir en base64 pour simuler la caméra
  const imgPath = path.resolve(__dirname, '../frontend-angular/public/assets/images/products/sucre.jpg');
  const imgBuffer = fs.readFileSync(imgPath);
  const base64Data = imgBuffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64Data}`;
  
  // 2. Simuler l'upload Cloudinary (comme dans route.ts)
  console.log("📤 Envoi de la photo sur Cloudinary...");
  const bufferToUpload = Buffer.from(base64Data, 'base64');
  const cloudinaryUrl = await uploadToCloudinary(bufferToUpload, 'observations');
  console.log(`✅ Photo uploadée avec succès : ${cloudinaryUrl}`);
  
  // 3. Simuler la création de la boutique dans la BDD (comme dans route.ts)
  const product = await prisma.product.findFirst();
  const format = await prisma.productFormat.findFirst();
  const user = await prisma.user.findFirst();
  
  const lat = 14.6928;
  const lng = -17.4467;
  
  console.log("🏪 Création de la boutique dans la BDD...");
  const store = await prisma.store.create({
    data: {
      name: 'Boutique Test Initialization',
      city: 'Dakar',
      neighborhood: 'Plateau',
      latitude: lat,
      longitude: lng,
      imageUrl: cloudinaryUrl, // The first image is the main image
      photos: [cloudinaryUrl], // Saved in photos array
      source: 'citizen_report'
    }
  });
  
  // 4. Update PostGIS location
  await prisma.$executeRaw`
    UPDATE "Store" 
    SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) 
    WHERE id = ${store.id}::uuid
  `;
  
  console.log(`✅ Boutique créée avec succès. ID: ${store.id}`);
  console.log(`📸 Photos associées: ${store.photos.join(', ')}`);
  
  // 5. Cleanup
  console.log("🧹 Nettoyage du test...");
  await prisma.store.delete({ where: { id: store.id } });
  console.log("✅ Test terminé avec succès !");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

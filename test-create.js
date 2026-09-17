const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  try {
    const passwordHash = await bcrypt.hash('pass', 10);
    const role = await prisma.role.findFirst({ where: { slug: 'homme_terrain' } });
    if (!role) {
       console.error("Le rôle homme_terrain n'existe pas !");
       return;
    }
    
    const user = await prisma.user.create({
      data: {
        name: 'Agent Test',
        phone: '778889900',
        passwordHash,
        photoUrl: '',
        roles: {
          create: {
            roleId: role.id
          }
        }
      }
    });
    console.log(user);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();

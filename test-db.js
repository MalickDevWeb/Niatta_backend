const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { phone: '+221771719013' },
      include: {
        roles: {
          include: { role: true }
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

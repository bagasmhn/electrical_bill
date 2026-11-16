import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@listrik.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@listrik.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // Seed sample customer user
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@listrik.com' },
    update: {},
    create: {
      name: 'Budi Pelanggan',
      email: 'customer@listrik.com',
      password: customerPassword,
      role: Role.CUSTOMER,
    },
  });

  // Seed Electricity Services
  const service1 = await prisma.electricityService.upsert({
    where: { code: 'R1-900' },
    update: {},
    create: {
      code: 'R1-900',
      name: 'Rumah Tangga 900 VA',
      powerVa: 900,
      pricePerKwh: 1352,
      isActive: true,
    },
  });

  const service2 = await prisma.electricityService.upsert({
    where: { code: 'R1-1300' },
    update: {},
    create: {
      code: 'R1-1300',
      name: 'Rumah Tangga 1300 VA',
      powerVa: 1300,
      pricePerKwh: 1444.7,
      isActive: true,
    },
  });

  console.log({ admin, customer, service1, service2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

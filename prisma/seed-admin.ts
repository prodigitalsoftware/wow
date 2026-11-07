import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function main() {
  const email = 'admin@dramabox.demo'
  const password = 'admin123'
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: hashPassword(password) },
    create: { email, passwordHash: hashPassword(password) },
  })
  console.log(`Admin ready: ${email} / ${password}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

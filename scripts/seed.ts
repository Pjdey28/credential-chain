import { prisma } from "../lib/prisma";
import { createIssuer } from "../lib/issuer";

async function main() {
  const issuer = await createIssuer(
    "National Institute of Technology Rourkela",
    "NITR"
  );

  console.log("Issuer initialized:");
  console.log({
    id: issuer.id,
    name: issuer.name,
    code: issuer.code,
    publicKey: issuer.publicKey,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
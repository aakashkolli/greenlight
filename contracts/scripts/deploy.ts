import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH');

  const GrantFactory = await ethers.getContractFactory('GrantFactory');
  const factory = await GrantFactory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log('\nGrantFactory deployed to:', factoryAddress);

  // Write .deployment.json
  const deploymentInfo = {
    GrantFactory: factoryAddress,
    deployer: deployer.address,
    network: 'localhost',
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(ROOT, '.deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Auto-patch root .env with the new factory address
  const envPath = path.join(ROOT, '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const factoryLine = `NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`;
  if (envContent.includes('NEXT_PUBLIC_FACTORY_ADDRESS=')) {
    envContent = envContent.replace(/NEXT_PUBLIC_FACTORY_ADDRESS=.*/g, factoryLine);
  } else {
    envContent = envContent.trimEnd() + '\n' + factoryLine + '\n';
  }
  fs.writeFileSync(envPath, envContent);

  console.log('\n.env updated with NEXT_PUBLIC_FACTORY_ADDRESS:', factoryAddress);
  console.log('\nRun next: npm run db:setup');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

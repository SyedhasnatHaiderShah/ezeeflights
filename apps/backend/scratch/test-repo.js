const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { PackageRepository } = require('./dist/modules/packages/package.repository');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get(PackageRepository);
  try {
    const pkg = await repo.findPackageById('2', 'package');
    console.log('Found package:', pkg.title);
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
run();

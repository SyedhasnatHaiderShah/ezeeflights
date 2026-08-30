const { MysqlClient } = require('./dist/database/mysql.client');
const { PackageRepository } = require('./dist/modules/packages/package.repository');

async function run() {
  const db = new MysqlClient();
  const repo = new PackageRepository(db);
  try {
    const pkg = await repo.findPackageById('2', 'package');
    console.log('findPackageById("2", "package") =>', pkg);
  } catch (e) {
    console.error('findPackageById error:', e);
  }

  try {
    const pkg2 = await repo.findPackageById('2', 'flight_deal');
    console.log('findPackageById("2", "flight_deal") =>', pkg2);
  } catch (e) {
    console.error('findPackageById error:', e);
  }

  process.exit(0);
}
run();

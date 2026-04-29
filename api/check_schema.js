const knex = require('knex');
const path = require('path');

const dbPath = path.resolve('c:/Runchables/Project Dev/Project01/New folder/apps/api/api.sqlite');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true
});

async function main() {
  try {
    const tableInfo = await db.raw('PRAGMA table_info(users)');
    console.log('--- TABLE INFO ---');
    console.table(tableInfo);

    const indexList = await db.raw('PRAGMA index_list(users)');
    console.log('--- INDEX LIST ---');
    console.table(indexList);

    for (const index of indexList) {
      const indexInfo = await db.raw(`PRAGMA index_info(${index.name})`);
      console.log(`--- INDEX INFO for ${index.name} ---`);
      console.table(indexInfo);
    }
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await db.destroy();
  }
}

main();

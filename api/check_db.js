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
    const users = await db('users').select('*');
    console.log('--- ALL USERS ---');
    users.forEach(u => {
      console.log(`ID: ${u.id}, Email: ${u.email}, GoogleID: ${u.googleId}, Name: ${u.name}`);
    });
    console.log('-----------------');
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await db.destroy();
  }
}

main();

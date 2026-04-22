
const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Setup lowdb
const adapter = new JSONFile('db.json');
const defaultData = { users: [], tasks: [], prospects: [], inbox: [], messages: [], docs: [], notes: [] };
const db = new Low(adapter, defaultData);

async function main() {
  await db.read();

  app.get('/', (req, res) => {
    res.send('ThreatScope CRM API is running!');
  });

  // A simple endpoint to get all data for a user
  app.get('/api/data', async (req, res) => {
    // For now, we'll just return all data.
    // Later, we will implement user-specific data.
    await db.read();
    res.json(db.data);
  });

  // A simple endpoint to update all data for a user
  app.post('/api/data', async (req, res) => {
      await db.read();
      db.data = req.body;
      await db.write();
      res.status(200).send('Data saved');
  });


  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

main();

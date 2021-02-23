const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/characters', async (req, res) => {
  try {
    const data = await client.query('SELECT * from characters');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/characters/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('select * from characters where id=$1', [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.post('/characters', async (req, res) => {
  try {
    const data = await client.query('insert into characters(character_name, created, wears_clothes, species, url, owner_id) values ($1, $2, $3, $4, $5, $6) returning *',
      [
        req.body.character_name,
        req.body.created,
        req.body.wears_clothes,
        req.body.species,
        req.body.url,
        1
      ]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.delete('/characters/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('delete from characters where id=$1 returning *', [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.put('/characters/:id', async (req, res) => {
  const id = req.params.id;

  try {

    const data = await client.query('UPDATE characters SET character_name = $1, created = $2, wears_clothes = $3, species = $4, url = $5 WHERE id = $6 returning *',
      [
        req.body.character_name,
        req.body.created,
        req.body.wears_clothes,
        req.body.species,
        req.body.url,
        id,
      ]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;


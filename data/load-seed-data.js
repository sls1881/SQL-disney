const client = require('../lib/client');
// import our seed data:
const { characters } = require('./characters.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
const { speciesData } = require('./speciesData.js')

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];

    const species = await Promise.all(speciesData.map(spec => {
      return client.query(`
                      INSERT INTO species (species_type)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [spec.species_type]);
    })
    );

    await Promise.all(
      characters.map(character => {
        return client.query(`
                    INSERT INTO characters (character_name, created, wears_clothes, species_id, url,  owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
          [character.character_name,
          character.created,
          character.wears_clothes,
          character.species_id,
          character.url,
          user.id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}

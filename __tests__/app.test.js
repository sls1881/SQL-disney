require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns all characters', async () => {

      const expectation = [
        {
          id: 1,
          character_name: 'Micky Mouse',
          created: 1928,
          wears_clothes: true,
          species: 'mouse',
          url: 'https://kidscreen.com/wp/wp-content/uploads/2018/03/Mickey_Mous.jpg',
          owner_id: 1
        },
        {
          id: 2,
          character_name: 'Minnie Mouse',
          created: 1928,
          wears_clothes: true,
          species: 'mouse',
          url: 'https://d23.com/app/uploads/2013/04/1180w-600h_minnie-mouse_1.jpg',
          owner_id: 1
        },
        {
          id: 3,
          character_name: 'Donald Duck',
          created: 1934,
          wears_clothes: true,
          species: 'duck',
          url: 'https://i.pinimg.com/originals/aa/c7/d7/aac7d727c770af98a289eac19b61b590.gif',
          owner_id: 1
        },
        {
          id: 4,
          character_name: 'Daisy Duck',
          created: 1940,
          wears_clothes: true,
          species: 'duck',
          url: 'https://secure.img1-fg.wfcdn.com/im/10866926/resize-h600-w600%5Ecompr-r85/2354/23543785/Disney+Mickey+and+Friends+Daisy+Duck+Cutout+Wall+Decal.jpg',
          owner_id: 1
        },
        {
          id: 5,
          character_name: 'Pluto',
          created: 1930,
          wears_clothes: true,
          species: 'dog',
          url: 'https://static.wikia.nocookie.net/tvdinners/images/3/35/Pluto.png/revision/latest?cb=20180528194113',
          owner_id: 1
        },
        {
          id: 6,
          character_name: 'Goofy',
          created: 1932,
          wears_clothes: true,
          species: 'dog',
          url: 'https://i.pinimg.com/originals/d4/33/6a/d4336ae44b6d4a2b08feefedd893e4ba.jpg',
          owner_id: 1
        },

      ];

      const data = await fakeRequest(app)
        .get('/characters')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    //Test for single character by ID
    test('return a single id', async () => {

      const expectation = {
        id: 2,
        character_name: 'Minnie Mouse',
        created: 1928,
        wears_clothes: true,
        species: 'mouse',
        url: 'https://d23.com/app/uploads/2013/04/1180w-600h_minnie-mouse_1.jpg',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/characters/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);


      const nothing = await fakeRequest(app)
        .get('/characters/100')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });

    //Test for post
    test('Create a new character and adds it to our data', async () => {

      const newCharacter = {
        id: 7,
        character_name: 'Snow White',
        created: 1937,
        wears_clothes: true,
        species: 'human',
        url: 'http://thecriticalreel.com/wp-content/uploads/2019/01/FEATURE-IMAGE-gm-snow-white.jpg',
      };

      const expectationChar = {
        ...newCharacter,
        id: 7,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .post('/characters')
        .send(newCharacter)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectationChar);


      const allCharacters = await fakeRequest(app)
        .get('/characters')
        .expect('Content-Type', /json/)
        .expect(200);

      const snowWhite = allCharacters.body.find(character => character.character_name === 'Snow White');

      expect(snowWhite).toEqual(expectationChar);
    });

    //Test for delete
    test('Delete a single character by id', async () => {

      const expectation = {
        id: 2,
        character_name: 'Minnie Mouse',
        created: 1928,
        wears_clothes: true,
        species: 'mouse',
        url: 'https://d23.com/app/uploads/2013/04/1180w-600h_minnie-mouse_1.jpg',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .delete('/characters/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);


      const nothing = await fakeRequest(app)
        .get('/characters/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });

    //Test for update/put
    test('Update a single character data by ID', async () => {

      const newChar = {
        character_name: 'Minnie Mouse',
        created: 1930,
        wears_clothes: true,
        species: 'mouse',
        url: 'https://d23.com/app/uploads/2013/04/1180w-600h_minnie-mouse_1.jpg',
      };

      const expectedChar = {
        ...newChar,
        id: 1,
        owner_id: 1,
      };

      await fakeRequest(app)
        .put('/characters/1')
        .send(newChar)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedChar = await fakeRequest(app)
        .get('/characters/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updatedChar.body).toEqual(expectedChar);
    });


  });
});



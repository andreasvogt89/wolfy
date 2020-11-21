const request = require('supertest');
const app = require('../src/app');
const assert = require('assert');
require('dotenv').config();

// Test Variables
let token = "";
let dbTestEvent = {};
let dbTestPerson = {};
let user = {
  username: process.env.TEST_USERNAME,
  password: process.env.TEST_PASSWORD,
  role:"Admin"
}

describe('POST /login', () => {
  it('login and assert token',  async() => {
    await request(app)
      .post('/login')
      .set({Accept: 'application/json'})
      .send(user)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        token = res.body.accessToken;
        assert(res.body, typeof Object);
      });
  });
});

//db events
describe('POST /easyway/add', () => {
  it('add object into db events', (done) => {
    request(app)
      .post('/easyway/add')
      .set({
        'collection': 'events',
        Accept: 'application/json',
        'Authorization': "Bearer " + token,
      })
      .send({event: {
          name: 'Testing',
          place: 'Langendorf',
          participant: [],
          eventDate: new Date(),
        },
        created_at: new Date()
      })
      .expect(201, done);
  });
});

describe('GET /easyway/collection', () => {
  it('get collection events of mongodb an check if before created event exists', async() => {
    await request(app)
      .get('/easyway/collection')
      .set({'Authorization': "Bearer " + token, 'collection': 'events', Accept: 'application/json' })
      .expect(200)
      .then(response => {
        assert(response.body, typeof Array);
        dbTestEvent = response.body.find(item => item.event.name === "Testing");
        assert(dbTestEvent === typeof Object,"Check if before created saved object is in db(Array filtered out by name) ");
      }).catch(err => {
        console.log(err.message);
      });
  });
});

describe('PUT /easyway/change', () => {
  it('change event name', (done) => {
    request(app)
      .put('/easyway/change/'+ dbTestEvent._id)
      .set({
        'collection': 'events',
        'object':'event',
        Accept: 'application/json',
        'Authorization': "Bearer " + token,
      })
      .send({event: {
          name: 'TestingChanged'
        }
      })
      .expect(200, done);
  });
});

describe('GET /easyway/collection', () => {
  it('get collection events of mongodb an check if before changed events is properly saved', async () => {
    await request(app)
      .get('/easyway/collection')
      .set({'Authorization': "Bearer " + token, 'collection': 'events', Accept: 'application/json' })
      .expect(200)
      .then(response => {
        assert(response.body, typeof Array);
        assert(dbTestEvent.name === response.body.find(item => item.event.name === "TestingChanged").name,"Check if before changed object is in db(Array filtered out by name) ");
        dbTestEvent = response.body.find(item => item.event.name === "TestingChanged");
      }).catch(err => {
        console.log(err.message);
      });
  });
});

//db persons
 describe('POST /easyway/collection', () => {
    it('add person into db persons and link before created event', (done) => {
      request(app)
        .post('/easyway/add')
        .set({
          'collection': 'persons',
          Accept: 'application/json',
          'Authorization': "Bearer " + token,
        })
        .send({
          person: {
            name: 'Andreas',
            phone: '0798868844',
            email: 'andreas.vogt@shokodev.ch',
            address: 'Wangenstrasse 12',
            city: 'Herzogenbuchsee',
            postcode: 3360,
            age: 31,
            gender: 'M',
            event: [dbTestEvent._id]
          },
          created_at: new Date()
        })
        .expect(201, done);
    });
  });

describe('GET /easyway/collection', () => {
  it('get collection persons of mongodb an check if before created person exists', async () => {
    await request(app)
      .get('/easyway/collection')
      .set({'Authorization': "Bearer " + token, 'collection': 'persons', Accept: 'application/json' })
      .expect(200)
      .then(response => {
      assert(response.body, typeof Array);
      dbTestPerson = response.body.find(item => item.person.name === "Andreas");
      assert(dbTestPerson === typeof Object,"Check if before created saved object is in db(Array filtered out by name) ");
    }).catch(err => {
      console.log(err.message);
    });
  });
});

describe('DELETE /easyway/delete', () => {
  it('delete test event', (done) => {
    request(app)
      .delete('/easyway/delete/'+ dbTestEvent._id)
      .set({'Authorization': "Bearer " + token, 'collection': 'events', Accept: 'application/json' })
      .expect(200,done);
  });
});

describe('DELETE /easyway/delete', () => {
  it('delete test person', (done) => {
    request(app)
      .delete('/easyway/delete/'+ dbTestPerson._id)
      .set({'Authorization': "Bearer " + token, 'collection': 'persons', Accept: 'application/json' })
      .expect(200,done);
  });
});


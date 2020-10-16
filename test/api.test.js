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
  it('login and assert token',  async (done) => {
    request(app)
      .post('/login')
      .set({Accept: 'application/json'})
      .send(user)
      .expect('Content-Type', /json/)
      .expect(200).then(response => {
        token = response.body.accessToken;
        assert(response.body, typeof Object);
      });
      done();
  });
});


describe('GET /easyway/collectionNames', () => {
  it('responds collection names of mongodb', (done) => {
    request(app)
      .get('/easyway/collectionNames')
      .set({'Authorization': "Bearer " + token, Accept: 'application/json' })
      .expect(200, ["events","persons"],done)
  });
});

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
      .expect(201, done)
  });
});

describe('GET /easyway/collection', () => {
  it('check if before created object exists in db', (done) => {
    request(app)
      .get('/easyway/collection')
      .set({
        'collection': 'events',
        Accept: 'application/json',
        'Authorization': "Bearer " + token,
      })
      .expect(200)
      .then(response => {
        assert(response === typeof Array,"Check if response is an array");
        dbTestEvent = response.body.find(item => item.event.name === "Testing");
        assert(dbTestEvent === typeof Object,"Check if before created saved object is in db(Array filtered out by name) ");
      })
      done()
  });
});

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
        .expect(201, done)
    });
  });

describe('GET /easyway/collection', () => {
  it('responds collection  persons of mongodb', (done) => {
    request(app)
      .get('/easyway/collection')
      .set({'Authorization': "Bearer " + token, 'collection': 'persons', Accept: 'application/json' })
      .expect(200).then(response => {
      assert(response.body, typeof Array);
      dbTestPerson = response.body.find(item => item.person.name === "Andreas");
      assert(dbTestPerson === typeof Object,"Check if before created saved object is in db(Array filtered out by name) ");
    })
    done()
  });
});

describe('DELETE /easyway/delete', () => {
  it('delete test event', (done) => {
    request(app)
      .delete('/easyway/delete')
      .set({'Authorization': "Bearer " + token, 'collection': 'events', Accept: 'application/json' })
      .query({'id': dbTestEvent._id})
      .expect(200,done);
  });
});

describe('DELETE /easyway/delete', () => {
  it('delete test event', (done) => {
    request(app)
      .delete('/easyway/delete')
      .set({'Authorization': "Bearer " + token, 'collection': 'persons', Accept: 'application/json' })
      .query({'id': dbTestPerson._id})
      .expect(200,done);
  });
});

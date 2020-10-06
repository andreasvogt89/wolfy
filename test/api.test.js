const request = require('supertest');
const app = require('../src/app');
const assert = require('assert');
require('dotenv').config();
let token = "";


describe('POST /login', () => {
  let user = {
    username: process.env.TESTUSERNAME,
    password: process.env.TESTPASSWORD,
    role:"Admin"
  }
  it('login and assert token', (done) => {
    request(app)
      .post('/login')
      .set({Accept: 'application/json'})
      .send(user)
      .expect('Content-Type', /json/)
      .expect(200).then(response => {
        token = response.body.accessToken
        assert(response.body, typeof Object)})
      .finally(done)
  });
});

describe('GET /easyway/collectionNames', () => {
  it('responds collection names of mongodb', (done) => {
    request(app)
      .get('/easyway/collectionNames')
      .set({'Authorization': "Bearer " + token, Accept: 'application/json' })
      .expect('Content-Type', /json/)
      .expect(200, ["events","persons"],done)
  });
});

describe('GET /easyway/collection', () => {
  it('responds collection  persons of mongodb', (done) => {
    request(app)
      .get('/easyway/collection')
      .set({'Authorization': "Bearer " + token, 'collection': 'persons', Accept: 'application/json' })
      .expect('Content-Type', /json/)
      .expect(200).then(response => {
        assert(response.body, typeof Array)
        })
      done()
  });
});

describe('GET /easyway/collection', () => {
  it('responds collection events of mongodb', (done) => {
    request(app)
      .get('/easyway/collection')
      .set({
        'collection': 'events',
        Accept: 'application/json',
        'Authorization': "Bearer " + token,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        assert(response.body, typeof Array)
      })
      done()
  });
});

  describe('POST /easyway/collection', () => {
    it('add object into db persons', (done) => {
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
            event: 'cheffe'
          },
          created_at: new Date()
        })
        .expect(201, done)
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
        .send({
          event: {
            name: 'Hausis Party',
            address: 'Wangenstrasse 12',
            city: 'Herzogenbuchsee',
            postcode: 3360,
            participant: ["487534714542","378265285","43857953"],
            eventDate: new Date(),
            comments: "Party für  Ü60",
          },
          created_at: new Date()
        })
        .expect(201, done)
    });
  });



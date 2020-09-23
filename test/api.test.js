const request = require('supertest');
const app = require('../src/app');
const assert = require('assert');

describe('GET /easyway/collectionNames', () => {
  it('responds collection names of mongodb', (done) => {
    request(app)
      .get('/easyway/collectionNames')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, ["events","persons"],done)
  });
});

describe('GET /easyway/collection', () => {
  it('responds collection  persons of mongodb', (done) => {
    request(app)
      .get('/easyway/collection')
      .set({ 'collection': 'persons', Accept: 'application/json' })
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
        Accept: 'application/json'
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
          Accept: 'application/json'
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
          Accept: 'application/json'
        })
        .send({
          event: {
            name: 'Hausis Party',
            address: 'Wangenstrasse 12',
            city: 'Herzogenbuchsee',
            postcode: 3360,
            participantS: ["487534714542"],
            comments: "Party für  Ü60",
          },
          created_at: new Date()
        })
        .expect(201, done)
    });
  });



const request = require('supertest');

const app = require('../src/app');

describe('POST /easyway/add', () => {
  it('add object into db', (done) => {
    request(app)
      .post('easyway/add')
      .set({ 'collectionName': 'persons', Accept: 'application/json' })
      .send({person:{
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
      .expect('Content-Type', /json/)
      .expect(201, {
        id: 'some fixed id',
        name: 'john'
      }, done);
  });
});

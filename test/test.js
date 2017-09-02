process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Book = require('../models/user');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index.js');
let should = chai.should();
let request = require('request');

describe('/GET create user', () => {
    it('It should create a new user', (done) => {
        request('http://localhost:8080/_api/user/create/test/123' , function(error, response, body) {
            console.log(response.body);
        });
    });
});
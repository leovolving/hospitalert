const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {Hospitalization} = require('../models/hospitalization');
const {Question} = require('../models/question');
const {app, runServer, closeServer}  = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const should = chai.should();
app.use(chaiHttp);

//seed hospitalization data
function seedHData() {
	console.info('seeding hospitalizations');
	let seedData = [];
	for (let i=0; i<6; i++) {
		seedData.push(generateHospitalizationData());
	}
	return Hospitalization.insertMany(seedData);
}

//seed question data
function seedQData() {
	console.info('seeding questions');
	let seedData = [];
	for (let i=0; i<6; i++) {
		seedData.push(generateQuestionData());
	}
	return Question.insertMany(seedData);
}

//template for question seed
function generateQuestionData() {
	return {
		userId: faker.random.alphaNumeric(),
		question: faker.lorem.words(),
		answer: faker.lorem.words()
	};
}

//template for hospitalization seed
function generateHospitalizationData() {
	return {
		patient: faker.name.firstName(),
		condition: faker.lorem.word(),
		conscious: faker.random.boolean(),
		latestUpdate: faker.lorem.words()
	};
}

function tearDownDb() {
	console.warn('tearing down database');
	return mongoose.connection.dropDatabase();
}

describe('Hospitalization API endpoints', function() {


	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedHData() && seedQData();
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer();
	});

	describe('Hospitalization endpoints', function() {

		it('should return all hospitalizations: GET', function() {
			let res;
			return chai.request(app)
			.get('/hospitalizations')
			.then(function(_res) {
				res = _res;
				res.should.have.status(200);
				return Hospitalization.count()
			})
			.then(function(count) {
				res.body.hospitalizations.should.have.length.of(count);
			});
		});

		it('should update hospitalization: PUT', function() {
			const toUpdate = generateHospitalizationData();
			return Hospitalization.findOne()
			.then(function(hospitalization) {
				toUpdate.id = hospitalization.id;
				return chai.request(app)
				.put(`/hospitalizations/${hospitalization.id}`).send(toUpdate)
			})
			.then(function(res) {
				res.should.have.status(204);
				return Hospitalization.findById(toUpdate.id)
			})
			.then(function(res) {
				res.id.should.equal(toUpdate.id);
				res.patient.should.equal(toUpdate.patient);
				res.condition.should.equal(toUpdate.condition);
				res.conscious.should.equal(toUpdate.conscious);
				res.latestUpdate.should.equal(toUpdate.latestUpdate);
			});
		});

		it('should add new hospitalization: POST', function() {
			let hId;
			const newItem = generateHospitalizationData();
			return chai.request(app)
			.post('/hospitalizations').send(newItem)
			.then(function(res) {
				res.should.have.status(201);
				hId = res.body.id;
				return Hospitalization.findById(hId)
				.then(function(res) {
					res.id.should.equal(hId);
					res.patient.should.equal(newItem.patient);
					res.condition.should.equal(newItem.condition);
					res.conscious.should.equal(newItem.conscious);
					res.latestUpdate.should.equal(newItem.latestUpdate);
				});
			});
		});

	});

	describe('Question endpoints', function() {

		it('should get all the questions: GET', function() {
			let res;
			return chai.request(app)
			.get('/questions')
			.then(function(_res) {
				res = _res;
				res.should.have.status(200);
				return Question.count()
			})
			.then(function(count) {
				res.body.questions.should.have.length.of(count);
			});
		});

	});

});
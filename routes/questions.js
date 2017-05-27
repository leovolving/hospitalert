const express = require('express');
const router = express.Router();
 
const {Question} = require('../models/question');
const {Hospitalization} = require('../models/hospitalization');


router.get('/', (req, res) => {
	Question.find().exec()
	.then(questions => {
		res.json({
			questions: questions.map((question =>
				question.apiRepr()))
		});
	})
	.catch(err => {
		console.error(err);
		res.status(500).send('internal server error');
	});
});

module.exports = router;
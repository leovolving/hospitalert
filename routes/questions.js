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

router.put('/:id', (req, res) => {
	if (req.params.id.trim() !== req.body.id.trim()) {
		const message = 'IDs in req.params and req.body';
		return res.status(400).send(message);
	}
	const changes = {};
	const updatableFields = ['question', 'answer'];
	updatableFields.forEach(field => {
		if (field in req.body) {
			changes[field] = req.body[field];
		}
	});
	return Question.findByIdAndUpdate(req.params.id, {$set: changes}).exec()
	.then(question => {
		res.status(204).end();
	})
	.catch(err => {
		console.error(err);
	});
});

module.exports = router;
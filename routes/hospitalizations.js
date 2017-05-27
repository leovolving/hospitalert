const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Question} = require('../models/question');
const {Hospitalization} = require('../models/hospitalization');

router.get('/', (req, res) => {
	Hospitalization.find().exec()
	.then(hospitalizations => {
		res.json({
			hospitalizations: hospitalizations.map((hospitalization =>
				hospitalization.apiRepr()))
		});
	})
	.catch(err => {
		console.error(err);
		res.status(500).send('internal server error');
	});
});

router.get('/:id', (req, res) => {
	Hospitalization.findById(req.params.id).exec()
	.then(hospitalization => {
		res.json(hospitalization.apiRepr());
	})
	.catch(err => {
		console.error(err);
		res.status(500).send('nooooooo')});
});

router.put('/:id', jsonParser, (req, res) => {
	console.log(req.body.id);
	console.log(req.params.id);
	if (req.params.id.trim() !== req.body.id.trim()) {
		const message = 'ID in req.params and req.body must match';
		console.error(message);
		return res.status(400).send(message);
	}
	const toUpdate = {}
	const updatableFields = ['patient', 'condition', 'conscious', 'latestUpdate'];
	updatableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});
	Hospitalization.findByIdAndUpdate(req.params.id, {$set: toUpdate})
	.exec()
	.then(hospitalization => res.status(204).json(toUpdate))
	.catch(err => {
		console.error(err);
		res.status(500).send('internal server error')
	})
});

module.exports = router;
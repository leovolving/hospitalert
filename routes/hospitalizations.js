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
	});
});

router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['patient', 'conscious'];
	requiredFields.forEach(field => {
		if(!(field in req.body)) {
			const message = `Missing ${field} in req.body`;
			console.log(message);
			return res.status(400).send(message);
		}
	});
	Hospitalization.create({
		patient: req.body.patient,
		condition: req.body.condition,
		conscious: req.body.conscious,
		latestUpdate: req.body.latestUpdate
	})
	.then(hospitalization => {
		res.status(201).json(hospitalization.apiRepr());
	})
	.catch(err => {
		res.status(500).send('internal server error');
	})
})

//using this to delete test items in my local environment via Postman
//deleting is not a client-side feature as of right now
router.delete('/:id', (req, res) => {
	Hospitalization.findByIdAndRemove(req.params.id)
	.then(hosp => {
		res.status(201).send('done');
	})
	.catch(err => {
		console.error(err);
		res.status(500).send('oops');
	});
});

module.exports = router;
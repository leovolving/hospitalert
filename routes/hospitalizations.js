const express = require('express');
const router = express.Router();

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

module.exports = router;
const mongoose = require('mongoose');
const {Hospitalization} = require('./hospitalization');
// var Schema = mongoose.Schema();
// const ObjectId = Schema.ObjectId;

const questionSchema = mongoose.Schema({
	_hospitalization: {
		// type: mongoose.Schema.Types.ObjectId,
		// ref: 'Hospitalization'
		type: String
	},
	userId: {
		type: String
	},
	question: {
		type: String,
		required: true
	},
	answer: {
		type: String
	}
});

questionSchema.methods.apiRepr = function() {
	return {
		id: this._id,
		_hospitalization: this._hospitalization,
		userId: this.userId,
		question: this.question,
		answer: this.answer
	};
};

const Question = mongoose.model('Question', questionSchema);

module.exports = {Question};
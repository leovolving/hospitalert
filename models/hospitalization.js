const mongoose = require('mongoose');

const hospitalizationSchema = mongoose.Schema({
	patient: {
		type: String,
		required: true
	},
	condition: {
		type: String
	},
	conscious: {
		type: Boolean,
		required: true
	},
	latestUpdate: {
		type: String
	}
});

hospitalizationSchema.methods.apiRepr = function() {
	return {
		id: this._id,
		patient: this.patient,
		condition: this.condition,
		conscious: this.conscious,
		latestUpdate: this.latestUpdate
	};
};

const Hospitalization = mongoose.model('Hospitalization', hospitalizationSchema);

module.exports = {Hospitalization};
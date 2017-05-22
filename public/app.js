//mock data
var mock_hospitalizations = {
	"hospitalizations": [
	{
		"id": 1,
		"patient": "Grandpa Joe",
		"condition": "heart attack",
		"conscious": true,
		"latestUpdate": "Waiting to meet with doctor for results of EKG"
	},
	{
		"id": 2,
		"patient": "Mom",
		"condition": "car accident",
		"conscious": true,
		"latestUpdate": "X-Ray confrimed broken leg. Waiting for cast. Should be released soon."
	},
	{
		"id": 3,
		"patient": "Ricky",
		"condition": "seizure",
		"conscious": true,
		"latestUpdate": "Ricky was just taken to another room for an MRI"
	},
	{
		"id": 4,
		"patient": "Sally",
		"condition": "hip surgery",
		"conscious": false,
		"latestUpdate": "Doctor says surgery was a success and that Sally should be waking up any minute now"
	}
	]
};

var mock_questions = {
	"questions": [
	{
		"id": "1",
		"userId": "1",
		"hospitalizationId": 1,
		"question": "Did they get a list of his current meds?"
	},
	{
		"id": "2",
		"userId": "1",
		"hospitalizationId": 2,
		"question": "How long is the expected recovery time?"
	},
	{
		"id": "3",
		"userId": "2",
		"hospitalizationId": 3,
		"question": "What do they believe caused the seizure?"
	},
	{
		"id": "4",
		"userId": "2",
		"hospitalizationId": 4,
		"question": "How long will Sally be in physical therapy?"
	}
	]
};

function displayHospitalizations() {
	$('.js-hospitalizations').remove();
	var hospitalizationHtml = '';
	mock_hospitalizations.hospitalizations.forEach(function(item) {
		hospitalizationHtml += `<tr class="js-hospitalizations">
			<td>${item.patient}</td>
			<td>${item.condition}</td>
			<td>${item.conscious}</td>
			<td>${item.latestUpdate}</td>
			<td><button type="button">Edit <span class="visuallyhidden">status of ${item.patient}</span></button></td>
			</tr>`;
	});
	$('.js-hospitalizations-table').append(hospitalizationHtml);
}


function displayQuestions() {
	var questionsHtml = "";
	mock_questions.questions.forEach(function(item) {
		function findPatient(h) {
			return h.id === item.hospitalizationId;
		}
		currentPatient = mock_hospitalizations.hospitalizations.find(findPatient).patient;
		questionsHtml += `<tr class="js-questions">
			<td>${currentPatient}</td>
			<td>${item.userId}</td>
			<td>${item.question} <button type="button">Answer</button></td>
			</tr>`;
	});
	$('.js-questions-table').append(questionsHtml);
}

function createHospitalization() {
	$('form').submit(function(e) {
		e.preventDefault();
		var newEntry = {
			"id": mock_hospitalizations.hospitalizations.length + 1,
			"patient": $('input[name="patient"]').val(),
			"condition": $('input[name="condition"]').val()
		};
		if ($('input[name="conscious"]:checked').val() === 'yes') {
			newEntry.conscious = true;
		}
		else {
			newEntry.conscious = false;
		}
		mock_hospitalizations.hospitalizations.push(newEntry);
		displayHospitalizations();
	});
}

$(function() {
	displayHospitalizations();
	displayQuestions();
	createHospitalization();
});
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
		"question": "Did they get a list of his current meds?",
     "answer": ""
	},
	{
		"id": "2",
		"userId": "1",
		"hospitalizationId": 2,
		"question": "How long is the expected recovery time?",
    "answer": ""
	},
	{
		"id": "3",
		"userId": "2",
		"hospitalizationId": 3,
		"question": "What do they believe caused the seizure?",
    "answer": ""
	},
	{
		"id": "4",
		"userId": "2",
		"hospitalizationId": 4,
		"question": "How long will Sally be in physical therapy?",
    "answer": ""
	}
	]
};

function displayHospitalizations() {
	$('.js-hospitalizations').remove();
	var hospitalizationHtml = '';
	mock_hospitalizations.hospitalizations.forEach(function(item) {
		hospitalizationHtml += `<tr class="js-hospitalizations">
      <td class="id">${item.id}</td>
			<td>${item.patient}</td>
			<td>${item.condition}</td>
			<td>${item.conscious}</td>
			<td class="status">${item.latestUpdate}</td>
			<td><button class="edit" type="button">Edit <span class="visuallyhidden">status of ${item.patient}</span></button></td>
			</tr>`;
	});
	$('.js-hospitalizations-table').append(hospitalizationHtml);
}


function displayQuestions() {
	$('.js-questions').remove();
	var questionsHtml = "";
	mock_questions.questions.forEach(function(item) {
		function findPatient(h) {
			return h.id === item.hospitalizationId;
		}
		currentPatient = mock_hospitalizations.hospitalizations.find(findPatient).patient;
		questionsHtml += `<tr class="js-questions">
			<td class="id">${item.id}</td>
			<td>${currentPatient}</td>
			<td>${item.userId}</td>
			<td>${item.question} <button class="answer-button" type="button">Answer</button></td>
      <td class="answer">${item.answer}</td>
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

var editTemplate = '<td><input type="text" name="edit"><button type="submit" class="change-status">Submit</button></td>';

function editStatus() {
  $('.js-hospitalizations').on('click', '.edit', function(e) {
    e.preventDefault();
    var parent = $(this).parent();
    parent.empty();
    parent.html(editTemplate);
    changeStatus();
  });
}

function changeStatus() {
  $('.change-status').on('click', function(e) {
    e.preventDefault();
    var newStatus = $(this).siblings('input').val();
    var referenceId = $(this).parents().siblings('.id').text();
    function getID(h) {
      return h.id == referenceId;
    }
    var hToBeChanged = mock_hospitalizations.hospitalizations.find(getID);
    hToBeChanged.latestUpdate = newStatus;
    displayHospitalizations();
  });
}

function answerClick() {
  $('.js-questions').on('click', '.answer-button', function(e) {
    e.preventDefault();
    var parent = $(this).parent().siblings('.answer');
    // debugger;
    parent.empty();
    parent.html(editTemplate);
    answerQuestion();
  });
}

function answerQuestion() {
  $('.change-status').on('click', function(e) {
    e.preventDefault();
    var newAnswer = $(this).siblings('input').val();
    var referenceId = $(this).parents().siblings('.id').text();
    function getID(q) {
      return q.id == referenceId;
    }
    var qToBeChanged = mock_questions.questions.find(getID);
    qToBeChanged.answer = newAnswer;
    displayQuestions();
  });
}

$(function() {
	displayHospitalizations();
	displayQuestions();
	createHospitalization();
  	editStatus();
  	answerClick();
});
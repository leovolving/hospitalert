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

//GET questions
function getQuestions(callback) {
	var query = {
		url: '/questions',
		type: 'GET',
		success: callback
	};
	$.ajax(query);
}

//GET hopitalizations
function getHospitalizations(callback) {
	var query = {
		url: '/hospitalizations',
		type: 'GET',
		success: callback
	}
	$.ajax(query)
}

//the text input for editing a status
var editInputTemplate = '<td><input type="text" name="edit"><button type="submit" class="change-status">Submit</button></td>';

//this is being done as a function, since "patient" is presented in different forms in different
//areas that the function gets called
function editButtonTemplate(patient) {
	return `<button class="edit" type="button">Edit <span class="visuallyhidden">status of ${patient}</span></button>`;
}


//this is a function, because the hospitalization object is presented in different forms
//in different areas that the function gets called
function hospitalizationTableTemplate(entry) {
		return `<tr data-id="${entry.id}">
			<td class="patient">${entry.patient}</td>
			<td>${entry.condition}</td>
			<td>${entry.conscious}</td>
			<td class="status">${entry.latestUpdate}</td>
			<td class="edit-field">${editButtonTemplate(entry.patient)}</td>
			</tr>`;
}


//initially displays the hospitalizations with the mock data
function displayHospitalizations(data) {
	$('.js-hospitalizations').empty();
	var hospitalizationHtml = '';
	data.hospitalizations.forEach(function(item) {
		hospitalizationHtml += hospitalizationTableTemplate(item);
	});
	$('.js-hospitalizations').html(hospitalizationHtml);
}


//initially displays the questions from the mock data
function displayQuestions(data) {
	$('.js-questions').empty();
	var questionsHtml = "";
	data.questions.forEach(function(item) {

		//gets the patient name that this question corresponds with
		//by getting the patient's ID data
		// function findPatient(h) {
		// 	return h.id === item.hospitalizationId;
		// }
		// currentPatient = mock_hospitalizations.hospitalizations.find(findPatient).patient;

		//template to update DOM
		questionsHtml += `<tr data-id="${item.id}">
			<td>foo</td>
			<td>${item.userId}</td>
			<td>${item.question} <br><button class="answer-button" type="button">Answer</button></td>
      		<td class="answer">${item.answer}</td>
			</tr>`;
			//change answer button to font awesome icon
			//answer can be text input
	});
	//updates DOM
	$('.js-questions').html(questionsHtml);
}

//pushes the new data to the hospitalization collection
//then adds that document to the hospitalization table
function createHospitalization() {
	$('form').submit(function(e) {
		e.preventDefault();

		//create new object to push to array
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

		//adds new object to hospitalization collection
		$.ajax({
			url: ('/hospitalizations'),
			type: 'POST',
			data: JSON.stringify(newEntry),
			success: function(data) {
				//update DOM with new item
				return $('.js-hospitalizations').append(hospitalizationTableTemplate(data));
			},
			dataType: 'json',
			contentType: 'application/json'
		});

	});
}

//changes the edit field from a button to a text input field
//when button is clicked
function editStatus() {
  $('.js-hospitalizations-table').on('click', '.edit', function(e) {
    e.preventDefault();
    var parent = $(this).parent();
    parent.html(editInputTemplate);
    changeStatus();
  });
}

//updates the status and pushes the changes to the DOM
function changeStatus() {
  $('.change-status').on('click', function(e) {
    e.preventDefault();
    //save row current row for scope
    var row = $(this);

    //gets the text inputed by user
    var newStatus = row.siblings('input').val();

    //gets the value to access the corresponding object by the ID key
    var referenceId = row.parents('tr').attr('data-id');

    //turn req.body items into data object
    var updateItems = {
    	id: referenceId,
    	latestUpdate: newStatus
    };

    //function to find the appropriate object in the array of mock data
    //using find() method on array
    // function getID(h) {
    //   return h.id == referenceId;
    // }
    // var hToBeChanged = mock_hospitalizations.hospitalizations.find(getID);

    // //makes changes to appropriate object in array
    // hToBeChanged.latestUpdate = newStatus;


    //changes the latest status on table
    row.parents().siblings('.status').html(newStatus);

    //gets the current patient for the updated "edit" button because a11y
    var currentPatient = row.parents().siblings('.patient').text();

    //updates edit field on DOM
    row.parents('.edit-field').html(editButtonTemplate(currentPatient));

    $.ajax({
    	url: `/hospitalizations/${referenceId}`,
    	type: 'PUT',
    	data: JSON.stringify(updateItems),
    	dataType: 'json', 
    	contentType: 'application/json'});

  });
}

//adds text input so user can answer question
function answerClick() {
  $('.js-questions-table').on('click', '.answer-button', function(e) {
    e.preventDefault();
    var parent = $(this).parent().siblings('.answer');
    parent.empty();
    parent.html(editInputTemplate);
    answerQuestion();
  });
}

//updates the answer field with the user input
function answerQuestion() {
  $('.change-status').on('click', function(e) {
    e.preventDefault();

    //gets user's text input
    var newAnswer = $(this).siblings('input').val();

    //gets ID for find() function
    var referenceId = $(this).parents('tr').attr('data-id');

    //used in find() method to get appropriate object from
    //array of mock data
    // function getID(q) {
    //   return q.id == referenceId;
    // }
    // var qToBeChanged = mock_questions.questions.find(getID);

    //updates object in mock data
    var qToBeChanged = {
    	id: referenceId,
    	answer: newAnswer
    };

	    //adds new data to DOM
	$(this).parents('.answer').text(newAnswer); 

    $.ajax({
    	url: `/questions/${referenceId}`,
    	type: 'PUT',
    	data: JSON.stringify(qToBeChanged),
    	dataType: 'json',
    	contentType: 'application/json'
    });
  });
}

$(function() {
	getHospitalizations(displayHospitalizations);
	getQuestions(displayQuestions);
	createHospitalization();
  	editStatus();
  	answerClick();
});
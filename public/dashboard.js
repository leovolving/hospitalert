//new stuff per Derek and E.J.'s suggestions
function displayNewTest(data) {
	var hDisplay = '';
	data.hospitalizations.forEach(function(item) {
		if (item.conscious === true) {
			var conscious = 'yes';
		}
		else {
			var conscious = 'no';
		}
		hDisplay += (
			`<div class="js-accordion__panel" data-id="${item.id}">
				<h2 class="js-accordion__header">${item.patient}</h2>
				<h3>Status</h3>
				<p>${item.latestUpdate}</p>
				<h3>Condition</h3>
				<p>${item.condition}</p>
				<h3>Conscious?</h3>
				<p>${conscious}</p>
				<h3 class="questions">Questions</h3>
				<ol class="question-list js-${item.id}"></ol>
			</div>`);
	getQuestionsByHId(item.id, actuallyDisplayQuestions);
	});
	$('.h-container').html(hDisplay);
	$('.js-accordion').accordion();
}

//function broken into two parts because reasons
function actuallyDisplayQuestions(item) {
	//template to update DOM
	var questionsHtml = '';
	if (item.questions[0] !== undefined) {
		item.questions.forEach(function(q) {
			questionsHtml += `
				<li data-id="${q.id}">${q.question}</li>
					<ul>
						<li>Asked by ${q.userId}</li>
						<li>Answer: ${q.answer}</li>
					</ul>`;
			});
			//change answer button to font awesome icon
			//answer can be text input
		//updates DOM
		var HId = item.questions[0]._hospitalization;
		$(`.js-${HId}`).html(questionsHtml);
	}
}

function getHByIdNew(id) {
	var patient;
	$.ajax({
		url: `/hospitalizations/${id}`,
		type: 'GET',
		success: callback
	});
}

//GET questions
function getQuestionsByHId(HId, callback) {
	var query = {
		url: `/questions/${HId}`,
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
	};
	$.ajax(query);
}

function getHById(item) {
	var patient;
	$.ajax({
		url: `/hospitalizations/${item.hospitalizationId}`,
		type: 'GET',
		success: function(data) {
			patient = data.patient;
			actuallyDisplayQuestions(item, patient);
		}
	});
}

//the text input for editing a status
var editInputTemplate = '<td><input type="text" name="edit"><button type="submit" class="change-status">Submit</button></td>';

//this is being done as a function, since "patient" is presented in different forms in different
//areas that the function gets called
function createEditButton(patient) {
	return `<button class="edit" type="button">Edit <span class="visuallyhidden">status of ${patient}</span></button>`;
}


//this is a function, because the hospitalization object is presented in different forms
//in different areas that the function gets called
function hospitalizationTableTemplate(entry) {
	if (entry.conscious === true) {
		var conscious = 'yes';
	}
	else {
		var conscious = 'no';
	}	
	return `<tr data-id="${entry.id}">
		<td class="patient">${entry.patient}</td>
		<td>${entry.condition}</td>
		<td>${conscious}</td>
		<td class="status">${entry.latestUpdate}</td>
		<td class="edit-field">${createEditButton(entry.patient)}</td>
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


//initially displays the questions from database
function displayQuestions(data) {
	$('.js-questions').empty();
	data.questions.forEach(function(item) {

		//gets the patient name that this question corresponds with
		//by getting the patient's ID data
		getHById(item);
	});
}

//pushes the new data to the hospitalization collection
//then adds that document to the hospitalization table
function listenForHospitalization() {
	$('form').submit(function(e) {
		e.preventDefault();

		//create new object to push to array
		var newEntry = {
			"patient": $('input[name="patient"]').val(),
			"condition": $('input[name="condition"]').val(),
			"latestUpdate": $('input[name="status"]').val()
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


    //changes the latest status on table
    row.parents().siblings('.status').html(newStatus);

    //gets the current patient for the updated "edit" button because a11y
    var currentPatient = row.parents().siblings('.patient').text();

    //updates edit field on DOM
    row.parents('.edit-field').html(createEditButton(currentPatient));

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

//runs all event listeners
function attachListeners() {
	listenForHospitalization();
  	editStatus();
  	answerClick();
}

$(function() {
	getHospitalizations(displayNewTest);
	attachListeners();
});
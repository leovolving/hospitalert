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
				var newPost = [data];
				return $('.js-hospitalizations').append(displayNewTest(newPost));
			},
			dataType: 'json',
			contentType: 'application/json'
		});

	});
}



$(function() {
	getHospitalizations(displayNewTest);
	listenForHospitalization();
});
//new stuff per Derek and E.J.'s suggestions
function displayHospitalizationData(data) {
	var hDisplay = '';
	var id;
	data.hospitalizations.forEach(function(item) {
		id = item.id;
		var conscious;
		if (item.conscious === true) {
			conscious = 'yes';
		}
		else {
			conscious = 'no';
		}
		hDisplay += (
			`<h3 class="js-accordion__header">${item.patient}</h3>
			<div class="js-accordion__panel" id="${id}" data-id="${item.id}">
				
				<h4>Condition</h4>
				<p class="condition">${item.condition}</p>
				<form>
					<label for="status"><h4>Status</h4></label>
					<p class="status">${item.latestUpdate}</p>
					<input type="text" for="status" id="status" placeholder="edit status"><br>				
					<label for="conscious"><h4>Conscious?</h4></label>
					<select name="conscious" title="conscious">
						<option value="" disabled selected>Update</option>
						<option value="yes">yes</option>
						<option value="no">no</option>
					</select>
					<p class="conscious">${conscious}</p>
					<h4 class="questions">Questions</h4>
					<ol class="question-list js-${item.id}"></ol>
					${createSubmitButton(item.patient)}
				</form>
				</div>`);
	getQuestionsByHId(item.id, actuallyDisplayQuestions);
	});
	if ($('.h-container').is(':empty')) {
		$('.h-container').html(hDisplay);
		$('#accordion').accordion({collapsible: true});
	}
	else {
		$('.h-container').append(hDisplay)
		$('.h-container').accordion('refresh');
	}
}

//function broken into two parts because reasons
function actuallyDisplayQuestions(item) {
	//template to update DOM
	var questionsHtml = '';
	if (item.questions[0] !== undefined) {
		item.questions.forEach(function(q) {
			questionsHtml += `
				<label for="${q.questions}">
				<li data-id="${q.id}">${q.question}</li>
				</label>
					<ul>
						<li>Asked by ${q.userId}</li>
						<li>Answer: ${q.answer}</li>
					</ul>
				<input type="text" for="${q.question}" id="${q.question}" placeholder="update answer">`;
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
function createSubmitButton(patient) {
	return `<button class="edit" type="submit">Submit all changes<span class="visuallyhidden"> for ${patient}</span></button>`;
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
				var newPost = {
					hospitalizations: [data]
				};
				return $('.js-hospitalizations').append(displayHospitalizationData(newPost));
			},
			dataType: 'json',
			contentType: 'application/json'
		});

	});
}

function whenSubmitButtonIsClicked() {
	$('.h-container').on('click', '.edit', function(e) {
		e.preventDefault();
		var referenceHospId = $(this).parents('div').attr('data-id');
		var referenceQuestId = $(this).siblings('ol').children('li').attr('data-id');
		console.log(referenceQuestId);
		
	});
}



$(function() {
	getHospitalizations(displayHospitalizationData);
	listenForHospitalization();
	whenSubmitButtonIsClicked();
});
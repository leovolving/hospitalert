//creates accordion with data from hospitalizations GET request
function displayHospitalizationData(data) {
	var hDisplay = '';
	var id;
	data.hospitalizations.forEach(function(item) {
		id = item.id;
		//turns boolean from item.conscious into yes/no string
		var conscious = checkIfConscious(item);
		hDisplay += (
			`<h3 class="js-accordion__header">${item.patient}</h3>
			<div class="js-accordion__panel content" id="${id}" data-id="${item.id}">
				<form>
					<div class="js-hospitalizations">
						<h4>Condition</h4>
						<p class="condition">${item.condition}</p>
						<label for="status"><h4>Status</h4></label>
						<p class="status">${item.latestUpdate}</p>
						<input type="text" for="status" id="status" placeholder="edit status"><br>				
						<label for="conscious"><h4>Conscious?</h4></label>
						<select name="conscious" title="conscious">
							<option value="yes" ${addSelected(item.conscious, true)}>yes</option>
							<option value="no" ${addSelected(item.conscious, false)}>no</option>
						</select>
						<p class="conscious" aria-hidden="true">${conscious}</p>
					</div>
					<div class="questions">
						<h4 class="questions">Questions</h4>
						<p class="no-questions">No questions have been posted yet</p>
						<ol class="question-list js-${item.id} visuallyhidden"></ol>
					</div>
					${createSubmitButton(item.patient)}
				</form>
				</div>`);
	//grabs the questions related to each hospitalization and adds it to the accordion
	getQuestionsByHId(item.id, actuallyDisplayQuestions);
	});
	//adds accordion on initial page load
	if ($('.h-container').is(':empty')) {
		$('.h-container').html(hDisplay);
		$('#accordion').accordion({collapsible: true, active: 'none', heightStyle: 'content'});
	}
	//refreshes accordion if page if one is already there
	else {
		$('.h-container').append(hDisplay);
		$('.h-container').accordion('refresh');
	}
}

function addSelected(c, bool) {
	//this adds the "selected" attribute to the correct option
	//under conscious
	var selected = 'selected';
	if (c === bool) {
		return selected;
	}
}

function checkIfConscious(item) {
	var conscious;
	if (item.conscious) {
		conscious = 'yes';
	} else {
		conscious = 'no';
	}
	return conscious;
}

//HTML template once GET request has been made to questions
function actuallyDisplayQuestions(item) {
	//template to update DOM
	var questionsHtml = '';
	if (item.questions[0] !== undefined) {
		item.questions.forEach(function(q) {
			questionsHtml += `
				<label for="question" data-id="${q.id}">
				<li data-id="${q.id}">${q.question}</li>
				</label>
					<ul>
						<li>Asked by ${q.userId}</li>
						<li class="js-${q.id}">Answer: <span id="answer">${q.answer}</span></li>
					</ul>
				<input type="text" for="question" id="question" placeholder="update answer">`;
			});
		//updates DOM
		var HId = item.questions[0]._hospitalization;
		$(`.js-${HId}`).siblings('.no-questions').addClass('visuallyhidden');
		$(`.js-${HId}`).html(questionsHtml);
		$(`.js-${HId}`).removeClass('visuallyhidden');
	}
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

//this is being done as a function, since "patient" is presented in different forms in different
//areas that the function gets called
function createSubmitButton(patient) {
	return `<button class="edit mdl-button mdl-js-button mdl-button--raised" type="submit">Submit all changes<span class="visuallyhidden"> for ${patient}</span></button>`;
}

//pushes the new data to the hospitalization collection
//then adds that document to the hospitalization accordion
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
		} else {
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

//makes objects for PUT requests
function whenSubmitButtonIsClicked() {
	$('.h-container').on('click', '.edit', function(e) {
		e.preventDefault();
		var conscious;
		var consciousField;
		var form = $(this).parents('form');
		var objectForHospitalizations = {
			id: form.parents('div').attr('data-id'),
			latestUpdate: form.children('.js-hospitalizations').find('input#status').val(),
			conscious: undefined
		};
		consciousField = form.children('.js-hospitalizations').find('select[name=conscious]').val();
		conscious = form.children('.js-hospitalizations').find('.conscious').text();
		//only adds conscious to object if user changed answer
		if (consciousField !== conscious) {
			consciousField = (consciousField === 'yes') ? true : false;
			objectForHospitalizations.conscious = consciousField;
		}
		var objectForQuestions = {
			id: $(this).siblings('.questions').children('ol').children('label').attr('data-id'),
			answer: form.children('.questions').children('ol').find('input[for=question]').val()
		};
		updateHospitalization(objectForHospitalizations);
		updateQuestion(objectForQuestions);
		
	});
}

//PUT request for Questions
function updateQuestion(object) {
	var toUpdate = {};
	for (var item in object) {
		if (object[item] !== undefined && object[item] !== '') {
			toUpdate[item] = object[item];
		}
	}
	if (Object.keys(toUpdate).length > 1) {
		//updates DOM with new answer prior
		$(`.js-${object.id}`).find('#answer').text(object.answer);

		$('#question').val('');
		$.ajax({
			url: `questions/${toUpdate.id}`,
			method: 'PUT',
			data: JSON.stringify(toUpdate),
    		dataType: 'json', 
    		contentType: 'application/json'
		});
	}
}

function updateHospitalization(object) {
	var toUpdate = {};
	for (var item in object) {
		if (object[item] !== undefined && object[item] !== '') {
			toUpdate[item] = object[item];
		}
	}
	if (Object.keys(toUpdate).length > 1) {
		//updates DOM with new data
		hUpdateDom(toUpdate);

		$.ajax({
			url: `hospitalizations/${toUpdate.id}`,
			method: 'PUT',
			data: JSON.stringify(toUpdate),
    		dataType: 'json', 
    		contentType: 'application/json'
		});
	}
}

//only run if a PUT request is being made
function hUpdateDom(object) {
	var target = $(`#${object.id}`).children('form');
	if (object.latestUpdate) {
		target.children('.status').text(object.latestUpdate);
		target.children('input').val('');
	}
	if ('conscious' in object) {
		var conscious = checkIfConscious(object);
		target.children('.conscious').text(conscious);
	}
}



$(function() {
	getHospitalizations(displayHospitalizationData);
	listenForHospitalization();
	whenSubmitButtonIsClicked();
});
//	object with user's votes (global variable)
var votes = {};

var parties = ["Liberal", "Conservative", "New Democratic", "Green"];

parties.forEach(function (party) {
	votes[party] = [];
});

//	jQuery function
$(function () {
	
	// -------------------
	//	*** FILTERING ***
	// -------------------
	
	var activeParties;
	var activePolicies = $('#select-policies').val();

	//	fill array of active parties
	getActivePartyList();
	
	//	initialize multiselect element
	$('#select-policies').multiselect({
		
		includeSelectAllOption: true,
		
		numberDisplayed: 0,
		
		//	on change event
		onChange: function (option) {
			var policy = $(option).val();

			//	refresh list of active policies
			var activePoliciesLenghtPrev = activePolicies.length;
			activePolicies = $('#select-policies').val();
			var activePoliciesLenghtNew = activePolicies.length;

			//	toggle the hidden class for policy row header
			$('.compare-table__row-header[data-policy="' + policy + '"]').toggleClass('hidden');

			//	toggle the hidden class for policy cell of currently filtered parties
			for (var i = 0; i < activeParties.length; i++) {
				$('.compare-table__cell[data-party="' + activeParties[i] + '"][data-policy="' + policy + '"]').toggleClass('hidden');
				if (activePoliciesLenghtPrev === 0 || activePoliciesLenghtNew === 0) {
					$('.compare-table__col-header[data-party="' + activeParties[i] + '"]').toggleClass('hidden');
				}
			}
		},
		
		//	on selectAll event
		onSelectAll: function () {
			
			//	remove the hidden class for policy row header
			$('.compare-table__row-header').removeClass('hidden');

			//	remove the hidden class for policy cell of currently filtered parties
			for (var i = 0; i < activeParties.length; i++) {
				$('.compare-table__cell[data-party="' + activeParties[i] + '"]').removeClass('hidden');
				$('.compare-table__col-header[data-party="' + activeParties[i] + '"]').removeClass('hidden');
			}

			//	refresh list of active policies
			activePolicies = $('#select-policies').val();
		},

		//	on deselectAll event
		onDeselectAll: function () {
			//	add the hidden class for policy row header
			$('.compare-table__row-header').addClass('hidden');

			//	add the hidden class for policy cell of currently filtered parties
			for (var i = 0; i < activeParties.length; i++) {
				$('.compare-table__cell[data-party="' + activeParties[i] + '"]').addClass('hidden');
				$('.compare-table__col-header[data-party="' + activeParties[i] + '"]').addClass('hidden');
			}

			//	refresh list of active policies
			activePolicies = $('#select-policies').val();
		}
	});
	
	$('.filters__toggle').click(function () {
		var $this = $(this);
		var party = $this.data('party');

		//	toggle active class for party filter element and refresh array with active parties
		$this.toggleClass('active');
		getActivePartyList();

		//	toggle hidden class for party's column header and all party's policies that are currently filtered
		$('.compare-table__col-header[data-party="' + party + '"]').toggleClass('hidden');
		for (var i = 0; i < activePolicies.length; i++) {
			$('.compare-table__cell[data-party="' + party + '"][data-policy="' + activePolicies[i] + '"]').toggleClass('hidden');
		}

		//	calculate how many columns should be displayed
		var colNum = $('.filters__toggle.active').length;
		
		//	adjust css-grid property
		var gridTemplateColumns = (colNum > 0) ? '120px repeat(' + colNum + ', 1fr)' : 'none';
		$('.policies').css('grid-template-columns', gridTemplateColumns);
	});
	
	
	function getActivePartyList() {
		//	get an array with names of currently filtered parties
		activeParties = [];
		$('.filters__toggle.active').each(function () {
			activeParties.push($(this).text())
		});
	}

	
	// -------------------
	//	*** VOTING ***
	// -------------------

	if (checkCookie('voting')) {
		
		//	read votes object from cookies if it exists
		votes = JSON.parse(readCookie('voting'));
		
		//	add active class for buttons of policies that has been voted for and change its text to 'unvote'
		for (var property in votes) {
			if (votes.hasOwnProperty(property)) {
				for (var i = 0; i < votes[property].length; i++) {
					$('.compare-table__cell[data-party="' + property + '"][data-policy="' + votes[property][i] + '"] .btn-vote').addClass('active').text('Unvote');
				}
			}
		}
	}
	
	//	trigger button 'vote' click event
	$('.btn-vote').click(function () {
		var $this = $(this);
		var voteData = $this.parent().data();

		//	toggle active class of the button
		$this.toggleClass('active');
		
		if ($this.hasClass('active')) {
			//	if user vote for the policy:
			//		change button text
			$this.text('Unvote');
			//		add element to votes object
			votes[voteData.party].push(voteData.policy);

			//		animate leaf icon
			$('.progress-icon').addClass('tada', setTimeout(function () {
				$('.progress-icon').removeClass('tada');
			}, 300));
		} else {
			//	if user unvote for the policy:
			//		change button text
			$this.text('Vote');
			//		remove element to votes object
			var index = votes[voteData.party].indexOf(voteData.policy);
			votes[voteData.party].splice(index, 1);
		}

		//	update cookie
		createCookie('voting', JSON.stringify(votes), 14);
		
		//	update list of logos in progress box
		showVotingProgress();
	});


	//	=== Helping functions to deal with cookies 
	function makeDate(days) {
		var now = new Date();
		now.setTime(now.getTime() + (days * 24 * 60 * 60 * 1000));
		return now.toUTCString();
	}

	function readCookie(name) {
		var nameEquals = name + "=";
		var cookieArray = document.cookie.split(";");

		for(var i = 0; i < cookieArray.length; i += 1){
			var cookie = cookieArray[i];
			while(cookie.charAt(0) === ' '){
				cookie = cookie.substring(1, cookie.length);
			}
			if(cookie.indexOf(nameEquals) === 0){
				return cookie.substring(nameEquals.length, cookie.length);
			}
		}
		return null;
	}

	function checkCookie(cookie) {
		return readCookie(cookie) !== null;
	}

	function createCookie(name, value, days) {
		document.cookie = name + '=' + value + '; expires=' + makeDate(days);
	}


	// -------------------
	//	*** PROGRESS ***
	// -------------------

	var partiesLogos = {
		"Liberal": 'logo-liberals.png',
		"Conservative": 'logo-conservatives.png',
		"New Democratic": 'logo-ndp.png',
		"Green": 'logo-green.png'
	};

	//	click event on the leaf icon
	$('.progress-icon').click(function () {
		var prBox = $('.progress-box');
		
		if (!prBox.hasClass('open')) {
			prBox.toggleClass('open');
			prBox.addClass('show');
		} else {
			prBox.toggleClass('open');
			prBox.removeClass('show');
		}
	});
	
	$('.btn[data-toggle="modal"]').click(function () {
		$('.progress-box').toggleClass('show');
		$('.progress-box').toggleClass('open');
	});
	
	showVotingProgress();
	
	function showVotingProgress() {
		
		//	calculated maximum amount of votes
		var maxVotes = Math.max(
			votes["Liberal"].length,
			votes["Conservative"].length,
			votes["New Democratic"].length,
			votes["Green"].length
		);

		//	populate array with image paths of logos of most favourable parties
		var maxImages = [];

		for (var key in votes) {
			if (votes[key].length === maxVotes) {
				maxImages.push(partiesLogos[key]);
			}
		}

		//	render the logos
		renderPartiesLogos(maxImages);
		//render chart here so that the results in chart are recalculated when user revotes
		renderDoughnut();
		//calculate and render winning party
		renderWinningParty(maxVotes);
	}
	
	function renderPartiesLogos(maxImages) {
		var box = $('.progress-box .logos');
		
		//	empty the logos container
		box.empty();

		//	add img tag for every element in logos array
		for (var i = 0; i < maxImages.length; i++) {
			var img = $('<img src="img/' + maxImages[i] + '" alt="' + maxImages[i] + '"></img>');
			box.append(img);
		}
	}

	// ----------------------------------
	//	*** TABLE POLICIES POPULATING ***
	// ----------------------------------
	
	var policies = parseJSON('/db/policies.json');
	
	for (var party in policies) {
		for (var policy in policies[party]) {
			$('.compare-table__cell[data-party="' + party + '"][data-policy="' + policy + '"]')
				.children('p')
				.text(policies[party][policy]);
		}
	}

	// ---------------------------------
	//	*** MODAL POPULATING ***
	// ----------------------------------
	function renderWinningParty(maxVotes){
		//get parties from parties.json so we have access to fact
		var parties = parseJSON('/db/parties.json');
		//calculate winning party
		var winningParties = [];
		for (var key in votes) {
			if (votes[key].length === maxVotes) {
				winningParties.push(key);
			}
		}
		//empty paras of previous party fact results
		var resultsPara = $('.results-para');
		resultsPara.empty();
		var factPara = $('.fact-para');
		factPara.empty();

		//populate the p tag using winningParties array and data from parties.json
		for (var i = 0; i < winningParties.length; i++) {
			//append results to results para
			var results = $('<p>You chose the ' + winningParties[i] + ' Party.</p>');
			resultsPara.append(results);
			//append fact to p tag
			var para = $('<p>' + parties[winningParties[i]]["fact"] + '</p>');
			factPara.append(para);
		}
	}

	// --------------------------------------
	//	*** TABLE POLICIES RESPONSIVENESS ***
	// --------------------------------------

	var windowWidth = $(window).width();

	if (windowWidth < 900) {
		for (var i = 0; i < parties.length; i++) {
			$('.policies [data-party="' + parties[i] + '"]').css('order', i);
		}
	}

});



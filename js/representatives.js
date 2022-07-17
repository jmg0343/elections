// set api key and build url
// let api_key = config.GOOGLE_CIVIC_API_KEY;
let api_key = GOOGLE_CIVIC_API_KEY;
let api_url = "https://www.googleapis.com/civicinfo/v2/representatives";

function sendData() {
	// retrieve data sent from form
	let formData = new FormData(document.getElementById("addressForm"));

	// create variables from form data
	let address = formData.get('address');
	let city = formData.get('city').replace(/\s/g, ""); // remove spaces between cities with 2 words
	let state = formData.get('state');
	let zip = formData.get('zip');

	// create array of form data
    var data = {address: address, city: city, state: state, zip: zip};

	// call findReps function and pass form data
    findReps(data)
}

function findReps(data) {
	// create array of available rep levels
    // let levels = ['country', 'administrativeArea1', 'administrativeArea2', 'locality']
    let levels = ['country', 'administrativeArea1', 'administrativeArea2&levels=locality']

	// loop through levels array and attach level to api call
    levels.forEach(level => {
        fetch(api_url + "?key=" + api_key + "&address=" + data.address + data.city + data.state + "&levels=" + level)
            .then(response => response.json())
            .then((data) => {
            // instantiate output variable to send to front end
			let output = ''
			// loop through offices and create table
			data['offices'].forEach((element, i) => {
				output += `<h2 class="text-muted">${element.name}</h2>`
				output += `
				<table class='table representativesTable'>
				<thead class='table-primary'>
				<tr>
				<th scope='col'>Name</th>
				<th scope='col'>Party</th>
				<th scope='col'>Address</th>
				<th scope='col'>Phone</th>
				<th scope='col'>Website</th>
				<th scope='col'>Email</th>
				</tr>
				</thead>
				<tbody>
				`

				// loop through official indices to retrieve index of appropriate official
				element.officialIndices.forEach((value) => {
					// call reps function to retrieve data of appropriate official - based on index
					var repInfo = reps(value, {data})
					
					// add data from reps function to correct table row
					output += `
					<tr>
					<td>${repInfo[0]}<br><br>${repInfo[6]}</td>
					<td>${repInfo[1]}</td>
					<td>${repInfo[2]}</td>
					<td>${repInfo[3]}</td>
					<td>${repInfo[4]}</td>
					<td>${repInfo[5]}</td>
					</tr>
					`
				})
				
				// complete table closing tags
				output += `
				</tbody>
				</table>
				<br>
				<br>
				`
			})

			// swtich case determines which div to insert data into
            switch (level) {
                case 'country':
                    document.getElementById('federalRepresentatives').innerHTML ="<h1 class='text-center'><u>Federal Representatives</u></h1><br>" + output
                    break;
                case 'administrativeArea1':
                    document.getElementById('stateRepresentatives').innerHTML = "<h1 class='text-center'><u>State Representatives</u></h1><br>" + output
                    break;
                case 'administrativeArea2&levels=locality':
                    document.getElementById('localRepresentatives').innerHTML = "<h1 class='text-center'><u>Local Representatives</u></h1><br>" + output
                    break;
            }

			// expand federal results
			document.getElementById('federalRepsButton').click();
			// display reset and filter buttons when table is displayed
			document.getElementById('resetButton').style.display = ''
			document.getElementById('filterButtons').style.display = ''
		})
    })
}

function reps(index, data) {
	// interpret sent data and make it traversable
	var stringifiedData = JSON.stringify(data)
	let representativeData = JSON.parse(stringifiedData)

	var repDataArray = []

	// iterate through officials array
	representativeData['data']['officials'].forEach((element, i) => {

		// if index doesn't match, skip immediately
		if (i != index) {
			return false
		}

		// instantiate socialMediaIcons variable as empty in case none exist
		var socialMediaIcons = ""
		// if rep has social media, call socialMedia function to retrieve info
		if (typeof element.channels != "undefined") {
			var socialMediaIcons = socialMedia(element.channels)
		}

		// create data variables to send in array
		var address = (typeof element.geocodingSummaries[0]['queryString'] == "undefined") ? "N/A" : element.geocodingSummaries[0]['queryString']
		var phone = (typeof element.phones[0] == "undefined") ? "N/A" : element.phones[0]
		var website = (typeof element.urls == "undefined") ? "N/A" : `<a href=${element.urls[0]} target="_blank">${element.urls[0]}</a>`
		// var social = (typeof element.channels == "undefined") ? `<span>N/A</span>` : social = element.channels[0]['id']
		var email = (typeof element.emails == "undefined") ? "N/A" : `<a href="mailto:${element.emails[0]}">${element.emails[0]}</a>`

		// push necessary data into array
		repDataArray.push(
			element['name'], 
			element['party'], 
			address,
			phone,
			website,
			email,
			socialMediaIcons
		)
	})

	return repDataArray
}

function socialMedia (data) {

	// instantiate empty socialMedia array
	var socialMedia = []

	// loop through channel data and push each social media icon and link into array
	data.forEach(data => {
		switch (data['type']) {
			case 'Twitter':
				socialMedia.push(`<a href="https://twitter.com/${data['id']}" class="socialMediaLink twitter" target=_blank><i class="fa-brands fa-twitter fa-xl"></i></a>`);
				break;
			case 'Facebook':
				socialMedia.push(`<a href="https://www.facebook.com/${data['id']}" class="socialMediaLink facebook" target=_blank><i class="fa-brands fa-facebook fa-xl"></i></a>`);
				break;
			case 'YouTube':
				socialMedia.push(`<a href="https://www.youtube.com/${data['id']}" class="socialMediaLink youtube" target=_blank><i class="fa-brands fa-youtube fa-xl"></i></a>`);
				break;
			default:
				socialMedia.push('No social media found.')
		}
	})

	// join array to remove commas for display purposes and return socialMedia array
	return socialMedia.join('')
}

function displayBadge(data, level) {
	if (data.getAttribute('aria-expanded') === "true") {
		document.getElementById(level).style.display = ''
	} else {
		document.getElementById(level).style.display = 'none'
	}
}


// BACK TO TOP BUTTON

//Get the button
let backToTopButton = document.getElementById("btn-back-to-top");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (
    document.body.scrollTop > 20 ||
    document.documentElement.scrollTop > 20
  ) {
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
}
// When the user clicks on the button, scroll to the top of the document
backToTopButton.addEventListener("click", backToTop);

function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
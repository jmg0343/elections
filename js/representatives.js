// set api key and build url
let api_key = "AIzaSyBIGUM7KugOhd_bTX2m9g2jNXBiWkkraC8";
let api_url = "https://www.googleapis.com/civicinfo/v2/representatives?key=" + api_key;

function offices(index) {
	var formData = new FormData(document.getElementById("addressForm"));

	var address = formData.get('address');
	var city = formData.get('city');
	var state = formData.get('state');
	var zip = formData.get('zip');

	fetch(api_url + "&address=" + address + city + state)
		.then(response => response.json())
		.then((data) => {
			console.log(data)
			let output = ''
			data['offices'].forEach((element, i) => {
				output += `<h2>${element.name}</h2>`
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

				element.officialIndices.forEach((value) => {
					var repInfo = reps(value, {data})
					console.log('test ' + repInfo[6])
					
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
				
				output += `
				</tbody>
				</table>
				<br>
				<br>
				`
			})
			document.getElementById('representatives').innerHTML = output
			document.getElementById('resetButton').style.display = ''
		}
	)
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

		if (typeof element.channels != "undefined") {
			var socialMediaIcons = socialMedia(element.channels)
		}

		// create data variables to send in array
		var address = (typeof element.geocodingSummaries[0]['queryString'] == "undefined") ? "N/A" : element.geocodingSummaries[0]['queryString']
		var phone = (typeof element.phones[0] == "undefined") ? "N/A" : element.phones[0]
		var website = (typeof element.urls == "undefined") ? "N/A" : `<a href=${element.urls[0]} target="_blank">${element.urls[0]}</a>`
		var social = (typeof element.channels[0]['id'] == "undefined") ? "N/A" : social = element.channels[0]['id']
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

	var socialMedia = []

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

	return socialMedia.join('')
}
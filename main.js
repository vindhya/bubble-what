$(document).ready(function() {
	console.log('ready!');

	// get a reference to the database service
	const database = firebase.database();
	const dbRoot = database.ref('/');

	const sorryMessage = () => {
		$('.message').text(`Sorry, we don't have any drinks for you based on your preferences. Please try changing some of your answers around.`);
	};

	// checks whether the user chosen topping exists in the topping object passed in and returns a boolean
	const checkTopping = (toppings, userTopping) => {
		let hasTopping = false;

		for (topping in toppings) {
			if (topping === userTopping) hasTopping = true;
		}

		return hasTopping;
	};

	const getResults = (userWeather, userFlavour, userMilk, userTopping) => {

		dbRoot.once("value", snapshot => {
			snapshot.forEach(childSnapshot => {

				const childKey = childSnapshot.key;
				const toppings = childSnapshot.child('toppings').val();

				if (checkTopping(toppings, userTopping)) {

				} else {
					sorryMessage();
				}

			});
		});

	};

	// do this stuff when the form is submitted
	$('form').on('submit', function(event) {
		event.preventDefault();

		// grab the values that the user chose and put them in variables
		const userWeather = $('input[name="weather"]:checked').val();
		const userFlavour = $('input[name="flavour"]:checked').val();
		const userMilk = $('input[name="milk"]:checked').val();
		const userTopping = $('input[name="topping"]:checked').val();

		console.log(userWeather, userFlavour, userMilk, userTopping);

		getResults(userWeather, userFlavour, userMilk, userTopping);
	});

});
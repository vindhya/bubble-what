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

	// checks whether the passed in drink object meshes with the user parameters for weather, flavour, and milk preference
	const checkDrinkMatch = (drink, userDrinkTemp, userFlavour, userMilk) => {
		let drinkMatch = false;
		
		if (
				((drink.cold === true && userDrinkTemp === 'cold')
				|| (drink.hot === true && userDrinkTemp === 'hot')
				|| (drink.slush === true && userDrinkTemp === 'slush'))
			&& (drink.flavour === userFlavour)
			&& ((drink.milk === true && userMilk === 'milk')
				|| (drink.milk === undefined && userMilk === 'no-milk'))
		) {
			// console.log('drink temp, flavour, AAAAND milk match!');
			drinkMatch = true;
		}

		return drinkMatch;
	};

	const getResults = (userDrinkTemp, userFlavour, userMilk, userTopping) => {
		const drinkResults = {};

		dbRoot.once("value", snapshot => {
			snapshot.forEach(childSnapshot => {

				const shop = childSnapshot.key;
				const toppings = childSnapshot.child('toppings').val();
				const drinks = childSnapshot.child('drinks').val();

				drinkResults[shop] = {};
				drinkResults[shop].drinks = {};
				drinkResults[shop].location = childSnapshot.child('location').val();
				drinkResults[shop].name = childSnapshot.child('name').val();
				drinkResults.topping = userTopping;
				console.log(drinkResults);

				if (checkTopping(toppings, userTopping)) {
					for (drink in drinks) {
						if (checkDrinkMatch(drinks[drink], userDrinkTemp, userFlavour, userMilk)) {
							console.log('checkDrinkMatch evaluated to true!');
							drinkResults[shop]['drinks'][drink] = drinks[drink];
						}
					}
				} 

			});
		});

		// if drink results is empty then call sorryMessage()

		return drinkResults;
	};

	const displayResults = (userDrinkTemp, userFlavour, userMilk, userTopping) => {
		getResults(userDrinkTemp, userFlavour, userMilk, userTopping);
	};

	// do this stuff when the form is submitted
	$('form').on('submit', function(event) {
		event.preventDefault();

		// grab the values that the user chose and put them in variables
		const userDrinkTemp = $('input[name="weather"]:checked').val();
		const userFlavour = $('input[name="flavour"]:checked').val();
		const userMilk = $('input[name="milk"]:checked').val();
		const userTopping = $('input[name="topping"]:checked').val();

		console.log(userDrinkTemp, userFlavour, userMilk, userTopping);

		displayResults(userDrinkTemp, userFlavour, userMilk, userTopping);
	});

});
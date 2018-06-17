$(document).ready(function() {
	// console.log('ready!');

	let userDrinkTemp;
	let userFlavour;
	let userMilk;
	let userTopping;

	// displays an embedded google maps based on the passed in shopLocation URL
	const displayMap = shopLocation => {
		const mapWidth = '100%';
		const mapHeight = 350;

		if (shopLocation) { // if shopLocation has a value
			const locationHtml = `<iframe src="${shopLocation}" width="${mapWidth}" height="${mapHeight}" frameborder="0" style="border:0" allowfullscreen></iframe>`;
			$('.shop-location').html(locationHtml);
		} else { // if shopLocation is undefined, i.e., there is no drink result
			$('.shop-location').empty();
		}

	};

	const scrollDown = element => {
		document.querySelector(element).scrollIntoView({
			behavior: 'smooth'
		});
	};

	// prints a drink based on the provided arguments/parameters, userTopping global variable, and userDrinkTemp global variable
	const displayDrink = (drink, shopName, shopLocation) => {
		// console.log(drink, shopName, shopLocation, userTopping, userDrinkTemp);
		let drinkTemp = '';
		let topping = '';

		if (userDrinkTemp != 'slush') {
			drinkTemp = userDrinkTemp + ' ';
		}

		if (userTopping != 'no-topping') {
			if (userTopping.includes('-')) {
				topping = ` with ${userTopping.replace('-', ' ')}`;
			} else {
				topping = ` with ${userTopping}`;
			}
		}

		const html = `Order a <span class="drink-display">${drinkTemp}${drink}${topping}</span> from <span class="drink-display">${shopName}</span>`;
		$('.message p').html(html);
		displayMap(shopLocation);
		scrollDown('.message');
	};

	const sorryMessage = () => {
		displayMap();
		$('.message').text(`Sorry, we don't have any drinks for you based on your preferences. Please try changing some of your answers around.`);
		scrollDown('.message');
	};

	// checks whether the user chosen topping exists in the topping object passed in and returns a boolean
	const checkTopping = toppings => {
		let hasTopping = false;

		if (userTopping === 'no-topping') {
			hasTopping = true;
		} else {
			for (topping in toppings) {
				if (topping === userTopping) hasTopping = true;
			}
		}

		return hasTopping;
	};

	// checks whether the passed in drink object meshes with the user's inputted preferences (global variables)
	const checkDrinkMatch = drink => {
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

	const getResults = () => {
		// get a reference to the database service
		const database = firebase.database();
		const dbRoot = database.ref('/');
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
				// console.log(drinkResults);

				if (checkTopping(toppings)) {
					for (drink in drinks) {
						if (checkDrinkMatch(drinks[drink], userDrinkTemp, userFlavour, userMilk)) {
							drinkResults[shop]['drinks'][drink] = drinks[drink];
						}
					}
				}

				// if the drinks child of the shop is still empty, remove the shop from the drinkResults object
				// is it bad to do this while interating over the childSnapshot :|
				// console.log('pre-delete', drinkResults);
				if ($.isEmptyObject(drinkResults[shop].drinks)) {
					delete drinkResults[shop];
				}
				// console.log('post-delete', drinkResults);

			});

			displayResults(drinkResults);
		});

		return drinkResults;
	};

	// returns the number of drinks in the passed in object
	// AND adds a key to drink
	const countDrinks = drinkResults => {
		let count = 0;

		for (shop in drinkResults) {
			for (drink in drinkResults[shop]['drinks']) {
				count++;
				drinkResults[shop]['drinks'][drink].key = count;
			}
		}

		return count;
	};

	const randomNumber = max => {
		return Math.floor(Math.random() * max) + 1;
	};

	// prints a drink based on the possible results
	const displayResults = drinkResults => {

		const drinkNum = countDrinks(drinkResults);

		if (drinkNum > 1) {
			// get a random number and display the drink with that key
			const randIndex = randomNumber(drinkNum);
			// console.log('randomNumber index', randIndex);
			for (shop in drinkResults) {
				for (drink in drinkResults[shop]['drinks']) {
					if (drinkResults[shop]['drinks'][drink].key === randIndex) {
						// console.log(drinkResults[shop]['drinks'][drink].key);	
						// console.log(drinkResults[shop]['drinks'][drink].name);
						displayDrink(drinkResults[shop]['drinks'][drink].name, drinkResults[shop].name, drinkResults[shop].location);
					}
				}
			}

		} else if (drinkNum === 1) {
			// display the one drink result
			for (shop in drinkResults) {
				for (drink in drinkResults[shop]['drinks']) {
					// console.log(drink);
					displayDrink(drinkResults[shop]['drinks'][drink].name, drinkResults[shop].name, drinkResults[shop].location);
				}
			}
		} else {
			// display the sorry message
			sorryMessage();
		}

	};

	// do this stuff when the form is submitted
	$('form').on('submit', function(event) {
		event.preventDefault();

		// grab the values that the user chose and put them in variables
		// userDrinkTemp = $('#weather-select').val();
		userDrinkTemp = $('input[name="weather"]:checked').val();
		// userFlavour = $('#flavour-select').val();
		userFlavour = $('input[name="flavour"]:checked').val();
		// userMilk = $('#milk-select').val();
		userMilk = $('input[name="milk"]:checked').val();
		userTopping = $('#topping-select').val();

		// console.log('user inputs:', userDrinkTemp, userFlavour, userMilk, userTopping);

		getResults();
	});

});
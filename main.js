$(document).ready(function() {
	console.log('ready!');

	// get a reference to the database service
	const database = firebase.database();
	const everything = database.ref('/');
		
	everything.once('value').then(function(snapshot) {
		// console.log(snapshot);
		// console.log(snapshot.val());
		// console.log(typeof snapshot.val());
	});

});
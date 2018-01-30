var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
	host: "localhost",
	port: "3306",
	user: "root",
	password: "K,-lGt*fa5nm",
	database: "Bamazon_DB"
});

connection.connect(function(err) {
	if (err) throw err;
	console.log('connected as ID ' + connection.threadId + "\n");
	displayAll();
	userPromptItem();
	//connection.end();
	
})

function displayAll() {
	connection.query("SELECT * FROM products", 
		function(err, res) {
			if (err) throw err;
			console.log(res);
			console.log("press any key to continue");

		})
};

function validateInput(value) {
	var integer = Number.isInteger(parseFloat(value));
	var sign = Math.sign(value);

	if (integer && (sign ===1)) {
		return true;
	} else {
		return 'Please enter a whole non-zero number.';
	}
}

function userPromptItem() {
	inquirer.prompt([
	{
		type: "input",
		name: "item_id",
		message: "What is the product ID you'd like to buy?",
		validate: validateInput,
		filter: Number
	},
	{
		type: "input",
		name: "stock_quantity",
		message: "How many would you like?",
		validate: validateInput,
		filter: Number
	}

	]).then(function(inquirerResponse) {
		var item = inquirerResponse.item_id;
		var quantity = inquirerResponse.stock_quantity;

		var queryStr = 'SELECT * FROM products WHERE ?';
		connection.query(queryStr, {item_id: item}, function(err, data) {
			if (err) throw err;
			console.log('data = ' + JSON.stringify(data));

			if (data.length === 0) {
				console.log("Please choose a valid item");
			} else {
				var productData = data[0];
				//console.log('productData = ' + JSON.stringify(productData));
				if (quantity <= productData.stock_quantity) {
					console.log('Congratulations! Order submitted');
				
					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;
					
					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;
						console.log('Your order has been placed. Your total is $' + productData.price * quantity);
						console.log('Thank you for shopping! Your life is about to get way more comfortable')

						connection.end();
					})
				} else {
					console.log("Sorry your order cannot be placed. We don't currently have the inventory. Please check back later.")
					displayAll();
				}
			}
		})
	})
};

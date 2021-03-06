(function(){

	var app = angular.module('stock', []);

	app.controller('StockController', ['$http', function($http){
		var stockCtrl = this;
		this.users = [];
		this.symbols = [];
		this.increaseCasheList = [];
		this.validatedCashRequest = [];
		
		this.currentUser = {firstname: 'میهمان'};
		this.newUser = {};
		this.newSymbol = {};
		this.sellRequest = {};
		this.buyRequest = {};
		this.types = ["GTC", "MTC"];
		this.increaseCasheRequest = {};
		
		this.isAdmin = false;
		this.isGuest = true;
		
		//Get Users
		this.getUsers = function(){
		$http.get('http://localhost:8080/stock/customer/get').success(function(usersData) {
		    stockCtrl.users = usersData;
		    console.log(usersData);
		});
		}
		
		//Get Symbols
		this.getSymbols = function(){
		$http.get('http://localhost:8080/stock/symbol/get').success(function(symbolsData) {
		    stockCtrl.symbols = symbolsData;
		    console.log(symbolsData);
		});
		}
		
		//Get Increase Cashe Request List
		this.getIncreaseRequests = function(){
		$http.get('http://localhost:8080/stock/customer/get_increase_request').success(function(requestsData) {
		    stockCtrl.increaseCasheList = requestsData;
		    console.log(requestsData);
		});
		}
		
		this.announce = function(data, type)
		{
			var str = 'درخواست ' + type + ' شما با کد رهگیری ' + data.id + ' در سامانه ثبت گردید'
			alert(str);
		}
		
		//Refresh data
		this.refresh = function(){
			stockCtrl.getUsers();
			stockCtrl.getSymbols();
			stockCtrl.getIncreaseRequests();
		}
		
		this.refresh();
		
		reload = this.refresh;
		
		this.signIn = function()
		{
			//console.log('login: ');
			//console.log(stockCtrl.currentUser);
			$http({
				method: 'POST',
				url: 'http://localhost:8080/stock/customer/get', 
		    params: { username: stockCtrl.currentUser.username }
				}).then(function(response) {
					var user = response.data;
					if (user === 'null')
					{
						console.log('Customer does not exist!');
						var element = document.getElementById('signInModalError');
						element.innerHTML = 'چنین کاربری تعریف نشده است!';
					}
					else if (stockCtrl.currentUser.password === user.password)
					{
						stockCtrl.currentUser = user;
						console.log('Hello ' + stockCtrl.currentUser.firstname);
						$('#signInModal').modal('hide');
						showDashboard();
						stockCtrl.isUser = true;
						if (user.id === 0)
							stockCtrl.isAdmin = true;
					}
					else
					{
						console.log('Wrong password!');
						var element = document.getElementById('signInModalError');
						element.innerHTML = 'گذرواژه صحیح نمی باشد!';
					}
					// alert(response);
					//console.log(user);
					console.log(response);
					console.log(stockCtrl.currentUser.sellList);
					console.log(stockCtrl.currentUser.buyList);
			});
		}
		
		this.signUp = function()
		{
			$http({
				method: 'POST',
				url: 'http://localhost:8080/stock/customer/add',
		    	params: { username: stockCtrl.newUser.username , password: stockCtrl.newUser.password ,
		    					firstname: stockCtrl.newUser.firstname , lastname: stockCtrl.newUser.lastname }
				}).then(function(response) {
					console.log(response);
					if (response.data.hasOwnProperty('id'))
					{
						stockCtrl.currentUser = response.data;
						stockCtrl.users.push(stockCtrl.currentUser);
						$('#signUpModal').modal('hide');
						stockCtrl.isUser = true;
					}
					else
					{
						var ul = document.createElement('ul');
						for (var error in response.data)
						{
							var li = document.createElement('li');
							var errText = document.createTextNode(response.data[error]);
							li.appendChild(errText);
							ul.appendChild(li);
						}

						var element = document.getElementById("signUpModalError");
						element.innerHTML = '';
						element.appendChild(ul);
					}
			});
		}
		
		this.signOut = function()
		{
			stockCtrl.isUser = false;
			stockCtrl.isAdmin = false;
			stockCtrl.currentUser = {firstname: 'میهمان'};
			showHome();
		}
		
		this.addSymbol = function()
		{
			$http({
				method: 'POST',
				url: 'http://localhost:8080/stock/symbol/add',
			    params: { name: stockCtrl.newSymbol.name } }).then(function(response) {
					console.log(response);
					if (response.data.hasOwnProperty('id'))
					{
						stockCtrl.symbols.push(response.data);
						$('#addSymbolModal').modal('hide');
						stockCtrl.announce(response.data, 'افزودن نماد');
					}
					else
					{
						var ul = document.createElement('ul');
						for (var error in response.data)
						{
							var li = document.createElement('li');
							var errText = document.createTextNode(response.data[error]);
							li.appendChild(errText);
							ul.appendChild(li);
						}

						var element = document.getElementById("addSymbolModalError");
						element.innerHTML = '';
						element.appendChild(ul);
					}
			});
		}
		
		this.sell = function()
		{
			console.log(stockCtrl.sellRequest);
			$http({
				method: 'POST',
				url: 'http://localhost:8080/stock/symbol/sell',
			    params: { customerId: stockCtrl.currentUser.id,
			    		  symbolId: stockCtrl.sellRequest.symbolId,
			    		  quantity: stockCtrl.sellRequest.quantity,
			    		  price: stockCtrl.sellRequest.price,
			    		  type: stockCtrl.sellRequest.type} }).then(function(response) {
					console.log(response);
					if (response.data.hasOwnProperty('id'))
					{
						stockCtrl.symbols[stockCtrl.sellRequest.symbolId].sellList.push(response.data);
						stockCtrl.currentUser.sellList.push(response.data);
						$('#sellModal').modal('hide');
						stockCtrl.announce(response.data, 'فروش');
					}
					else
					{
						var ul = document.createElement('ul');
						for (var error in response.data)
						{
							var li = document.createElement('li');
							var errText = document.createTextNode(response.data[error]);
							li.appendChild(errText);
							ul.appendChild(li);
						}
						var element = document.getElementById('sellModalError');
						element.innerHTML = '';
						element.appendChild(ul);
					}
			});
		}
		
		this.buy = function()
		{
			console.log(stockCtrl.buyRequest);
			$http({
				method: 'POST',
				url: 'http://localhost:8080/stock/symbol/buy',
			    params: { customerId: stockCtrl.currentUser.id,
			    		  symbolId: stockCtrl.buyRequest.symbolId,
			    		  quantity: stockCtrl.buyRequest.quantity,
			    		  price: stockCtrl.buyRequest.price,
			    		  type: stockCtrl.buyRequest.type} }).then(function(response) {
					console.log(response);
					if (response.data.hasOwnProperty('id'))
					{
						stockCtrl.symbols[stockCtrl.buyRequest.symbolId].buyList.push(response.data);
						stockCtrl.currentUser.buyList.push(response.data);
						$('#buyModal').modal('hide');
						stockCtrl.announce(response.data, 'خرید');
					}
					else
					{
						var ul = document.createElement('ul');
						for (var error in response.data)
						{
							var li = document.createElement('li');
							var errText = document.createTextNode(response.data[error]);
							li.appendChild(errText);
							ul.appendChild(li);
						}
						var element = document.getElementById('buyModalError');
						element.innerHTML = '';
						element.appendChild(ul);
					}
			});
		}
		
		this.increaseCashe = function()
		{
			console.log(stockCtrl.increaseCashe);
			$http({
				method: 'POST',
				url: 'http://localhost:8080/stock/customer/add_increase_request',
			    params: { cashe: stockCtrl.increaseCasheRequest.cashe,
			    		  customerId: stockCtrl.currentUser.id} }).then(function(response) {
					console.log(response);
					if (response.data.hasOwnProperty('id'))
					{
						stockCtrl.increaseCasheList.push(response.data);
						$('#increaseCasheModal').modal('hide');
						stockCtrl.announce(response.data, 'افزایش اعتبار');
					}
					else
					{
						var ul = document.createElement('ul');
						for (var error in response.data)
						{
							var li = document.createElement('li');
							var errText = document.createTextNode(response.data[error]);
							li.appendChild(errText);
							ul.appendChild(li);
						}
						var element = document.getElementById('increaseCasheError');
						element.innerHTML = '';
						element.appendChild(ul);
					}
			});
		}
		
		this.validateCashRequest = function()
		{
			console.log(stockCtrl.validatedCashRequest);
			var listParam = [];
			for (item in stockCtrl.validatedCashRequest)
			{
				if (stockCtrl.validatedCashRequest[item] === true)
					listParam.push(item);
			}
			
			$http({
				method: 'POST',
				url: 'http://localhost:8080/stock/customer/increase_cashe',
			    params: { list: listParam } }).then(function(response) {
					console.log(response);
					if (!response.data.hasOwnProperty('err'))
					{
						for (item in response.data)
						{
							stockCtrl.users[item].depositedAmount = response.data[item];
						}
						//stockCtrl.increaseCasheList.push(response.data);
						//$('#increaseCasheModal').modal('hide');
						stockCtrl.getIncreaseRequests();
					}
					else
					{
						var ul = document.createElement('ul');
						for (var error in response.data)
						{
							var li = document.createElement('li');
							var errText = document.createTextNode(response.data[error]);
							li.appendChild(errText);
							ul.appendChild(li);
						}
						var element = document.getElementById('increaseCasheError');
						element.innerHTML = '';
						element.appendChild(ul);
					}
			});
		}
	}]);
})();

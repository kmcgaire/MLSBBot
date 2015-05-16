

module.exports = (function(){

	var millisecondInDay = 60*60*24*1000;
	var now = new Date();
	var millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 0) - now;
	if (millisTill10 < 0) {
	     millisTill10 += millisecondInDay; // it's after 10am, try 10am tomorrow.
	}
	setTimeout(function(){
		alert("It's 10am!")
		setInterval(function(){

		}, millisecondInDay);
	}, millisTill10);
})()

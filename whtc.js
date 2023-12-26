var hexPrefix = '0x';
var hexLength = 8;

/* Removes prefix from hexadecimal value */
String.prototype.removeHexPrefix = function () {
	return this.replace(hexPrefix, '');
};

/* Adds prefix to hexadecimal value */
String.prototype.addHexPrefix = function () {
	return hexPrefix+this;
};

/* Replaces all invalid characters with zeros */
String.prototype.cleanHex = function () {
	return this.replace(/[^A-Fa-f0-9]/g, '0');
};

/* Trims hexadecimal value to hexLength */
String.prototype.trimHex = function () {
	return this.substr(0, hexLength);
};

/* Pads hexadecimal value to hexLength */
String.prototype.padHex = function (hexLength) {
	var hex = this;
	while (hex.length < hexLength) hex = '0'+hex;
	return hex;
};

/* Converts hexadecimal value into decimal value */
String.prototype.hexToDec = function () {
	return parseInt(this, 16);
};

/* Converts decimal value into hexadecimal value */
Number.prototype.decToHex = function () {
	return this.toString(16);
};


Helper = function () {

	/* Verifies hexadecimal value and returns corrected one */
	this.verifyHex = function (hex) {
		hex = hex.removeHexPrefix().cleanHex().toUpperCase();
		hex = (hex.length < hexLength) ? hex.padHex(8) : hex;
		hex = (hex.length > hexLength) ? hex.trimHex() : hex;
		return hex.addHexPrefix();
	};

	/* Verifies date string */
	this.verifyDateString = function (dateString) {
		if (dateString.match(/^(((0[1-9]|[12]\d|3[01])[\/](0[13578]|1[02])[\/]((16|17|18|19|[2-9]\d)\d{2}\d?)\s(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]))|((0[1-9]|[12]\d|30)[\/](0[13456789]|1[012])[\/]((16|17|18|19|[2-9]\d)\d{2}\d?)\s(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]))|((0[1-9]|1\d|2[0-8])[\/](02)[\/]((16|17|18|19|[2-9]\d)\d{2}\d?)\s(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]))|((29)[\/](02)[\/]((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\s(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])))$/g)) {
			return true;
		} else {
			return false;
		}
	};

	/* Combines HIGHPART and LOWPART into hexadecimal value */
	this.combineHighAndLowPart = function (highPart, lowPart) {
		highPart = highPart.removeHexPrefix();
		lowPart = lowPart.removeHexPrefix();
		return (highPart+lowPart).addHexPrefix();
	};

	/* Splits hexadecimal value into HIGHPART and LOWPART */
	this.splitHighAndLowPart = function (hex) {
		var highPart = hex.removeHexPrefix().substr(0, 8);
		var lowPart = hex.removeHexPrefix().substr(8, 15);
		return [highPart.addHexPrefix(), lowPart.addHexPrefix()];
	};

	/* Converts Win32-FILETIME into UNIX timestamp */
	this.winTimeToUnixTime = function (winTime) {
		/* Round the win timestamp down to seconds and remove the seconds between 1601-01-01 and 1970-01-01 */
		return parseInt((winTime / 10000000) - 11644477200);
	};

	/* Converts UNIX timestamp into Win32-FILETIME */
	this.unixTimeToWinTime = function (unixTime) {
		/* Add the seconds between 1601-01-01 and 1970-01-01 to the unix timestamp and make it 100-nanosecond precision */
		return (unixTime + 11644477200) * 10000000;
	};

	/* Converts UNIX timestamp into DD/MM/YYYY hh:mm:ss string */
	this.unixTimeToDateString = function (unixTime) {
		function pad (n) { return n<10 ? '0'+n : n; }
		var dateObject = new Date(unixTime * 1000);
		var day     = pad(dateObject.getDate());
		var month   = pad(dateObject.getMonth()+1);
		var year    = dateObject.getFullYear();
		var hours   = pad(dateObject.getHours());
		var minutes = pad(dateObject.getMinutes());
		var seconds = pad(dateObject.getSeconds());
		return day+'/'+month+'/'+year+' '+hours+':'+minutes+':'+seconds;
	};

	/* Converts DD/MM/YYYY hh:mm:ss string into UNIX timestamp */
	this.dateStringToUnixTime = function (dateString) {
		var dateArray = dateString.split(' ');
		var date    = dateArray[0].split('/');
		var time    = dateArray[1].split(':');
		var day     = date[0];
		var month   = date[1]-1;
		var year    = date[2];
		var hours   = time[0];
		var minutes = time[1];
		var seconds = time[2];
		return new Date(year, month, day, hours, minutes, seconds) / 1000;
	};

};

var helper = new Helper();


function decode () {
	$('.debug').empty();

	/* Get hexadecimal values */
	var highPart = $('.highpart').val();
	var lowPart  = $('.lowpart').val();

	if (highPart && lowPart) {
		/* Verify hexadecimal values */
		highPart = helper.verifyHex(highPart);
		lowPart = helper.verifyHex(lowPart);

		/* Overwrite hexadecimal values */
		$('.highpart').val(highPart);
		$('.lowpart').val(lowPart);

		/* Convert hexadecimal values */
		var hexTime    = helper.combineHighAndLowPart(highPart, lowPart);
		var winTime    = hexTime.hexToDec();
		var unixTime   = helper.winTimeToUnixTime(winTime);
		var dateString = helper.unixTimeToDateString(unixTime);

		/* Debug output */
		$('.debug').append('<span>HIGHPART    : ' + highPart + '</span>');
		$('.debug').append('<span>LOWPART     : ' + lowPart + '</span>');
		$('.debug').append('<span>HEX TIME    : ' + hexTime + '</span>');
		$('.debug').append('<span>WIN TIME    : ' + winTime + '</span>');
		$('.debug').append('<span>UNIX TIME   : ' + unixTime + '</span>');
		$('.debug').append('<span>DATE STRING : ' + dateString + '</span>');

		/* Set date string */
		$('.date').val(dateString);
	} else {
		$('.debug').append('<span>No HIGHPART or LOWPART values found!</span>');
	}
}

function encode () {
	$('.debug').empty();

	/* Get date string */
	var dateString = $('.date').val();

	if (dateString) {
		/* Verify date string */
		if (helper.verifyDateString(dateString)) {
			/* Convert date string */
			var unixTime = helper.dateStringToUnixTime(dateString);
			var winTime  = helper.unixTimeToWinTime(unixTime);
			var hexTime  = winTime.decToHex().padHex(16).toUpperCase().addHexPrefix();
			var highPart = helper.splitHighAndLowPart(hexTime)[0];
			var lowPart  = helper.splitHighAndLowPart(hexTime)[1];

			/* Debug output */
			$('.debug').append('<span>DATE STRING : ' + dateString + '</span>');
			$('.debug').append('<span>UNIX TIME   : ' + unixTime + '</span>');
			$('.debug').append('<span>WIN TIME    : ' + winTime + '</span>');
			$('.debug').append('<span>HEX TIME    : ' + hexTime + '</span>');
			$('.debug').append('<span>HIGHPART    : ' + highPart + '</span>');
			$('.debug').append('<span>LOWPART     : ' + lowPart + '</span>');

			/* Set hexadecimal values */
			$('.highpart').val(highPart);
			$('.lowpart').val(lowPart);
		} else {
			$('.debug').append('<span>Invalid DATETIME format!</span>');
		}
	} else {
		$('.debug').append('<span>No DATETIME value found!</span>');
	}
}


$(document).ready(function($) {
	$('.decode').on('click', decode);
	$('.encode').on('click', encode);
});

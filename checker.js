var count = 0;

var Checker = function(color, row, col) {
	this.color = color;
	this.className = color + count;
	this.loc = [row, col];
	this.isKing = false;
	count += 1;

	this.setLocation = function(row, col) {
		this.loc = [row, col];
	}

	this.isRed = function() {
		return this.color == 'red';
	}

	this.isBlack = function() {
		return this.color == 'black';
	}
}
var boardObj;
var gridWidth = 8;

var STATES = {
	NEW_GAME : 0,
	BLACK_TURN : 1, // computer turn
	RED_TURN : 2, // player turn
	BLACK_WON : 3,
	RED_WON : 4
}
var curState;

var setState = function(state) {
	curState = state;
	if (state == STATES.NEW_GAME ) {
	} else if (state == STATES.BLACK_TURN) {
		setTimeout(function() {
			boardObj.makeRandomMove('black');
			setState(STATES.RED_TURN);
		}, Math.random() * 1000);
	} else if (state == STATES.RED_TURN) {

	} else if (state == STATES.BLACK_WON) {

	} else if (state == STATES.RED_WON) {

	}
}


$(document).ready(function() {
	boardObj = new Board(gridWidth);
	view = new View(boardObj);
	boardObj.init();

	var sqrWidth = view.sqrWidth;

	setState(STATES.RED_TURN);

	var selectedChecker;
	$('#clickable').mousedown(function(e) {
		var coords = view.getCoordsFromPoint(e.pageX, e.pageY);
		var checker = boardObj.getChecker(coords[1], coords[0]);
		if (curState == STATES.RED_TURN) {
			if (checker && checker.isRed()) {
				selectedChecker = checker;
			}
		}
	});

	$('#clickable').mousemove(function(e) {
		if (selectedChecker) {
			view.dragChecker(e.pageX, e.pageY, selectedChecker);
		}
	});

	$('#clickable').mouseup(function(e) {
		if (selectedChecker) {
			var coords = view.getCoordsFromPoint(e.pageX, e.pageY);
			var row = coords[1]; var col = coords[0];
			if (boardObj.isValidMove(row, col, selectedChecker)) {
				var loc = selectedChecker.loc;
				boardObj.moveChecker(row, col, selectedChecker);

				selectedChecker = null;
				setState(STATES.BLACK_TURN);
			} else {
				var loc = selectedChecker.loc;
				boardObj.moveChecker(loc[0], loc[1], selectedChecker);
				selectedChecker = null;
			}
		}
	});
});
var BoardEvent = function(type, details) {
	this.type = type;
	this.details = details;
}

var Board = function(size) {
	this.boardSize = size;
	this.board = new Array();

	this.blackCheckers = new Array();
	this.redCheckers = new Array();

	this.init = function() {
		for (var row = 0; row < this.boardSize; row++) {
			this.board.push([]);
			for (var col = 0; col < this.boardSize; col++) {
				if ((row + col) % 2) {
					if (row < 2) {
						this.addChecker(row, col, 'black');
					} else if (row > this.boardSize-3) {
						this.addChecker(row, col, 'red');
					}
				} else {
					this.board[row].push(null);
				}
			}
		}
	}

	this.addChecker = function(row, col, color) {
		var checker = new Checker(color, row, col);
		if (checker.isRed())
			this.redCheckers.push(checker);
		else
			this.blackCheckers.push(checker);

		this.board[row].push(checker);
		this.dispatchBoardEvent("add", {checker : checker});
	}

	this.getChecker = function(row, col) {
		return this.board[row][col];
	}

	this.moveChecker = function(row, col, checker) {
		var loc = checker.loc;

		this.board[loc[0]][loc[1]] = null;
		this.board[row][col] = checker;
		checker.setLocation(row, col);

		if (Math.abs(row - loc[0]) > 1) {
			if (row > loc[0]) {
				if (col > loc[1]) 
					this.removeChecker(this.board[row-1][col-1]);
				else
					this.removeChecker(this.board[row-1][col+1]);
			} else {
				if (col > loc[1]) 
					this.removeChecker(this.board[row+1][col-1]);
				else
					this.removeChecker(this.board[row+1][col+1]);
			}	
		}

		this.dispatchBoardEvent("add", {checker : checker});

		if ((checker.isRed() && row == 0) || 
			(checker.isBlack() && row == this.boardSize - 1)) {
			this.promoteChecker(checker);
		}
	}

	this.removeChecker = function(checker) {
		this.board[checker.loc[0]][checker.loc[1]] = null;
		if (checker.isRed())
			this.redCheckers.splice(this.redCheckers.indexOf(checker), 1);
		else
			this.blackCheckers.splice(this.blackCheckers.indexOf(checker), 1);
		this.dispatchBoardEvent("remove", {checker : checker});
	}

	this.promoteChecker = function(checker) {
		checker.isKing = true;
		this.dispatchBoardEvent("promote", {checker : checker});
	}

	this.isValidMove = function(row, col, checker) {
		var curLoc = checker.loc;

		if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
			if (!this.getChecker(row, col)) {
				var dir = 1; // vertical direction of play
				if (checker.isRed()) {
					dir = -1;
				}
				if (checker.isKing) {
					if (Math.abs(row - curLoc[0]) == Math.abs(col - curLoc[1]))
						return true;
				} else {
					if (row == curLoc[0] + dir && Math.abs(col - curLoc[1]) == 1) {
						return true;
					} else if (row == curLoc[0] + 2 * dir) {
						var leftChecker = this.getChecker(row - dir, col - 1);
						if (leftChecker && col == curLoc[1] + 2 && 
							leftChecker.color != checker.color) {
							return true
						}

						var rightChecker = this.getChecker(row - dir, col + 1);
						if (rightChecker && col == curLoc[1] - 2 &&
							rightChecker.color != checker.color) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	// really dumb artificial intelligence
	this.makeRandomMove = function(color) {
		var checkers; var dir;
		if (color == 'black') {
			checkers = this.blackCheckers.slice();
			dir = 1;
		} else {
			checkers = this.redCheckers.slice();
			dir = -1;
		}

		while (true) {
			var randIndex = Math.floor(Math.random() * checkers.length);
			var checker = checkers[randIndex];
			checkers.splice(randIndex, 1);

			var possibleMoves = this.getAllPossibleMoves(checker, dir);
			if (possibleMoves.length > 0) {
				randIndex = Math.floor(Math.random() * possibleMoves.length);
				var move = possibleMoves[randIndex];
				this.moveChecker(move[0], move[1], checker);
				break;
			}
		}
	}

	this.getAllPossibleMoves = function(checker, direction) {
		var moves = new Array();

		var row = checker.loc[0] + direction; var col = checker.loc[1];
		if (this.isValidMove(row, col - 1, checker))
			moves.push([row, col - 1]);

		if (this.isValidMove(row, col + 1, checker))
			moves.push([row, col + 1]);

		row += direction;
		if (this.isValidMove(row, col - 2, checker))
			moves.push([row, col - 2]);

		if (this.isValidMove(row, col + 2, checker))
			moves.push([row, col + 2]);

		return moves;
	}

	this.allHandlers = new Array();
	
	this.dispatchBoardEvent = function(type, details){
		var newEvent = new BoardEvent(type, details);

		if (this.allHandlers[type]) {
			for (var i in this.allHandlers[type]) {
				this.allHandlers[type][i](newEvent);
			}
		}
	}

	this.addEventListener = function(eventType, handler){
		if (!this.allHandlers[eventType])
			this.allHandlers[eventType] = [];
		this.allHandlers[eventType].push(handler);
	}
}
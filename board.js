var BoardEvent = function(type, details) {
	this.type = type;
	this.details = details;
}

var Board = function(size) {
	this.boardSize = size;
	this.board = new Array();

	this.blackCheckers = new Array();
	this.redCheckers = new Array();

	this.jumpedCheckers = null;

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
		if (this.board[row])
			return this.board[row][col];
		else
			return null;
	}

	this.moveChecker = function(row, col, checker) {
		var loc = checker.loc;

		this.board[loc[0]][loc[1]] = null;
		this.board[row][col] = checker;
		checker.setLocation(row, col);

		if (this.jumpedCheckers) {
			for (var i = 0; i < this.jumpedCheckers.length; i++) 
				this.removeChecker(this.jumpedCheckers[i]);
			this.jumpedCheckers = null;
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
		var possibleMoves = this.getAllPossibleMoves(checker);
		for (var i = 0; i < possibleMoves.length; i++) {
			var move = possibleMoves[i].move;
			if (row == move[0] && col == move[1]) {
				this.jumpedCheckers = possibleMoves[i].jumped;
				return true;
			}
		}
		return false;
	}

	// really dumb artificial intelligence
	this.makeRandomMove = function(color) {
		var checkers;
		if (color == 'black') {
			checkers = this.blackCheckers.slice();
		} else {
			checkers = this.redCheckers.slice();
		}

		while (true) {
			var randIndex = Math.floor(Math.random() * checkers.length);
			var checker = checkers[randIndex];
			checkers.splice(randIndex, 1);

			var possibleMoves = this.getAllPossibleMoves(checker);

			if (possibleMoves.length > 0) {
				randIndex = Math.floor(Math.random() * possibleMoves.length);
				var move = possibleMoves[randIndex].move;
				this.moveChecker(move[0], move[1], checker);
				var jumped = possibleMoves[randIndex].jumped;
				for (var i = 0; i < jumped.length; i++) 
					this.removeChecker(jumped[i]);
				break;
			}
		}
	}

	this.getAllPossibleMoves = function(checker) {
		var moves = new Array();

		var row = checker.loc[0]; var col = checker.loc[1];

		if (checker.isKing) {
			var count = 1;
			for (var i = row + 1; i < this.boardSize; i++) {
				if (col - count >= 0) {
					var leftChecker = this.getChecker(i, col - count);
					if (!leftChecker)
						moves.push({ move : [i, col - count], jumped : [] });
				}

				if (col + count < this.boardSize) {
					var rightChecker = this.getChecker(i, col + count);
					if (!rightChecker)
						moves.push({ move : [i, col + count], jumped : [] });
				}
				count += 1;
			}

			count = 1;
			for (var j = row - 1; j >= 0; j--) {
				if (col - count >= 0) {
					var leftChecker = this.getChecker(j, col - count);
					if (!leftChecker)
						moves.push({ move : [j, col - count], jumped : [] });
				}

				if (col + count < this.boardSize) {
					var rightChecker = this.getChecker(j, col + count);
					if (!rightChecker)
						moves.push({ move : [j, col + count], jumped : [] });
				}
				count += 1;
			}

		} else {
			var dir = 1; // vertical dir of play
			if (checker.isRed()) {
				dir = -1;
			}

			// regular checker moves
			if (col - 1 >= 0 && row >= 0 && row < this.boardSize && 
				!this.getChecker(row + dir, col - 1))
				moves.push({ move : [row + dir, col - 1], jumped : [] });
			if (col + 1 < this.boardSize && row >= 0 && row < this.boardSize &&
				!this.getChecker(row + dir, col + 1))
				moves.push({ move : [row + dir, col + 1], jumped : [] });

			// jump moves, including multiple jumps
			var jumps = new Array({ move : [row, col], jumped : [] });
			while (jumps.length > 0) {
				var next = jumps.shift();

				nextLoc = next.move;
				jumped = next.jumped;

				// left jump
				var leftChecker = this.getChecker(nextLoc[0] + dir, nextLoc[1] - 1);
				if (leftChecker && leftChecker.color != checker.color) {
					var leftRow = nextLoc[0] + 2*dir; leftCol = nextLoc[1] - 2;
					if (leftRow >= 0 && leftRow < this.boardSize &&
						leftCol >= 0 && leftCol < this.boardSize &&
						!this.getChecker(leftRow, leftCol)) {
						moves.push({ move : [leftRow, leftCol], jumped : jumped.concat([leftChecker]) });
						jumps.push({ move : [leftRow, leftCol], jumped : jumped.concat([leftChecker]) });
					}
				}

				// right jump
				var rightChecker = this.getChecker(nextLoc[0] + dir, nextLoc[1] + 1);
				if (rightChecker && rightChecker.color != checker.color) {
					var rightRow = nextLoc[0] + 2*dir; rightCol = nextLoc[1] + 2;
					if (rightRow >= 0 && rightRow < this.boardSize &&
						rightCol >= 0 && rightCol < this.boardSize && 
						!this.getChecker(rightRow, rightCol)) {
						moves.push({ move : [rightRow, rightCol], jumped : jumped.concat([rightChecker]) });
						jumps.push({ move : [rightRow, rightCol], jumped : jumped.concat([rightChecker]) });
					}
				}

			}
		}
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
var View = function(board) {
	var drawChecker = function(view, checker) {
		if ($('img.'+checker.className).length == 0) {
			$("<img src=\"images/"+checker.color+"-piece.png\" class=\""+checker.className+"\" height="+view.sqrWidth+" width="+view.sqrWidth+">").insertAfter('#board');
		}

		var row = checker.loc[0]; var col = checker.loc[1];
		$('img.'+checker.className).css("position","absolute").css("z-index","1");
		$('img.'+checker.className).css("top", row*view.sqrWidth+$('#board').offset().top); 
		$('img.'+checker.className).css("left", col*view.sqrWidth+$('#board').offset().left);
	}

	var removeChecker = function(checker) {
		$("."+checker.className).remove();
	}

	var promoteChecker = function(checker) {
		$("."+checker.className).attr("src", "images/"+checker.color+"-king.png");
	};

	var drawBoard = function(view) {
		var canvas = document.getElementById('board');
		var context = canvas.getContext('2d');

		view.sqrWidth = canvas.width / gridWidth;
		if (context) {
			context.fillStyle = "#D8D8D8";
			for (var row = 0; row < gridWidth; row++) {
				for (var col = 0; col < gridWidth; col++) {
					if ((row + col) % 2) {
						context.fillRect(row*view.sqrWidth, col*view.sqrWidth, view.sqrWidth, view.sqrWidth);
					}
				}
			}
		}
	}

	this.getCoordsFromPoint = function(x, y) {
	return [Math.floor((x - $('#board').offset().left)/this.sqrWidth), 
			Math.floor((y - $('#board').offset().top)/this.sqrWidth)]
	}

	this.dragChecker = function(x, y, checker) {
		$("."+checker.className).css("left", x - $('#board').offset().left - this.sqrWidth/2.0);
		$("."+checker.className).css("top", y - $('#board').offset().top - this.sqrWidth/2.0);
		$("."+checker.className).css("z-index", 50);
	}

	this.gridWidth = board.boardSize;
	this.sqrWidth = 0;

	this.board = board;

	var view = this;

	drawBoard(view);

	board.addEventListener("add", function(e) {
		drawChecker(view, e.details.checker);
	});
	board.addEventListener("remove", function(e) {
		removeChecker(e.details.checker);
	});
	board.addEventListener("promote", function(e) {
		promoteChecker(e.details.checker);
	});
}
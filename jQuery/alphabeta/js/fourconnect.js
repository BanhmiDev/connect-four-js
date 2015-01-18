/**
 * Minimax Implementation 
 * @jQuery version
 */
function Game() {
    this.settings = {
        'hoehe': 6, // height
        'breite': 7, // width
        'status': 0, // 0: running, 1: won, 2: lost, 3: tie
        'depth': 4, // Search depth
        'score': 100000, // Win/loss score
        'round': 0, // 0: Human, 1: Computer
        'winning_array': [], // winning (chips) array
        'iteration': 0 // iteration count
    }
    
    that = this;

    that.init();
}

Game.prototype.init = function() {
    // Generate 'real' board
    // Create 2-dimensional array
    var game_board = new Array(that.settings.hoehe);
    for (var i = 0; i < game_board.length; i++) {
        game_board[i] = new Array(that.settings.breite);

        for (var j = 0; j < game_board[i].length; j++) {
            game_board[i][j] = null;
        }
    }

    // Create from board object (see board.js)
    this.board = new Board(this, game_board, 0);

    // Generate visual board
    var game_board = "<col/><col/><col/><col/><col/><col/><col/>";
    for (var i = 0; i < that.settings.hoehe; i++) {
        game_board += "<tr>";
        for (var j = 0; j < that.settings.breite; j++) {
            game_board += "<td class='empty'></td>";
        }
        game_board += "</tr>";
    }

    document.getElementById('game_board').innerHTML = game_board;

    // Action listeners
    var td = document.getElementById('game_board').getElementsByTagName("td");

    for (var i = 0; i < td.length; i++) {
        if (td[i].addEventListener) {
            td[i].addEventListener('click', that.act, false);
        } else if (td[i].attachEvent) {
            td[i].attachEvent('click', that.act)
        }
    }
}

/**
 * On-click event
 */
Game.prototype.act = function(e) {
    var element = e.target || window.event.srcElement;

    // Check if not in animation and start with human
    if (!($('#coin').is(":animated"))) {
        if (that.settings.round == 0) {
            that.place(element.cellIndex);
        }
    }
}

/* Todo: Fix this jQuery mess */
Game.prototype.place = function(column) {
    // If not finished
    if (that.board.score() != that.settings.score && that.board.score() != -that.settings.score && !that.board.isFull()) {
        for (var y = that.settings.hoehe - 1; y >= 0; y--) {
            if (document.getElementById('game_board').rows[y].cells[column].className == 'empty') {
                if (that.settings.round == 1) {
                    var coin_x = column * 51;
                    var coin_y = y * 51;
                    $('#coin').attr('class', 'cpu-coin').css({'left': coin_x}).fadeIn('fast').animate({'top': coin_y + 'px'}, 700, 'easeOutBounce', function() {
                        document.getElementById('game_board').rows[y].cells[column].className = 'coin cpu-coin';
                        $('#coin').hide().css({'top': '0px'});
                        
                        if (!that.board.place(column)) {
                            return alert("Invalid move!");
                        }

                        that.settings.round = that.switchRound(that.settings.round);
                        that.updateStatus();
                    });
                } else {
                    var coin_x = column * 51;
                    var coin_y = y * 51;
                    $('#coin').attr('class', 'human-coin').css({'left': coin_x}).fadeIn('fast').animate({'top': coin_y + 'px'}, 700, 'easeOutBounce', function() {
                        document.getElementById('game_board').rows[y].cells[column].className = 'coin human-coin';
                        $('#coin').hide().css({'top': '0px'});
                        that.generateComputerDecision();
                        
                        if (!that.board.place(column)) {
                            return alert("Invalid move!");
                        }

                        that.settings.round = that.switchRound(that.settings.round);
                        that.updateStatus();
                    });
                }
                break;
            }
        }
    }
}

Game.prototype.generateComputerDecision = function() {
    if (that.board.score() != that.settings.score && that.board.score() != -that.settings.score && !that.board.isFull()) {
        that.settings.iteration = 0; // Reset iteration count
        document.getElementById('loading').style.display = "block"; // Loading message

        // AI is thinking
        setTimeout(function() {
            // Debug time
            var startzeit = new Date().getTime();

            // Algorithm call
            var ai_move = that.maximizePlay(that.board, that.settings.depth);

            var laufzeit = new Date().getTime() - startzeit;
            document.getElementById('ai-time').innerHTML = laufzeit.toFixed(2) + 'ms';

            // Place ai decision
            that.place(ai_move[0]);

            // Debug
            document.getElementById('ai-column').innerHTML = 'Column: ' + parseInt(ai_move[0] + 1);
            document.getElementById('ai-score').innerHTML = 'Score: ' + ai_move[1];
            document.getElementById('ai-iterations').innerHTML = that.settings.iteration;

            document.getElementById('loading').style.display = "none"; // Remove loading message
        }, 100);
    }
}

/**
 * Algorithm
 * Minimax principle
 */
Game.prototype.maximizePlay = function(board, depth, alpha, beta) {
    // Call score of our board
    var score = board.score();

    // Break
    if (board.isFinished(depth, score)) return [null, score];

    // Column, Score
    var max = [null, -99999];

    // For all possible moves
    for (var column = 0; column < that.settings.breite; column++) {
        var new_board = board.copy(); // Create new board

        if (new_board.place(column)) {

            that.settings.iteration++; // Debug

            var next_move = that.minimizePlay(new_board, depth - 1, alpha, beta); // Recursive calling

            // Evaluate new move
            if (max[0] == null || next_move[1] > max[1]) {
                max[0] = column;
                max[1] = next_move[1];
                alpha = next_move[1];
            }

            if (alpha >= beta) return max;
        }
    }

    return max;
}

Game.prototype.minimizePlay = function(board, depth, alpha, beta) {
    var score = board.score();

    if (board.isFinished(depth, score)) return [null, score];

    // Column, score
    var min = [null, 99999];

    for (var column = 0; column < that.settings.breite; column++) {
        var new_board = board.copy();

        if (new_board.place(column)) {

            that.settings.iteration++;

            var next_move = that.maximizePlay(new_board, depth - 1, alpha, beta);

            if (min[0] == null || next_move[1] < min[1]) {
                min[0] = column;
                min[1] = next_move[1];
                beta = next_move[1];
            }

            if (alpha >= beta) return min;
        }
    }
    return min;
}

Game.prototype.switchRound = function(round) {
    // 0 Human, 1 Computer
    if (round == 0) {
        return 1;
    } else {
        return 0;
    }
}

Game.prototype.updateStatus = function() {
    // Human won
    if (that.board.score() == -that.settings.score) {
        that.settings.status = 1;
        that.markWin();
        alert("You have won!");
    }

    // Computer won
    if (that.board.score() == that.settings.score) {
        that.settings.status = 2;
        that.markWin();
        alert("You have lost!");
    }

    // Tie
    if (that.board.isFull()) {
        that.settings.status = 3;
        alert("Tie!");
    }

    var html = document.getElementById('status');
    if (that.settings.status == 0) {
        html.className = "status-running";
        html.innerHTML = "running";
    } else if (that.settings.status == 1) {
        html.className = "status-won";
        html.innerHTML = "won";
    } else if (that.settings.status == 2) {
        html.className = "status-lost";
        html.innerHTML = "lost";
    } else {
        html.className = "status-tie";
        html.innerHTML = "tie";
    }
}

Game.prototype.markWin = function() {
    document.getElementById('game_board').className = "beendet";
    for (var i = 0; i < that.settings.gewinnarray.length; i++) {
        var name = document.getElementById('game_board').rows[that.settings.gewinnarray[i][0]].cells[that.settings.gewinnarray[i][1]].className;
        document.getElementById('game_board').rows[that.settings.gewinnarray[i][0]].cells[that.settings.gewinnarray[i][1]].className = name + " win";
    }
}

Game.prototype.restartGame = function() {
    if (confirm('Game is going to be restarted.\nAre you sure?')) {
        // Dropdown value
        var difficulty = document.getElementById('difficulty');
        var depth = difficulty.options[difficulty.selectedIndex].value;
        that.settings.depth = depth;
        that.settings.status = 0;
        that.settings.round = 0;
        that.init();
        document.getElementById('ai-iterations').innerHTML = "?";
        document.getElementById('ai-time').innerHTML = "?";
        document.getElementById('ai-column').innerHTML = "Column: ?";
        document.getElementById('ai-score').innerHTML = "Score: ?";
        document.getElementById('game_board').className = "";
        that.updateStatus();

        // Re-assign hover
        $('td').hover(function() {
            $(this).parents('table').find('col:eq('+$(this).index()+')').toggleClass('hover');
        });
    }
}

/**
 * Start game
 */
function Start() {
    window.Game = new Game();

    // Hover background, now using jQuery
    $('td').hover(function() {
        $(this).parents('table').find('col:eq('+$(this).index()+')').toggleClass('hover');
    });
}

window.onload = function() {
    Start()
};

/**
 * Board object
 */
function Board(game, feld, player) {
    this.game = game
    this.feld = feld;
    this.player = player;
}

Board.prototype.isFinished = function(depth, score) {
    // depth erreicht oder Spiel entschieden
    if (depth == 0 || score == this.game.settings.score || score == -this.game.settings.score || this.isFull()) {
        return true;
    }
    return false;
}

/**
 * Place in current board
 */
Board.prototype.place = function(spalte) {
    // Falls Spalte gültig ist
    // 1. leer und 2. nicht außerhalb des Arrays
    if (this.feld[0][spalte] == null && spalte >= 0 && spalte < this.game.settings.breite) {
        // Von unten nach oben
        for (var y = this.game.settings.hoehe - 1; y >= 0; y--) {
            if (this.feld[y][spalte] == null) {
                this.feld[y][spalte] = this.player; // Setzen des jeweiligen Steins
                break; // Einmalig
            }
        }
        this.player = this.game.switchRound(this.player);
        return true;
    } else { // Ungültiger Zug
        return false;
    }
}

/**
 * Score different positions (horizontal, vertical, diagonal)
 */
Board.prototype.bewerten = function(reihe, spalte, delta_y, delta_x) {
    var human_points = 0;
    var computer_points = 0;
    this.game.settings.winning_array_human = [];
    this.game.settings.winning_array_cpu = [];

    // Determine score through amount of available chips
    for (var i = 0; i < 4; i++) {
        if (this.feld[reihe][spalte] == 0) {
            this.game.settings.winning_array_human.push([reihe, spalte]);
            human_points++; // Add for each human chip
        } else if (this.feld[reihe][spalte] == 1) {
            this.game.settings.winning_array_cpu.push([reihe, spalte]);
            computer_points++; // Add for each computer chip
        }

        // Moving through our board
        reihe += delta_y;
        spalte += delta_x;
    }

    // Marking winning/returning score
    if (human_points == 4) {
        this.game.settings.winning_array = this.game.settings.winning_array_human;
        // Computer won (100000)
        return -this.game.settings.score;
    } else if (computer_points == 4) {
        this.game.settings.winning_array = this.game.settings.winning_array_cpu;
        // Human won (-100000)
        return this.game.settings.score;
    } else {
        // Return normal points
        return computer_points;
    }
}

Board.prototype.score = function() {
    var punkte = 0;

    var vertikale_punkte = 0;
    var horizontale_punkte = 0;
    var diagonale_punkte1 = 0;
    var diagonale_punkte2 = 0;

    // Allgemein: Das Feld ist 7x6 groß (Breite x Höhe)
    // Das Feld wird im Array gespeichert, also fangen die Indizes von 0 an
    // => zB. Höhe: 0, 1, 2, 3, 4, 5

    // Vertikale Punkte
    // Für jede Spalte von der Variable 'reihe' nach unten überprüfen ob 
    // 4er Kette möglich ist
    // 
    // Mögliche Szenarien
    //  0  1  2  3  4  5  6
    // [x][ ][ ][ ][ ][ ][ ] 0
    // [x][x][ ][ ][ ][ ][ ] 1
    // [x][x][x][ ][ ][ ][ ] 2
    // [x][x][x][ ][ ][ ][ ] 3
    // [ ][x][x][ ][ ][ ][ ] 4
    // [ ][ ][x][ ][ ][ ][ ] 5
    for (var reihe = 0; reihe < this.game.settings.hoehe - 3; reihe++) {
        // Für jede Spalte überprüfen
        for (var spalte = 0; spalte < this.game.settings.breite; spalte++) {
            // Die Spalte bewerten und zu den Punkten hinzufügen
            var score = this.bewerten(reihe, spalte, 1, 0);
            if (score == this.game.settings.score) return this.game.settings.score;
            if (score == -this.game.settings.score) return -this.game.settings.score;
            vertikale_punkte += score;
        }            
    }

    // Horizontale Punkte
    // 4er Kette ab der 4. Spalte (siehe oben; Reihe mit Spalte ersetzen)
    // 
    // Mögliche Szenarien
    //  0  1  2  3  4  5  6
    // [x][x][x][x][ ][ ][ ] 0
    // [ ][x][x][x][x][ ][ ] 1
    // [ ][ ][x][x][x][x][ ] 2
    // [ ][ ][ ][x][x][x][x] 3
    // [ ][ ][ ][ ][ ][ ][ ] 4
    // [ ][ ][ ][ ][ ][ ][ ] 5
    for (var reihe = 0; reihe < this.game.settings.hoehe; reihe++) {
        for (var spalte = 0; spalte < this.game.settings.breite - 3; spalte++) { 
            var score = this.bewerten(reihe, spalte, 0, 1);   
            if (score == this.game.settings.score) return this.game.settings.score;
            if (score == -this.game.settings.score) return -this.game.settings.score;
            horizontale_punkte += score;
        } 
    }



    // Diagonale Punkte (von links unten)
    // Szenario
    //  0  1  2  3  4  5  6
    // [x][ ][ ][ ][ ][ ][ ] 0
    // [ ][x][ ][ ][ ][ ][ ] 1
    // [ ][ ][x][ ][ ][ ][ ] 2
    // [ ][ ][ ][x][ ][ ][ ] 3
    // [ ][ ][ ][ ][ ][ ][ ] 4
    // [ ][ ][ ][ ][ ][ ][ ] 5
    for (var reihe = 0; reihe < this.game.settings.hoehe - 3; reihe++) {
        for (var spalte = 0; spalte < this.game.settings.breite - 3; spalte++) {
            var score = this.bewerten(reihe, spalte, 1, 1);
            if (score == this.game.settings.score) return this.game.settings.score;
            if (score == -this.game.settings.score) return -this.game.settings.score;
            diagonale_punkte1 += score;
        }            
    }

    //  0  1  2  3  4  5  6
    // [ ][ ][ ][x][ ][ ][ ] 0
    // [ ][ ][x][ ][ ][ ][ ] 1
    // [ ][x][ ][ ][ ][ ][ ] 2
    // [x][ ][ ][ ][ ][ ][ ] 3
    // [ ][ ][ ][ ][ ][ ][ ] 4
    // [ ][ ][ ][ ][ ][ ][ ] 5
    // Diagonale Punkte (von rechts unten)
    for (var reihe = 3; reihe < this.game.settings.hoehe; reihe++) {
        for (var spalte = 0; spalte <= this.game.settings.breite - 4; spalte++) {
            var score = this.bewerten(reihe, spalte, -1, +1);
            if (score == this.game.settings.score) return this.game.settings.score;
            if (score == -this.game.settings.score) return -this.game.settings.score;
            diagonale_punkte2 += score;
        }

    }

    punkte = horizontale_punkte + vertikale_punkte + diagonale_punkte2 + diagonale_punkte1;
    return punkte;
}

/**
 * Determine if board is full
 */
Board.prototype.isFull = function() {
    for (var i = 0; i < this.game.settings.breite; i++) {
        if (this.feld[0][i] == null) {
            return false;
        }
    }
    return true;
}

/**
 * Copy board
 */
Board.prototype.copy = function() {
    var new_board = new Array();
    for (var i = 0; i < this.feld.length; i++) {
        new_board.push(this.feld[i].slice());
    }
    return new Board(this.game, new_board, this.player);
}

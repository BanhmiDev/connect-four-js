/**
 * Brett Objekt
 */
function Brett(feld, spieler) {
    this.feld = feld;
    this.spieler = spieler;
}

/**
 * Ob Brett Spiel entschieden ist
 */
Brett.prototype.istEnde = function(tiefe, bewertung) {
    // Tiefe erreicht oder Spiel entschieden
    if (tiefe == 0 || bewertung == viergewinnt.bewertung || bewertung == -viergewinnt.bewertung || this.istVoll()) {
        return true;
    }
    return false;
}

/**
 * In das jeweilige Brett Objekt setzen
 */
Brett.prototype.steinSetzen = function(spalte) {
    // Falls Spalte gültig ist
    // 1. leer und 2. nicht außerhalb des Arrays
    if (this.feld[0][spalte] == null && spalte >= 0 && spalte < viergewinnt.breite) {
        // Von unten nach oben
        for (var y = viergewinnt.hoehe - 1; y >= 0; y--) {
            if (this.feld[y][spalte] == null) {
                this.feld[y][spalte] = this.spieler; // Setzen des jeweiligen Steins
                break; // Einmalig
            }
        }
        this.spieler = rundeWechseln(this.spieler);
        return true;
    } else { // Ungültiger Zug
        return false;
    }
}

/**
 * Bewerten von jeweiligen Positionen
 */
Brett.prototype.bewerten = function(reihe, spalte, bewegung_y, bewegung_x) {
    // y und x als Veränderungen (Bewegung im Feld)
    var spieler_punkte = 0;
    var computer_punkte = 0;
    viergewinnt.gewinnarray_spieler = [];
    viergewinnt.gewinnarray_cpu = [];

    // Punkte vergeben durch mögliche 4er Ketten
    for (var i = 0; i < 4; i++) {
        if (this.feld[reihe][spalte] == 0) {
            viergewinnt.gewinnarray_spieler.push([reihe, spalte]);
            spieler_punkte++; // Falls Spieler Stein
        } else if (this.feld[reihe][spalte] == 1) {
            viergewinnt.gewinnarray_cpu.push([reihe, spalte]);
            computer_punkte++; // Falls Computer Stein
        }
        // Bewegung durch gegebene Parameter; macht diagonale Bewegungen etc. möglich
        reihe += bewegung_y;
        spalte += bewegung_x;
    }

    // tmp => temporäres Speichern von Reihe/Spalte
    // welches letztendlich in die Variable "gewinnarray" gespeichert wird (Gewinnmarkierung)
    if (spieler_punkte == 4) {
        viergewinnt.gewinnarray = viergewinnt.gewinnarray_spieler;
        // Computer hat 4er Kette viergewinnt.bewertung (100000)
        return -viergewinnt.bewertung;
    } else if (computer_punkte == 4) {
        viergewinnt.gewinnarray = viergewinnt.gewinnarray_cpu;
        // Mensch hat 4er Kette -viergewinnt.bewertung (-100000)
        return viergewinnt.bewertung;
    } else {
        // Sonst 'normal' die errechneten Punkte zurückgeben
        // Differenz von computer punkte und spieler punkte
        // da abgezogen von spielerpunkte (=> heißt schlechter)
        return computer_punkte;
    }
}

Brett.prototype.bewertung = function() {
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
    for (var reihe = 0; reihe < viergewinnt.hoehe - 3; reihe++) {
        // Für jede Spalte überprüfen
        for (var spalte = 0; spalte < viergewinnt.breite; spalte++) {
            // Die Spalte bewerten und zu den Punkten hinzufügen
            var bewertung = this.bewerten(reihe, spalte, 1, 0);
            if (bewertung == viergewinnt.bewertung) return viergewinnt.bewertung;
            if (bewertung == -viergewinnt.bewertung) return -viergewinnt.bewertung;
            vertikale_punkte += bewertung;
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
    for (var reihe = 0; reihe < viergewinnt.hoehe; reihe++) {
        for (var spalte = 0; spalte < viergewinnt.breite - 3; spalte++) { 
            var bewertung = this.bewerten(reihe, spalte, 0, 1);   
            if (bewertung == viergewinnt.bewertung) return viergewinnt.bewertung;
            if (bewertung == -viergewinnt.bewertung) return -viergewinnt.bewertung;
            horizontale_punkte += bewertung;
        } 
    }



    // Diagonale Punkte (von links unten)
    // 
    // Szenario
    //  0  1  2  3  4  5  6
    // [x][ ][ ][ ][ ][ ][ ] 0
    // [ ][x][ ][ ][ ][ ][ ] 1
    // [ ][ ][x][ ][ ][ ][ ] 2
    // [ ][ ][ ][x][ ][ ][ ] 3
    // [ ][ ][ ][ ][ ][ ][ ] 4
    // [ ][ ][ ][ ][ ][ ][ ] 5
    for (var reihe = 0; reihe < viergewinnt.hoehe - 3; reihe++) {
        for (var spalte = 0; spalte < viergewinnt.breite - 3; spalte++) {
            var bewertung = this.bewerten(reihe, spalte, 1, 1);
            if (bewertung == viergewinnt.bewertung) return viergewinnt.bewertung;
            if (bewertung == -viergewinnt.bewertung) return -viergewinnt.bewertung;
            diagonale_punkte1 += bewertung;
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
    for (var reihe = 3; reihe < viergewinnt.hoehe; reihe++) {
        for (var spalte = 0; spalte <= viergewinnt.breite - 4; spalte++) {
            var bewertung = this.bewerten(reihe, spalte, -1, +1);
            if (bewertung == viergewinnt.bewertung) return viergewinnt.bewertung;
            if (bewertung == -viergewinnt.bewertung) return -viergewinnt.bewertung;
            diagonale_punkte2 += bewertung;
        }

    }

    punkte = horizontale_punkte + vertikale_punkte + diagonale_punkte2 + diagonale_punkte1;
    return punkte;
}

/**
 * Ob das Brett voll ist
 */
Brett.prototype.istVoll = function() {
    for (var i = 0; i < viergewinnt.breite; i++) {
        if (this.feld[0][i] == null) { // Falls eine freie Zelle oben
            return false;
        }
    }
    return true;
}

/**
 * Brett kopieren
 */
Brett.prototype.kopieren = function() {
    var neues_brett = new Array();
    for (var i = 0; i < this.feld.length; i++) { // Kopieren der Werte
        neues_brett.push(this.feld[i].slice());
    }
    return new Brett(neues_brett, this.spieler);
}
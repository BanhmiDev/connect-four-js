// Last update: 10/01/2015
// TODO: TRANSLATE

// Minimax Implementation
// Spieldaten/Einstellungen
viergewinnt = {
    'hoehe': 6,
    'breite': 7,
    'status': 0, // 0: läuft, 1: gewonnen, 2: verloren, 3: unentschieden
    'tiefe': 4, // Suchtiefe
    'bewertung': 100000, // Gewinn/Niederlage Bewertung
    'runde': 0, // 0: Mensch, 1: Computer
    'gewinnarray_tmp': [], // temporäres Speichern einer Gewinnstellung
    'gewinnarray_tmp2': [],
    'gewinnarray': [], // Gewinnstellung
    'iteration': 0
}

/**
 * 1-Round
 */
function spielzug(e) {
    var element = e.target || window.event.srcElement;

    // Check if not in animation and start with human
    if (!($('#coin').is(":animated"))) {
        if (viergewinnt.runde == 0) {
            steinSetzen(element.cellIndex);
        }
    }
}

/**
 * Visual and backend inserting
 * TODO: minify code block
 */
function steinSetzen(spalte) {
    // Falls Spiel noch nicht entschieden
    if (spiel.bewertung() != viergewinnt.bewertung && spiel.bewertung() != -viergewinnt.bewertung && !spiel.istVoll()) {
        // Von unten nach oben einsetzen
        for (var y = spielbrett.length - 1; y >= 0; y--) {
            if (document.getElementById('spielfeld').rows[y].cells[spalte].className == 'leer') {
                if (viergewinnt.runde == 1) {
                    var coin_x = spalte * 51;
                    var coin_y = y * 51;
                    $('#coin').attr('class', 'cpu-coin').css({'left': coin_x}).fadeIn('fast').animate({'top': coin_y + 'px'}, 700, 'easeOutBounce', function() {
                        document.getElementById('spielfeld').rows[y].cells[spalte].className = 'coin cpu-coin';
                        $('#coin').hide().css({'top': '0px'});
                        if (!spiel.steinSetzen(spalte)) { // Im Hauptarray einfügen falls gültig
                            return alert("Ungültiger Zug!");
                        }
                        // Runde wechseln
                        viergewinnt.runde = rundeWechseln(viergewinnt.runde);
                        // Spielstatus checken
                        updateStatus();
                    });

                } else {
                    var coin_x = spalte * 51;
                    var coin_y = y * 51;
                    $('#coin').attr('class', 'spieler-coin').css({'left': coin_x}).fadeIn('fast').animate({'top': coin_y + 'px'}, 700, 'easeOutBounce', function() {
                        document.getElementById('spielfeld').rows[y].cells[spalte].className = 'coin spieler-coin';
                        $('#coin').hide().css({'top': '0px'});
                        computerZug();
                        if (!spiel.steinSetzen(spalte)) { // Im Hauptarray einfügen falls gültig
                            return alert("Ungültiger Zug!");
                        }
                        // Runde wechseln
                        viergewinnt.runde = rundeWechseln(viergewinnt.runde);
                        // Spielstatus checken
                        updateStatus();
                    });
                }
                break; // Einmalig
            }
        }
    }
}

/**
 * Generieren des besten Zugs für die KI
 */
function computerZug() {
    // Falls Spiel noch nicht entschieden (Entweder Feld voll, Computer oder Mensch gewonnen)
    if (spiel.bewertung() != viergewinnt.bewertung && spiel.bewertung() != -viergewinnt.bewertung && !spiel.istVoll()) {
        viergewinnt.iteration = 0; // Statistik
        document.getElementById('laden').style.display = "block"; // Nachricht anzeigen, dass Computer am Zug ist

        // Optionale Verzögerung für Nachricht
        setTimeout(function() {
            // Zusätzlich die Zeit messen und ausgeben
            var startzeit = new Date().getTime();

            // Aufrufen des Algorithmus
            var ki_zug = maxZug(spiel, viergewinnt.tiefe);

            var laufzeit = new Date().getTime() - startzeit;
            document.getElementById('zeit').innerHTML = laufzeit.toFixed(2) + 'ms';

            // Durch Algorithmus bekommen des besten Zugs und einsetzen
            steinSetzen(ki_zug[0]);

            // Weitere Statistik anzeigen
            document.getElementById('zug').innerHTML = 'Spalte: ' + parseInt(ki_zug[0] + 1) + '<br/>Bewertung: ' + ki_zug[1];
            document.getElementById('wurf').innerHTML = viergewinnt.iteration;

            document.getElementById('laden').style.display = "none"; // Nachricht entfernen
        }, 100);
    }
}

/**
 * Hauptfeld von Einstellungen generieren sowie grafisch anzeigen lassen
 */
function spielfeldAnzeigen() {
    // Zwei-dimensionales Array erstellen
    spielbrett = new Array(viergewinnt.hoehe);
    for (var i = 0; i < spielbrett.length; i++) {
        spielbrett[i] = new Array(viergewinnt.breite);

        for (var j = 0; j < spielbrett[i].length; j++) {
            spielbrett[i][j] = null;
        }
    }

    // Objekt erstellen (zum späteren kopieren/einsetzen)
    // Beginnt mit Runde für Menschen
    spiel = new Brett(spielbrett, 0);

    // Spielfeld grafisch generieren
    var spielfeld = "<col/><col/><col/><col/><col/><col/><col/>";
    for (var i = 0; i < viergewinnt.hoehe; i++) {
        spielfeld += "<tr>";
        for (var j = 0; j < viergewinnt.breite; j++) {
            spielfeld += "<td class='leer'></td>";
        }
        spielfeld += "</tr>";
    }

    document.getElementById('spielfeld').innerHTML = spielfeld;

    // Listener für Aktionen
    var td = document.getElementById('spielfeld').getElementsByTagName("td");

    // Internet Explorer Unterstützung
    for (var i = 0; i < td.length; i++) {
        if (td[i].addEventListener) {
            td[i].addEventListener('click', spielzug, false);
        } else if (td[i].attachEvent) {
            td[i].attachEvent('click', spielzug)
        }
    }
}

/**
 * ALGORITHMUS
 * Hauptfunktion für die KI (Minimax Prinzip)
 */
function maxZug(brett, tiefe) {
    // Bewertung für das Spielfeld aufrufen
    var bewertung = brett.bewertung();

    // Abbruchfunktion (Übergibt ebenfalls die Tiefe)
    if (brett.istEnde(tiefe, bewertung)) return [null, bewertung];

    // Spalte, Bewertung
    // Bewertung mit möglichst kleiner Zahl
    var max = [null, -99999];

    // Für alle möglichen Züge (Spalten)
    for (var spalte = 0; spalte < viergewinnt.breite; spalte++) {
        var neues_brett = brett.kopieren(); // Neues Brett erstellen (somit ist das Entfernen von generierten Zügen nicht nötig)

        if (neues_brett.steinSetzen(spalte)) { // Block wird ausgeführt falls die Spalte gültig ist

            viergewinnt.iteration++; // Statistik

            var naechster_zug = minZug(neues_brett, tiefe - 1); // Rekursiv aufrufen und Tiefe runterzählen

            // Neuen Zug evaluieren, falls besser oder noch in der Anfangsphase (null)
            if (max[0] == null || naechster_zug[1] > max[1]) {
                // Falls neuer Zug größere Bewertung hat, dann setzen
                max[0] = spalte;
                max[1] = naechster_zug[1];
            }
        }
    }

    return max; // Rückgabe des max-Zuges
}

function minZug(brett, tiefe) {
    var bewertung = brett.bewertung();

    // Abbruchfunktion
    if (brett.istEnde(tiefe, bewertung)) return [null, bewertung];

    // Spalte, Bewertung
    // Bewertung mit möglichst großer Zahl
    var min = [null, 99999];

    // Für alle möglichen Züge (Spalten)
    for (var spalte = 0; spalte < viergewinnt.breite; spalte++) {
        var neues_brett = brett.kopieren(); // Neues Brett erstellen (somit ist das Entfernen von generierten Zügen nicht nötig)

        if (neues_brett.steinSetzen(spalte)) { // Block wird ausgeführt falls die Spalte gültig ist

            viergewinnt.iteration++; // Statistik

            var naechster_zug = maxZug(neues_brett, tiefe - 1); // Rekursiv aufrufen

            // Neuen Zug evaluieren, falls besser oder noch in der Anfangsphase (null)
            if (min[0] == null || naechster_zug[1] < min[1]) {
                min[0] = spalte;
                min[1] = naechster_zug[1];
            }

        }
    }
    return min;
}

/**
 * Diverse Hilfsfunktionen
 * rundeWechseln() gibt neue Runde zurück
 * updateStatus() ändert Spielstatus (+visuell)
 * spielNeustarten() Neustart des Spiels
 */
function rundeWechseln(runde) {
    // 0 Mensch, 1 Computer
    if (runde == 0) {
        return 1;
    } else {
        return 0;
    }
}

function updateStatus() {
    if (spiel.istVoll()) {
        viergewinnt.status = 3;
        alert("Spiel unentschieden!");
    } // Als erstes überprüfen, da man auch im vollen Feld gewinnen kann

    // Mensch
    if (spiel.bewertung() == -viergewinnt.bewertung) {
        viergewinnt.status = 1;
        gewinnMarkieren();
        alert("Du hast gewonnen!");
    }

    // Computer
    if (spiel.bewertung() == viergewinnt.bewertung) {
        viergewinnt.status = 2;
        gewinnMarkieren();
        alert("Computer hat gewonnen!");
    }

    var html = document.getElementById('status');
    if (viergewinnt.status == 0) {
        html.className = "status-aktiv";
        html.innerHTML = "läuft";
    } else if (viergewinnt.status == 1) {
        html.className = "status-gewonnen";
        html.innerHTML = "gewonnen";
    } else if (viergewinnt.status == 2) {
        html.className = "status-verloren";
        html.innerHTML = "verloren";
    } else {
        html.className = "status-unentschieden";
        html.innerHTML = "unentschieden";
    }
}

// 4er-Kette markieren
function gewinnMarkieren() {
    document.getElementById('spielfeld').className = "beendet";
    for (var i = 0; i < viergewinnt.gewinnarray.length; i++) {
        var name = document.getElementById('spielfeld').rows[viergewinnt.gewinnarray[i][0]].cells[viergewinnt.gewinnarray[i][1]].className;
        document.getElementById('spielfeld').rows[viergewinnt.gewinnarray[i][0]].cells[viergewinnt.gewinnarray[i][1]].className = name + " win";
    }
}

function spielNeustarten() {
    if (confirm('Das Spiel wird neugestartet.\nBis du dir sicher?')) {
        // Schwierigkeit aus Dropdown holen
        var schwierigkeit = document.getElementById('schwierigkeit');
        var tiefe = schwierigkeit.options[schwierigkeit.selectedIndex].value;
        viergewinnt.tiefe = tiefe;
        viergewinnt.status = 0;
        viergewinnt.runde = 0;
        spielfeldAnzeigen();
        document.getElementById('wurf').innerHTML = "?";
        document.getElementById('zeit').innerHTML = "?";
        document.getElementById('zug').innerHTML = "Spalte: ?<br/>Bewertung: ?";
        document.getElementById('spielfeld').className = "";
        updateStatus();
    }
}

window.onload = function() {
    // Wird aufgerufen wenn Seite fertig geladen hat
    spielfeldAnzeigen();

    // Hover background, now using jQuery
    $('td').hover(function() {
        $(this).parents('table').find('col:eq('+$(this).index()+')').toggleClass('hover');
    });
};
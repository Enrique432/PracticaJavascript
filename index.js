// Battleship .... y a rezar que funcione


const VACIO_VALUE        = ' ';
const AGUA_VALUE         = '\u{1F4A7}'; // emoticono del agua
const LANCHA_VALUE       = 'L';
const CRUCERO_VALUE      = 'C';
const SUBMARINO_VALUE    = 'S';
const BUQUE_VALUE        = 'B';
const PORTAAVIONES_VALUE = 'P';
const EXPLOSION_VALUE    = '\u{1F4A5}'; // emoticono de la explosion

const LANCHA_SIZE       = 1;  // 1 casilla
const CRUCERO_SIZE      = 2;  // 2 casillas
const SUBMARINO_SIZE    = 3;  // 3 casillas
const BUQUE_SIZE        = 4;  // 4 casillas
const PORTAAVIONES_SIZE = 5;  // 5 casillas

const PORTAAVIONES  = 1;
const BUQUES        = 1;
const SUBMARINOS    = 2;
const CRUCEROS      = 3;
const LANCHAS       = 3;

const HORIZONTAL = "horizontal";
const VERTICAL   = "vertical";

const OK      = "ok"
const TOCADO  = "tocado";
const HUNDIDO = "hundido";

const BOARD_SIZE = 10;
const MAX_ROUNDS = 100;

const MAX_POSITIONED_CELLS = (PORTAAVIONES * PORTAAVIONES_SIZE)
                           + (BUQUES * BUQUE_SIZE)
                           + (SUBMARINOS * SUBMARINO_SIZE)
                           + (CRUCEROS * CRUCERO_SIZE)
                           + (LANCHAS * LANCHA_SIZE)
                           ;

const player1 = createPlayer();
const player2 = createPlayer();


function createShip(name, coords, state=OK) {
    return {
        name,
        state,
        coords,
        impactCounter: 0,
    }
}

function createPlayer() {
    return {
        name: "",
        ownBoard: null,
        enemyBoard: null,
        ships: [],
        shotCounter: 0,
        impactCounter: 0,
        winner: false,
    }
}

function getLetter(number) { // Para que me de el valor del codigo del valor A --> Letras a Numero y viceversa, para el uso de las filas con letra

    const firstLetter = "A".charCodeAt(0);
    return String.fromCharCode(firstLetter + number);
}

function getRandomNumber() {

    return Math.floor(Math.random() * BOARD_SIZE);
}

function getRandomDirection() {

    const number = getRandomNumber();
    return (number % 2 == 0) ? HORIZONTAL : VERTICAL;
}

function isHorizontalDirection(direction) {

    return (direction === HORIZONTAL);
}

function isVerticalDirection(direction) {

    return (direction === VERTICAL);
}

function createBoard() {

    let letters = [];
    
    // letras segun el tamaño del tablero
    for (let i = 0; i < BOARD_SIZE; i++) {

        letters[i] = getLetter(i);
    }

    const board = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
        // las letras en las filas
        board[ letters[row] ] = [];

        for (let column=0; column<BOARD_SIZE; column++) {
            // los numeros en las columnas
            board[ letters[row] ][ column ] = VACIO_VALUE;
        }
    }
    
    return board;
}

function getCellValue(board, cell) { // es para no estar escribiendo "BOARD [ROW] [COLS]" todo el tiempo

    return board[ getLetter(cell.row) ][ cell.column ];
}

function setCellValue(board, cell, value) { // es para no estar escribiendo "BOARD [ROW] [COLS]" todo el tiempo

    board[ getLetter(cell.row) ][ cell.column ] = value;
}

function initShip(name, size) {

    const coords    = [];
    const direction = getRandomDirection();
    let row         = getRandomNumber();
    let column      = getRandomNumber();

    switch (direction) {

        case HORIZONTAL:
        {
            if (row + size > BOARD_SIZE)
                row = (BOARD_SIZE-size);

            for (let i = 0; i < size; i++)
                coords[i] = { row: row+i, column }
         
            break;
        }

        case VERTICAL:
        {
            if (column + size > BOARD_SIZE)
                column = (BOARD_SIZE-size);

            for (let i = 0; i < size; i++)
                coords[i] = { row, column: column+i }
        
            break;
        }
    }

    return createShip(name, coords);
}

function placeShip(player, name, size, value) {

    const board = player.ownBoard;
    let place = true;
    let ship; 

    do
    {
        place = true;
        ship  = initShip(name, size);

        for (let i = 0; i < ship.coords.length; i++) {

            const boardValue = getCellValue(board, ship.coords[i]);

            if (boardValue !== VACIO_VALUE) {

                place = false;
                break;
            }
        }
    }
    while (!place);

    // añadir las coordenadas de la nave al ownBoard del jugador
    for (let i = 0; i < ship.coords.length; i++) {

        setCellValue(board, ship.coords[i], value);
    }

    // añadir la nave al jugador
    player.ships.push( ship );
}

function updateShipState(player, shot) {  // para saber si el barco esta tocado o hundido y pasarlo por pantalla

    for (let i = 0; i < player.ships.length; i++) { 

        const ship = player.ships[i];

        for (let j = 0; j < ship.coords.length; j++) {

            const coords = ship.coords[j];

            // comprobar si el impacto coincide con alguna coordenada de la nave
            if (shot.row === coords.row && shot.column === coords.column) {
                // tocado
                ship.state = TOCADO;
                ship.impactCounter = ship.impactCounter + 1;

                // hundido: el contador de impactos coincide con el numero de coordenadas de la nave
                if (ship.impactCounter === ship.coords.length) {

                    ship.state = HUNDIDO;
                }

                return ship.state;
            }
        }
    }

    return null;
}

function getRandomShot() {

    const row    = getRandomNumber();
    const column = getRandomNumber();
    return { row, column };
}

function getSmartShot(player) { // esta funcion busca de manera aleatoria una celda colindante del ultimo impacto

    const enemyBoard = player.enemyBoard; 
    const vertical   = isVerticalDirection( getRandomDirection() );
    const up         = (getRandomNumber() % 2 === 0);
    const left       = (getRandomNumber() % 2 === 0);

    let row = player.lastShotHit.row;
    let column = player.lastShotHit.column;

    if (row === 0 && column === 0) {
        // esquina superior izquierda

        if (vertical)
            row++; // siquiente fila
        else    
            column++; // siquiente columna
    }
    else
    if (row === 0 && column === (BOARD_SIZE-1)) {
        // esquina superior derecha

        if (vertical)
            row++; // siquiente fila
        else    
            column--; // columna anterior
    }
    else
    if (row === (BOARD_SIZE-1) && column === 0) {
        // esquina inferior izquierda

        if (vertical)
            row--; // fila anterior
        else    
            column++; // siguiente columna
    }
    else
    if (row === (BOARD_SIZE-1) && column === (BOARD_SIZE-1)) {
        // esquina inferior derecha

        if (vertical)
            row--; // fila anterior
        else    
            column--; // columna anterior
    }
    else
    if (row === 0 || row === (BOARD_SIZE-1)) {
        // fila superior || fila inferior

        if (vertical) {

            if (row === 0) { // fila superior
            
                row++; // siquiente fila
            }
            else { // fila inferior
            
                row--; // fila anterior
            }
        }
        else { // horizontal
        
            if (left) {
                // izquierda
                column--; // columna anterior
            }
            else {
                // derecha
                column++; // siguiente columna
            }
        }
    }
    else
    if (column === 0 || column === (BOARD_SIZE-1)) {
        // primera columna || ultima columna

        if (vertical) {

            if (up) {
                // arriba
                row--; // fila anterior
            }
            else {
                // abajo
                row++; // siquiente fila
            }
        }
        else { // horizontal
        
            if (column === 0) { // primera columna
            
                column++; // siquiente columna
            }
            else { // ultima columna
            
                column--; // columna anterior
            }
        }
    }
    else {
        // celda interior

        if (vertical) {

            if (up) {
                // arriba
                row--; // fila anterior
            }
            else {
                // abajo
                row++; // siquiente fila
            }
        }
        else { // horizontal
        
            if (left) {
                // izquierda
                column--; // columna anterior
            }
            else {
                // derecha
                column++; // siguiente columna
            }
        }
    }

    return { row, column };
}

function showTitle() {

    console.log();
    console.log("===================================================");
    console.log("========= The Battleship simulator starts =========");
    console.log("===================================================");
    console.log();
}

function showPlay() {

    console.log();
    console.log("===================================");
    console.log("========= The game starts =========");
    console.log("===================================");
    console.log();
}

function showBoards(player, all) {

    console.log("Own board:");
    console.table(player.ownBoard);    

    if (all) {

        console.log("Enemy board:");
        console.table(player.enemyBoard);    
    }
}

function showPlayers() {

    console.log(player1.name);
    showBoards(player1, false);  
    console.log();

    console.log(player2.name);
    showBoards(player2, false);    
    console.log();
}

function getShot(shot) {

    return getLetter(shot.row) + shot.column;
}

function showRound(player, round, shot, value, state) {

    let strState = "";

    switch (state) {

        case TOCADO:
        {
            strState = " and Tocado!";
            break;
        }

        case HUNDIDO:
        {
            strState = " and Tocado and Hundido!";
            break;    
        }
    }

    console.log(`Round ${round} for ${player.name}`);
    console.log("==============================");
    console.log(`Shot #${player.shotCounter} pointing to ${getShot(shot)}: ${value}${strState}`);
    showBoards(player, true);
    console.log();
}

function showWinner(player) {

    console.log("And the winner is.....");
    console.log("============================");
    console.log(`=== ${player.name}`);
    console.log("============================");
    console.log("And the final boards are:");
    console.log();
    showPlayers();
}


function initPlayer(player, name) {

    player.name = name;
    player.ownBoard = createBoard();
    player.enemyBoard = createBoard();
    
    for (let i = 0; i < PORTAAVIONES; i++)
        placeShip(player, "portaaviones", PORTAAVIONES_SIZE, PORTAAVIONES_VALUE);
    
    for (let i = 0; i < BUQUES; i++)
        placeShip(player, "buque", BUQUE_SIZE, BUQUE_VALUE);
    
    for (let i = 0; i < SUBMARINOS; i++)
        placeShip(player, "submarino", SUBMARINO_SIZE, SUBMARINO_VALUE);
    
    for (let i = 0; i < CRUCEROS; i++)
        placeShip(player, "crucero", CRUCERO_SIZE, CRUCERO_VALUE);
    
    for (let i = 0; i < LANCHAS; i++)
        placeShip(player, "lancha", LANCHA_SIZE, LANCHA_VALUE);
}

function init() {

    initPlayer(player1, "Player 1");
    initPlayer(player2, "Player 2");
}

function isWinner(player) { // calculo los maximos impactos que puede tener un tablero, en este caso 24

    return (player.impactCounter === MAX_POSITIONED_CELLS);
}

function playRound(round, currentPlayer, otherPlayer) {

    let valid = false;
    let shot;
    let value;
    let state = null;

    currentPlayer.shotCounter = currentPlayer.shotCounter + 1;

    while (!valid) 
    {
        if (currentPlayer.lastShotHit != null) {
            // buscar el mejor disparo a partir del ultimo acertado
            shot = getSmartShot(currentPlayer);     

            // borrar el ultimo disparo acertado
            currentPlayer.lastShotHit = null;
        }
        else {
            // disparo aleatorio
            shot = getRandomShot();
        }

        // no repetir disparo
        if (getCellValue(currentPlayer.enemyBoard, shot) === VACIO_VALUE)
            valid = true;
    }

    value = getCellValue(otherPlayer.ownBoard, shot);

    if (value === VACIO_VALUE) {

        value = AGUA_VALUE;
    }
    else {

        value = EXPLOSION_VALUE;

        // numero de impactos para comprobar si ha ganado
        currentPlayer.impactCounter = currentPlayer.impactCounter + 1;

        // guardar el ultimo disparo acertado
        currentPlayer.lastShotHit = shot;

        // actualizar el estado de la nave impactada
        state = updateShipState(otherPlayer, shot);
    }

    setCellValue(currentPlayer.enemyBoard, shot, value);
    setCellValue(otherPlayer.ownBoard, shot, value);

    showRound(currentPlayer, round, shot, value, state);

    currentPlayer.winner = isWinner(currentPlayer);

    return value;
}


function play() {

    let value;

    for (let round = 1; round <= MAX_ROUNDS; round++) {

        // player 1
        do {

            value = playRound(round, player1, player2);
        }
        while (value === EXPLOSION_VALUE && !player1.winner);

        if (player1.winner) {

            showWinner(player1);
            break;
        }
        
        // player 2
        do {

            value = playRound(round, player2, player1);
        }
        while (value === EXPLOSION_VALUE && !player2.winner);

        if (player2.winner) {

            showWinner(player2);
            break;
        }
    }
}


init();
showTitle();
showPlayers();
play();
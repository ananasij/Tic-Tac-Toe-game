function init() {
    var tictactoe = new Tictactoe();

    $('.js-cell').on('click', function(e) {
        var cellIndex = $(e.target).data('index');
        tictactoe.saveInput(cellIndex);
    });
}

function renderCell(cellIndex, value) {
    var cellClass = '.js-cell-' + cellIndex;
    var $mark = $(cellClass).find('.js-mark');
    $mark.text(value);
}

$(document).ready(init);

// GAME LOGIC

var PLAYER_X = 'PLAYER_X';
var PLAYER_0 = 'PLAYER_0';
var FIELD_SIZE = 9;

function Tictactoe() {
    this.currentPlayer = PLAYER_X;
    this.field = [];
    this.init();
    console.log(this.field);
}

Tictactoe.prototype.init = function() {
    for (var i = 0; i < FIELD_SIZE; i++) {
        this.field[i] = null;
    }
};

Tictactoe.prototype.saveInput = function(cellIndex) {
    var mark;
    if (this.currentPlayer === PLAYER_X) {
        mark = 'X';
    } else {
        mark = 'O';
    }
    if (cellIndex && !this.field[cellIndex - 1]) {
        this.field[cellIndex - 1] = mark;
        renderCell(cellIndex, mark);
        this.processInput();
    }
};

Tictactoe.prototype.processInput = function() {
    console.log(this.field);
    // todo: Check if anyone won. If so reset the game
    this.switchPlayer();
    if (this.currentPlayer === PLAYER_0) {
        this.computerTurn();
    }
};

Tictactoe.prototype.switchPlayer = function() {
    if (this.currentPlayer === PLAYER_X) {
        this.currentPlayer = PLAYER_0;
    } else {
        this.currentPlayer = PLAYER_X;
    }
};

Tictactoe.prototype.computerTurn = function() {
    for (var i = 0; i < FIELD_SIZE; i++) {
        if (this.field[i] === null) {
            this.saveInput(i + 1);
            return;
        }
    }
};

// GAME LOGIC

var PLAYER_X = 'PLAYER_X';
var PLAYER_0 = 'PLAYER_0';
var RESULT_WIN = 'RESULT_WIN';
var RESULT_DRAW = 'RESULT_DRAW';
var STATE_PLAY = 'STATE_PLAY';
var STATE_LOCKED = 'STATE_LOCKED';
var FIELD_SIZE = 9;
var WINNING_COMBINATIONS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
    [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

function Tictactoe(playerSelection) {
    this.callbacks = {
        markSave: null,
        scoreUpdate: null
    };
    this.field = [];
    this.scoreX = 0;
    this.score0 = 0;
    this.player = playerSelection;
    this.computer = this.getComputerRole();
    this.currentPlayer = this.getFirstPlayer();
}

Tictactoe.prototype.startGame = function() {
    this.initField();
    this.state = STATE_PLAY;
    if (this.currentPlayer === this.computer) {
        this.computerTurn();
    }
};

Tictactoe.prototype.initField = function() {
    for (var i = 0; i < FIELD_SIZE; i++) {
        this.field[i] = null;
    }
};

Tictactoe.prototype.saveInput = function(cellIndex) {
    if (this.state === STATE_PLAY && cellIndex && !this.field[cellIndex - 1]) {
        this.field[cellIndex - 1] = this.getCurrentMark();
        this.trigger('markSave', cellIndex);
        this.processInput();
    }
};

Tictactoe.prototype.processInput = function() {
    if (this.checkWin()) {
        this.endGame(RESULT_WIN);
    } else if ((this.getPlayerMarks('X').length + this.getPlayerMarks('0').length) === FIELD_SIZE) {
        this.switchPlayer();
        this.endGame(RESULT_DRAW);
    } else {
        this.switchPlayer();
        if (this.currentPlayer === this.computer) {
            this.computerTurn();
        }
    }
};

Tictactoe.prototype.checkWin = function() {
    var currentMarks;
    var win;
    currentMarks = this.getPlayerMarks(this.getCurrentMark());

    for (var i = 0; i < WINNING_COMBINATIONS.length; i++) {
        for (var j = 0; j < 3; j++) {
            if (!currentMarks.includes(WINNING_COMBINATIONS[i][j])) {
                win = false;
                break;
            }
            win = WINNING_COMBINATIONS[i];
        }
        if (win) {
            break;
        }
    }
    return win;
};

Tictactoe.prototype.switchPlayer = function() {
    if (this.currentPlayer === PLAYER_X) {
        this.currentPlayer = PLAYER_0;
    } else {
        this.currentPlayer = PLAYER_X;
    }
};

Tictactoe.prototype.endGame = function(result) {
    this.state = STATE_LOCKED;
    if (result === RESULT_WIN) {
        this.updateScore();
    }
    this.trigger('scoreUpdate', result);
};

Tictactoe.prototype.updateScore = function() {
    if (this.currentPlayer === PLAYER_X) {
        this.scoreX += 1;
    } else {
        this.score0 += 1;
    }
};

Tictactoe.prototype.getCurrentMark = function() {
    if (this.currentPlayer === PLAYER_X) {
        return 'X';
    }
    return '0';
};

Tictactoe.prototype.getOpponentMark = function() {
    if (this.currentPlayer === PLAYER_X) {
        return '0';
    }
    return 'X';
};

Tictactoe.prototype.getPlayerMarks = function(currentMark) {
    var marks = [];
    for (var i = 0; i < this.field.length; i++) {
        if (this.field[i] === currentMark) {
            marks.push(i);
        }
    }
    return marks;
};

Tictactoe.prototype.getComputerRole = function() {
    if (this.player === PLAYER_X) {
        return PLAYER_0;
    }
    return PLAYER_X;
};

Tictactoe.prototype.getFirstPlayer = function() {
    if (this.player === PLAYER_X) {
        return this.player;
    }
    return this.computer;
};

Tictactoe.prototype.on = function(eventName, callback) {
    this.callbacks[eventName] = callback;
};

Tictactoe.prototype.trigger = function(eventName, value) {
    if (this.callbacks[eventName]) {
        this.callbacks[eventName](value);
    }
};

// GAME LOGIC: COMPUTER
Tictactoe.prototype.computerTurn = function() {
    var dangerCell = this.getDangerCells();
    var winCell = this.getWinCells(this.getCurrentMark());
    if (winCell !== null) {
        this.saveInput(winCell + 1);
    } else if (dangerCell !== null) {
        this.saveInput(dangerCell + 1);
    } else {
        this.safeTurn();
    }
};

Tictactoe.prototype.safeTurn = function() {
    if (this.getPlayerMarks(this.getCurrentMark()).length === 0) {
        this.saveInput(this.getFirstTurnCell() + 1);
    } else {
        this.saveInput(this.getRandomEmptyCell() + 1);
    }
};
Tictactoe.prototype.getDangerCells = function() {
    return this.getWinCells(this.getOpponentMark());
};

Tictactoe.prototype.getWinCells = function(currentMark) {
    var winCell = null;
    var wins = [];
    var currentMarks = this.getPlayerMarks(currentMark);
    for (var i = 0; i < WINNING_COMBINATIONS.length; i++) {
        wins = WINNING_COMBINATIONS[i];

        if (currentMarks.includes(wins[0]) && currentMarks.includes(wins[1])) {
            winCell = wins[2];
        } else if (currentMarks.includes(wins[0]) && currentMarks.includes(wins[2])) {
            winCell = wins[1];
        } else if (currentMarks.includes(wins[1]) && currentMarks.includes(wins[2])) {
            winCell = wins[0];
        }

        if (winCell !== null && !this.field[winCell]) {
            return winCell;
        }
        winCell = null;
    }
    return winCell;
};

Tictactoe.prototype.getFirstTurnCell = function() {
    var firstTurnOptions;
    if (this.getPlayerMarks(this.getOpponentMark()).length === 0) {
        firstTurnOptions = [0, 2, 4, 6, 8];
    } else if (this.field[4]) {
        firstTurnOptions = [0, 2, 6, 8];
    } else {
        firstTurnOptions = [4];
    }

    var i = Math.floor(Math.random() * firstTurnOptions.length);
    return firstTurnOptions[i];
};

Tictactoe.prototype.getRandomEmptyCell = function() {
    var emptyCells = [];
    for (var i = 0; i < this.field.length; i++) {
        if (this.field[i] === null) {
            emptyCells.push(i);
        }
    }
    var RandomPosition = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[RandomPosition];
};


// UI LOGIC
var tictactoe;
var playerMark = null;

function init() {
    $('.js-mark-selection-btn').on('click', function(e) {
        var mark = $(e.target).data('mark');
        if (mark === 'X') {
            playerMark = PLAYER_X;
        } else {
            playerMark = PLAYER_0;
        }
    });

    $('.js-start-game-btn').on('click', function() {
        if (playerMark) {
            tictactoe = new Tictactoe(playerMark);
            tictactoe.on('markSave', renderCell);
            tictactoe.on('scoreUpdate', renderScore);
            tictactoe.startGame();
            $('.js-start-game').removeClass('overlay');
            $('.js-field').addClass('overlay');
        }
    });

    $('.js-cell').on('click', function(e) {
        e.preventDefault();
        var cellIndex = $(e.target).data('index');
        tictactoe.saveInput(cellIndex);
    });

    $('.js-play-again').on('click', nextGame);
}

function renderCell(cellIndex) {
    var cellClass = '.js-cell-' + cellIndex;
    var $mark = $(cellClass).find('.js-mark');

    $mark.text(tictactoe.getCurrentMark());
}

function renderScore(result) {
    highlightWin();
    var $scoreLine = $('.js-score');
    var $scorePlayer = $('.js-score-player');
    var $scoreComputer = $('.js-score-computer');
    var content = '';
    if (result === RESULT_WIN) {
        if (tictactoe.currentPlayer === playerMark) {
            content = 'You won!';
        } else {
            content = 'Computer won!';
        }
    } else {
        content = "It's a draw.";
    }
    $scoreLine.text(content);
    if (playerMark === PLAYER_X) {
        $scorePlayer.text(tictactoe.scoreX);
        $scoreComputer.text(tictactoe.score0);
    } else {
        $scorePlayer.text(tictactoe.score0);
        $scoreComputer.text(tictactoe.scoreX);
    }
    $('.js-end-game').removeClass('invisible');
}

function highlightWin() {
    var cellClass;
    var win = tictactoe.checkWin();
    for (var i = 0; i < win.length; i++) {
        cellClass = '.js-cell-' + (win[i] + 1);
        $(cellClass).addClass('winning-cell');
    }
}

function nextGame() {
    clearField();
    tictactoe.startGame();
    $('.js-end-game').addClass('invisible');
}

function clearField() {
    for (var i = 1; i <= 9; i++) {
        var $cell = $('.js-cell-' + i);
        var $mark = $cell.find('.js-mark');

        $cell.removeClass('winning-cell');
        $mark.text('');
    }
}

$(document).ready(init);

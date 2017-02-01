var tictactoe;
var playerMark = null;

function init() {
    $('.js-cell').on('click', function(e) {
        var cellIndex = $(e.target).data('index');
        tictactoe.saveInput(cellIndex);
    });

    $('.js-play-again').on('click', function() {
        nextGame();
    });

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
            var $startGame = $('.js-start-game');
            $startGame.removeClass('overlay');
            $startGame.addClass('invisible');
        }
    });
}

function renderCell(cellIndex) {
    var cellClass = '.js-cell-' + cellIndex;
    var $mark = $(cellClass).find('.js-mark');

    $mark.text(tictactoe.getCurrentMark());
}

function renderScore(result) {
    var $endGame = $('.js-end-game');
    var $scoreLine = $('.js-score');
    var $scorePlayer = $('.js-score-player');
    var $scoreComputer = $('.js-score-computer');
    var content = '';
    if (result === RESULT_WIN) {
        content = tictactoe.currentPlayer + ' won!';
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
    $endGame.addClass('overlay');
    $endGame.removeClass('invisible');
}

function nextGame() {
    clearField();
    var $endGame = $('.js-end-game');
    $endGame.removeClass('overlay');
    $endGame.addClass('invisible');
    tictactoe.startGame();
}

function clearField() {
    for (var i = 1; i <= 9; i++) {
        var cellClass = '.js-cell-' + i;
        var $mark = $(cellClass).find('.js-mark');

        $mark.text('');
    }
}

$(document).ready(init);

// GAME LOGIC

var PLAYER_X = 'PLAYER_X';
var PLAYER_0 = 'PLAYER_0';
var RESULT_WIN = 'RESULT_WIN';
var RESULT_DRAW = 'RESULT_DRAW';
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

Tictactoe.prototype.init = function() {
    for (var i = 0; i < FIELD_SIZE; i++) {
        this.field[i] = null;
    }
};

Tictactoe.prototype.saveInput = function(cellIndex) {
    var mark = this.getCurrentMark();
    if (cellIndex && !this.field[cellIndex - 1]) {
        this.field[cellIndex - 1] = mark;
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

Tictactoe.prototype.switchPlayer = function() {
    if (this.currentPlayer === PLAYER_X) {
        this.currentPlayer = PLAYER_0;
    } else {
        this.currentPlayer = PLAYER_X;
    }
};

Tictactoe.prototype.computerTurn = function() {
    var dangerCell = this.getDangerCells();
    var winCell = this.getWinCells(this.getCurrentMark());
    if (winCell) {
        this.saveInput(winCell + 1);
    } else if (dangerCell) {
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

Tictactoe.prototype.checkWin = function() {
    var currentMarks;
    var win;
    currentMarks = this.getPlayerMarks(this.getCurrentMark());

    for (var i = 0; i < WINNING_COMBINATIONS.length; i++) {
        win = true;
        for (var j = 0; j < 3; j++) {
            if (!currentMarks.includes(WINNING_COMBINATIONS[i][j])) {
                win = false;
                break;
            }
        }
        if (win) {
            break;
        }
    }
    return win;
};

Tictactoe.prototype.on = function(eventName, callback) {
    this.callbacks[eventName] = callback;
};

Tictactoe.prototype.trigger = function(eventName, value) {
    if (this.callbacks[eventName]) {
        this.callbacks[eventName](value);
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

Tictactoe.prototype.endGame = function(result) {
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

Tictactoe.prototype.startGame = function() {
    this.init();
    if (this.currentPlayer === this.computer) {
        this.computerTurn();
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

        if (winCell && !this.field[winCell]) {
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
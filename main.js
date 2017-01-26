var tictactoe;

function init() {
    tictactoe = new Tictactoe();
    tictactoe.on('markSave', renderCell);
    tictactoe.on('scoreUpdate', renderScore);

    $('.js-cell').on('click', function(e) {
        var cellIndex = $(e.target).data('index');
        tictactoe.saveInput(cellIndex);
    });

    $('.js-play-again').on('click', function() {
        nextGame();
    });
}

function renderCell(cellIndex) {
    var cellClass = '.js-cell-' + cellIndex;
    var $mark = $(cellClass).find('.js-mark');

    $mark.text(tictactoe.getCurrentMark());
}

function renderScore(score) {
    var $endGame = $('.js-end-game');
    var $scoreLine = $('.js-score');
    var $scoreX = $('.js-score-x');
    var $score0 = $('.js-score-0');
    $scoreLine.text(score);
    $scoreX.text(tictactoe.scoreX);
    $score0.text(tictactoe.score0);
    $endGame.addClass('overlay');
    $endGame.removeClass('invisible');
}

function nextGame() {
    clearField();
    var $endGame = $('.js-end-game');
    $endGame.removeClass('overlay');
    $endGame.addClass('invisible');
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
var FIELD_SIZE = 9;
var WINNING_COMBINATIONS = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7],
    [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]];

function Tictactoe() {
    this.currentPlayer = PLAYER_X;
    this.callbacks = {
        markSave: null,
        scoreUpdate: null
    };
    this.field = [];
    this.scoreX = 0;
    this.score0 = 0;
    this.init();
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
        this.nextGame();
    } else {
        this.switchPlayer();
        if (this.currentPlayer === PLAYER_0) {
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
    for (var i = 0; i < FIELD_SIZE; i++) {
        if (this.field[i] === null) {
            this.saveInput(i + 1);
            return;
        }
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

Tictactoe.prototype.updateScore = function() {
    if (this.currentPlayer === PLAYER_X) {
        this.scoreX += 1;
    } else {
        this.score0 += 1;
    }
    this.trigger('scoreUpdate', (this.currentPlayer + ' wins!'));
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

Tictactoe.prototype.getPlayerMarks = function(currentMark) {
    var marks = [];
    for (var i = 0; i < this.field.length; i++) {
        if (this.field[i] === currentMark) {
            marks.push(i + 1);
        }
    }
    return marks;
};

Tictactoe.prototype.nextGame = function() {
    this.updateScore();
    this.init();
};
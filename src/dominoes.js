var tileWidth = 50;
var tileHeight = 100;

var board = [];

var turn = 1;
var round = 1;
var passes = 0;

var basetiles = [];

var pone = [];
var ptwo = [];
var pthree = [];
var pfour = [];

var gamestate = [];

var starter = 0;
var currentPlayer = 0;

var teamOneScore = 0;
var teamTwoScore = 0;

var reply = "no";

var board_element = document.getElementById("board");
var board_context = board_element.getContext("2d");
var hand_element = document.getElementById("hand");
var hand_context = hand_element.getContext("2d");
var play_buttons = document.getElementById("play_buttons");
var tempTile_element = document.getElementById("tempTile");
var tempTile_context = tempTile_element.getContext("2d");
var img = document.getElementById("basetiles");
var playerprompt = document.getElementById("playerprompt");
var logprompt = document.getElementById("logprompt");
var handprompt = document.getElementById("handprompt");
var scoreprompt = document.getElementById("scoreprompt");
var side_left = document.getElementById("side_left");
var side_right = document.getElementById("side_right");

var POneETH = document.getElementById("POneETH");
var PTwoETH = document.getElementById("PTwoETH");
var PThreeETH = document.getElementById("PThreeETH");
var PFourETH = document.getElementById("PFourETH");
var basewarning = document.getElementById("basewarning");

var POneAddress = "";
var PTwoAddress = "";
var PThreeAddress = "";
var PFourAddress = "";

var POneBet = 0;
var PTwoBet = 0;
var PThreeBet = 0;
var PFourBet = 0;


var playersAddress = [];
var playersBet = [];
var abi = JSON.parse("[{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"moves\",\"outputs\":[{\"name\":\"player\",\"type\":\"address\"},{\"name\":\"tile\",\"type\":\"string\"},{\"name\":\"side\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"gameOver\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"players\",\"outputs\":[{\"name\":\"player\",\"type\":\"address\"},{\"name\":\"handHash\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[],\"name\":\"GameStarted\",\"type\":\"event\"},{\"constant\":false,\"inputs\":[{\"name\":\"player2Addr\",\"type\":\"address\"},{\"name\":\"player3Addr\",\"type\":\"address\"},{\"name\":\"player4Addr\",\"type\":\"address\"},{\"name\":\"player1HandHash\",\"type\":\"string\"},{\"name\":\"player2HandHash\",\"type\":\"string\"},{\"name\":\"player3HandHash\",\"type\":\"string\"},{\"name\":\"player4HandHash\",\"type\":\"string\"}],\"name\":\"join\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"playerAddr\",\"type\":\"address\"},{\"name\":\"tile\",\"type\":\"string\"},{\"name\":\"side\",\"type\":\"string\"}],\"name\":\"savingMove\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]");
var contract;
var web3;


function init() {
    web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider('ws://localhost:7545'), null, {});
    contract = new web3.eth.Contract(abi, '0x0395a766F5fd179A002E5A9B4B7a416F27cf6587');
}

function ETHLockIn(player) {
    var address = document.getElementById(player.concat('ETH')).value;
    var bet = Number(document.getElementById(player.concat('Bet')).value);
    if (Number.isNaN(bet) || bet <= 0) {
        basewarning.innerHTML = player + ": Invalid Bet.";
    }
    if (address.length <= 0) {
        basewarning.innerHTML = player + ": Invalid Address.";
    }

    if (address.length > 0 && bet != 'NaN' && bet > 0) {
        document.getElementById(player.concat('ETH')).disabled = true;
        document.getElementById(player.concat('Bet')).disabled = true;
        if (player == 'POne') {
            POneAddress = address;
            POneBet = bet;
        } else if (player == 'PTwo') {
            PTwoAddress = address;
            PTwoBet = bet;
        } else if (player == 'PThree') {
            PThreeAddress = address;
            PThreeBet = bet;
        } else if (player == 'PFour') {
            PFourAddress = address;
            PFourBet = bet;
        }
        basewarning.innerHTML = "";
    }

    if (POneETH.disabled && PTwoETH.disabled && PThreeETH.disabled && PFourETH.disabled) {
        document.getElementById('accountprompt').style.display = 'none';
        document.getElementById('accountlist').innerHTML = "Player One's account:<br>" + POneETH.value + "<br><br>Player Two's account:<br>" + PTwoETH.value + "<br><br>Player Three's account:<br>" + PThreeETH.value + "<br><br>Player Four's account:<br>" + PFourETH.value;
        document.getElementById('game').style.display = 'inline';
        playersAddress = [POneAddress.value, PTwoAddress.value, PThreeAddress.value, PFourAddress.value];
        playersBet = [POneBet.value, PTwoBet.value, PThreeBet.value, PFourBet.value];
        startGame();
    }

}


function startGame() {
    setupNewRound();
    saveGameInBlockchain();
    var firstRoundStarter = findPlayerWithDoubleSix();
    currentPlayer = firstRoundStarter[0] + 1;
    starter = currentPlayer;
    logprompt.innerHTML += "<br>Player " + currentPlayer + " starts the round.";
    playTile(firstRoundStarter[1]);
}

function saveGameInBlockchain() {
    var hashedTiles = [];
    console.log(gamestate);
    for (var i = 0; i < 4; i++) {
        var hashedTile = hashTile(gamestate[i]);
        hashedTiles.push(hashedTile);
    }
    contract.methods.join(playersAddress[1], playersAddress[2], playersAddress[3], hashedTiles[0]
        , hashedTiles[1], hashedTiles[2], hashedTiles[3], playersBet[0], playersBet[1], playersBet[2]
        , playersBet[3]).send({
        from: playersAddress[0],
        gas: '500000'
    });
}

function hashTile(gameState) {
    var result = 0;
    for (var i = 0; i < 7; i++) {
        result = result + parseInt(gameState[i].tile);
    }
    return keccak256(result.toString());
}

function setupNewRound() {
    logprompt.innerHTML += "<br>===Round " + round + "===";
    if (round > 1) {
        logprompt.innerHTML += "<br>Player " + currentPlayer + " starts the round.";
        logprompt.scrollTop = logprompt.scrollHeight;
    }
    playerprompt.innerHTML = '';
    makeFreshDeck(basetiles);
    shuffle(basetiles);
    pone = basetiles.slice(0, 7);
    ptwo = basetiles.slice(7, 14);
    pthree = basetiles.slice(14, 21);
    pfour = basetiles.slice(21, 28);
    tagTiles(pone, 1);
    tagTiles(ptwo, 2);
    tagTiles(pthree, 3);
    tagTiles(pfour, 4);
    board.length = 0;
    gamestate = [pone, ptwo, pthree, pfour];
    gamestate.board = board;
    passes = 0;
    turn = 1;
    scoreprompt.innerHTML = "<br>The Scoreboard <br><br>Team One: " + teamOneScore + " <br>Team Two: " + teamTwoScore;
}

function saveMoveInTheBlockchain(player, tile, side) {
    console.log(player);
    console.log(tile);
    console.log(side);
    contract.methods.savingMove(player, tile, side).send({
        from: player,
        gas: '500000'
    });
}

function findPlayerWithDoubleSix() {
    var player = 0;
    var index = 0;
    var found = false;
    var response = [-1, -1];

    while (player < 4 && index < gamestate[player].length) {
        if (gamestate[player][index].tile == "66") {
            found = true;
            saveMoveInTheBlockchain(playersAddress[player], "66", "left");
            break;
        }
        if (index === gamestate[player].length - 1) {
            index = 0;
            player++;
            continue;
        }
        index++;
    }

    if (found) {
        response = [player, index];
    }

    return response;
}

function tagTiles(hand, player) {
    var index = 0;
    while (index < hand.length) {
        hand[index].player = player;
        index++;
    }
}

function makeFreshDeck() {
    basetiles.length = 0;
    var xIndex = 0;
    var yIndex = 0;
    var jagIndex = 0;
    while (yIndex <= 6) {
        while (xIndex <= 6) {
            basetiles.push({
                tile: "" + yIndex + xIndex,
                original_tile: "" + yIndex + xIndex,
                x_coord: jagIndex * tileWidth,
                y_coord: yIndex * tileHeight,
                double: xIndex === yIndex,
                flip: false,
                player: 0,
                turn: 0
            });
            jagIndex++;
            xIndex++;
        }
        yIndex++;
        xIndex = yIndex;
        jagIndex = 0;
    }
}

function printTileArray(tiles) {
    var index = 0;
    var msg = "";
    while (index < tiles.length) {
        if (index % 7 == 0) {
            msg += "</br>";
        }
        msg += tiles[index].tile + " "; //+ "[" + tiles[index].x_coord + ", " + tiles[index].y_coord + "]  ";
        index++;
    }
    return msg;
}

function drawBoard() {

    var index = 0;
    var reference_position = 0;
    board_context.clearRect(0, 0, board_element.width, board_element.height);

    board_context.font = "20px Helvetica";
    board_context.fillStyle = "black";
    board_context.textAlign = "center";

    while (index < gamestate.board.length) {
        if (gamestate.board[index].double) {
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            board_context.drawImage(img, gamestate.board[index].x_coord, gamestate.board[index].y_coord, tileWidth, tileHeight, reference_position, 0, tileWidth, tileHeight);

            board_context.fillText("P" + gamestate.board[index].player, reference_position + tileWidth / 2, 135);

            reference_position += tileWidth;
        } else {
            drawSideTile(gamestate.board[index], gamestate.board[index].flip, reference_position);

            board_context.fillText("P" + gamestate.board[index].player, reference_position + tileHeight / 2, 135);

            reference_position += tileHeight;
        }
        index++;
    }
}

function drawHand(hand) {
    var index = 0;

    hand_context.clearRect(0, 0, hand_element.width, hand_element.height);
    while (index < hand.length) {
        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        hand_context.drawImage(img, hand[index].x_coord, hand[index].y_coord, tileWidth, tileHeight, index * tileWidth, 0, tileWidth, tileHeight);
        index++;
    }

    play_buttons.innerHTML = '';

    index = 0;

    while (index < hand.length) {
        makePlayButton(index);
        index++;
    }

    handprompt.innerHTML = "Player " + currentPlayer + "'s hand.";
}

function makePlayButton(index) {
    //<button id="hand_zero" onclick="playTile(0)" style="padding:2px;height:50px;width:50px">Play</button>
    var btn = document.createElement("BUTTON");

    btn.innerHTML = "Play";
    btn.id = "hand" + index;
    btn.style.width = "50px";
    btn.style.height = "50px";
    btn.style.padding = "2px";
    btn.onclick = function () {
        playTile(index);
    };

    play_buttons.appendChild(btn);
}

function playTile(index) {

    if (gamestate.board.length > 0) {
        var playside = '';

        if (side_left.checked) {
            playside = "left";
        } else if (side_right.checked) {
            playside = "right";
        }

        var tile_index = checkPlay(gamestate[currentPlayer - 1][index].tile, playside);

        if (tile_index >= 0) {
            if ((tile_index === 1 && playside === "right") || (tile_index === 0 && playside === "left")) {
                gamestate[currentPlayer - 1][index].flip = true;
                gamestate[currentPlayer - 1][index].tile = gamestate[currentPlayer - 1][index].tile.split("").reverse().join("");
            }
            playTileHelper(index, playside);
        } else {
            playerprompt.innerHTML = "Cannot play " + gamestate[currentPlayer - 1][index].tile + " on the " + playside + ". Please try a different tile.";
        }
    } else {
        playTileHelper(index, "left");
    }
}

function playTileHelper(index, playside) {
    if (playside === "right") {
        gamestate[currentPlayer - 1][index].turn = turn;
        gamestate.board.push(gamestate[currentPlayer - 1][index]);
        logprompt.innerHTML += "<br>Turn " + turn + ": Player " + currentPlayer + " plays the " + gamestate[currentPlayer - 1][index].tile + " on the right.";
        logprompt.scrollTop = logprompt.scrollHeight;
    } else {
        gamestate[currentPlayer - 1][index].turn = turn;
        gamestate.board.unshift(gamestate[currentPlayer - 1][index]);
        logprompt.innerHTML += "<br>Turn " + turn + ": Player " + currentPlayer + " plays the " + gamestate[currentPlayer - 1][index].tile + " on the left.";
        logprompt.scrollTop = logprompt.scrollHeight;
    }
    saveMoveInTheBlockchain(playersAddress[currentPlayer - 1], gamestate[currentPlayer - 1][index].original_tile, playside);
    gamestate[currentPlayer - 1].splice(index, 1);
    drawBoard();
    drawHand(gamestate[currentPlayer - 1]);
    nextTurnSetup();
}

function nextTurnSetup() {
    turn++;
    playerprompt.innerHTML = '';
    if (gamestate[currentPlayer - 1].length === 0) {
        logprompt.innerHTML += "<br>Turn " + turn + ": Player " + currentPlayer + " wins. Counting points now.";
        logprompt.scrollTop = logprompt.scrollHeight;

        var tempOne = getPlayerTeam(currentPlayer);
        var tempTwo = getPlayerTeam(nextPlayer(currentPlayer));
        if (tempOne[2] === 0) {
            countWinnerPoints(tempOne, tempTwo, 1)
        } else {
            countWinnerPoints(tempTwo, tempOne, 2)
        }
        endOfRound();
    } else {
        currentPlayer = nextPlayer(currentPlayer);
        while (youPass(gamestate[currentPlayer - 1]) && passes < 4) {
            logprompt.innerHTML += "<br>Turn " + turn + ": Player " + currentPlayer + " passes.";
            logprompt.scrollTop = logprompt.scrollHeight;
            currentPlayer = nextPlayer(currentPlayer);
            passes++;
        }
        if (passes === 4) {
            logprompt.innerHTML += "<br>Turn " + turn + ": Forced match, counting points now.";
            logprompt.scrollTop = logprompt.scrollHeight;

            var tempOne = getPlayerTeam(currentPlayer);
            var tempTwo = getPlayerTeam(nextPlayer(currentPlayer));
            if (tempOne[2] === 0) {
                countWinnerPoints(tempOne, tempTwo, 0)
            } else {
                countWinnerPoints(tempTwo, tempOne, 0)
            }
            endOfRound();
        } else {
            passes = 0;
            drawBoard();
            drawHand(gamestate[currentPlayer - 1]);
        }
    }
}

function getPlayerTeam(player) {
    var teamnumber = (player - 1) % 2;
    var teammate = nextPlayer(nextPlayer(player));
    return [gamestate[player - 1], gamestate[teammate - 1], teamnumber];
}

function countWinnerPoints(teamOne, teamTwo, winner) {
    var scoreOne = countTeamPoints(teamOne);
    var scoreTwo = countTeamPoints(teamTwo);
    logprompt.innerHTML += "<br>Here are the final hands: ";
    logprompt.innerHTML += "<br>---Team One---";
    logprompt.innerHTML += "<br>Player one: " + printTileArray(teamOne[0]);
    logprompt.innerHTML += "<br>Player three: " + printTileArray(teamOne[1]);

    logprompt.innerHTML += "<br>---Team Two---";
    logprompt.innerHTML += "<br>Player two: " + printTileArray(teamTwo[0]);
    logprompt.innerHTML += "<br>Player four: " + printTileArray(teamTwo[1]);
    logprompt.scrollTop = logprompt.scrollHeight;
    if (winner === 0) {
        if (scoreOne = scoreTwo) {
            logprompt.innerHTML += "<br>Perfect draw. No points granted.";
            logprompt.scrollTop = logprompt.scrollHeight;
        } else if (scoreOne > scoreTwo) {
            logprompt.innerHTML += "<br>Team Two Wins. Adding " + scoreOne + " points to their score.";
            logprompt.scrollTop = logprompt.scrollHeight;
            teamTwoScore += scoreOne;
        } else {
            logprompt.innerHTML += "<br>Team One Wins. Adding " + scoreTwo + " points to their score.";
            logprompt.scrollTop = logprompt.scrollHeight;
            teamOneScore += scoreTwo;
        }
    } else if (winner === 1) {
        logprompt.innerHTML += "<br>Team One Wins. Adding " + scoreTwo + " points to their score.";
        logprompt.scrollTop = logprompt.scrollHeight;
        teamOneScore += scoreTwo;
    } else if (winner === 2) {
        logprompt.innerHTML += "<br>Team Two Wins. Adding " + scoreOne + " points to their score.";
        logprompt.scrollTop = logprompt.scrollHeight;
        teamTwoScore += scoreOne;
    }
}

function endOfRound() {
    if (teamOneScore >= 100) {
        logprompt.innerHTML += "<br>===GAME OVER===<br>Team One Wins the game.";
        logprompt.scrollTop = logprompt.scrollHeight;
    } else if (teamTwoScore >= 100) {
        logprompt.innerHTML += "<br>===GAME OVER===<br>Team Two Wins the game.";
        logprompt.scrollTop = logprompt.scrollHeight;
    } else {
        round++;
        starter = nextPlayer(starter);
        currentPlayer = starter;
        setupNewRound();
        drawBoard();
        drawHand(gamestate[currentPlayer - 1]);
    }
}

function countTeamPoints(team) {
    var index = 0;
    var score = 0;
    while (index < team[0].length) {
        logprompt.scrollTop = logprompt.scrollHeight;
        score += countTilePoints(team[0][index].tile);
        index++;
    }
    index = 0;
    while (index < team[1].length) {
        score += countTilePoints(team[1][index].tile);
        index++;
    }

    return score;
}

function countTilePoints(tile) {
    return parseInt(tile.charAt(0)) + parseInt(tile.charAt(1));
}

function checkPlay(tile, playside) {
    var valid = -1;
    if (playside === "right") {
        valid = tile.indexOf(gamestate.board[gamestate.board.length - 1].tile.charAt(1));
    } else if (playside === "left") {
        valid = tile.indexOf(gamestate.board[0].tile.charAt(0));
    }
    return valid;
}

function drawSideTile(tile, flip, xcoord) {

    tempTile_context.clearRect(0, 0, tempTile_element.width, tempTile_element.height);
    tempTile_context.translate(tempTile_element.height / 2, tempTile_element.width / 2);
    if (flip === true) {
        tempTile_context.rotate((Math.PI * 270) / 180);
    } else {
        tempTile_context.rotate((Math.PI * 90) / 180);
    }
    tempTile_context.translate(-3 * tempTile_element.height / 4, -tempTile_element.width / 2);

    tempTile_context.drawImage(img, tile.x_coord, tile.y_coord, tileWidth, tileHeight, tileWidth, 0, tileWidth, tileHeight);

    tempTile_context.resetTransform();
    board_context.drawImage(tempTile_element, xcoord, 0);
    tempTile_context.clearRect(0, 0, tempTile_element.width, tempTile_element.height);
}

function nextPlayer(player) {
    player++;
    if (player === 5) {
        player = 1;
    }
    return player;
}

function youPass(hand) {
    var leftNumber = gamestate.board[0].tile.charAt(0);
    var rightNumber = gamestate.board[gamestate.board.length - 1].tile.charAt(1);
    var index = 0;
    while (index < hand.length) {
        if (hand[index].tile.includes(leftNumber) || hand[index].tile.includes(rightNumber)) {
            return false;
        }
        index++;
    }
    //console.log(chalk.magenta("Player passed with this hand: " + hand));
    return true;
}

//fisher-yates shuffle taken from stackoverflow
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

init();
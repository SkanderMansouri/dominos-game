pragma solidity ^0.5.0;
contract DominoGame {
    address public player1;
    address public player2;
    address public player3;
    address public player4;
    bool public gameOver;
    struct GameState {
        uint8 seq;
        uint8 num;
        address whoseTurn;
    }
    struct move{
        address player;
        string tile;
        string side;
    }

    move[] public moves;

    GameState public state;

    event GameStarted();
    event MoveMade(address player, uint8 seq, uint8 value);
    // Setup methods
    constructor() public payable {
        player1 = msg.sender;
    }
    function join(address player2Addr, address player3Addr, address player4Addr) public returns (address){
        //require(player2 == address(0), "Game has already started.");
        //require(player3 == address(0), "Game has already started.");
        //require(player4 == address(0), "Game has already started.");
      //  require(!gameOver, "Game was canceled.");
        player2 = player2Addr;
        player3 = player3Addr;
        player4 = player4Addr;
        state.whoseTurn = player1;
        //emit GameStarted();
        return(msg.sender);
    }
    function cancel() public {
        require(msg.sender == player1, "Only first player may cancel.");
        gameOver = true;
        msg.sender.transfer(address(this).balance);
    }
    function savingMove(address player, string memory tile, string memory side) public {
        moves.push(move(player, tile, side));
    }
    function saveMove(uint8 seq, uint8 value) public {
        require(!gameOver, "Game has ended.");
        require(msg.sender == state.whoseTurn, "Not your turn.");
        require(state.seq == seq, "Incorrect sequence number.");
        state.num += value;
        state.whoseTurn = opponentOf(msg.sender);
        state.seq += 1;
        emit MoveMade(msg.sender, seq, value);
    }
    function opponentOf(address player) internal view returns (address) {
        require(player2 != address(0), "Game has not started.");
        if (player == player1) {
            return player2;
        } else if (player == player2) {
            return player3;
        }  else if (player == player3) {
            return player4;
        }
        else if (player == player4) {
            return player;
        }
        else {
            revert("Invalid player.");
        }
    }
}
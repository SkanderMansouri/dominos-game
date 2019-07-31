pragma solidity ^0.5.0;
contract DominoGame {

    bool public gameOver;

    struct move{
        address player;
        string tile;
        string side;
    }

    struct GameState {
        uint8 seq;
        uint8 num;
        address whoseTurn;
    }

    GameState public state;

    struct player{
        address player;
        string handHash;
        uint betAmount;
    }

    player[] public players;
    move[] public moves;


    event GameStarted();

    constructor() public payable {
    }

    function join(address player2Addr, address player3Addr, address player4Addr,string memory player1HandHash
    ,string memory player2HandHash,string memory player3HandHash,string memory player4HandHash,uint player1Bet
    ,uint player2Bet,uint player3Bet,uint player4Bet) public returns (address){

        players.push(player(msg.sender,player1HandHash,player1Bet));
        players.push(player(player2Addr,player2HandHash,player2Bet));
        players.push(player(player3Addr,player3HandHash,player3Bet));
        players.push(player(player4Addr,player4HandHash,player4Bet));
        emit GameStarted();
        return(msg.sender);
    }

    function moveFromState(uint8 seq, uint8 num) public {
            require(seq >= state.seq, "Sequence number cannot go backwards.");

            state.seq = seq;
            state.num =+ num;
            state.whoseTurn = msg.sender;
    }


    function transferMoneyToWinners(address payable winner1Addr, address payable winner2Addr) public {
        require(gameOver == true);
        uint256 amountToSend = 0;
        for(uint256 i=0; i< players.length;i++){
            amountToSend = amountToSend + players[i].betAmount;
        }
        winner1Addr.transfer(amountToSend/2);
        winner2Addr.transfer(amountToSend/2);
    }
}
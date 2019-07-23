pragma solidity ^0.5.0;
contract DominoGame {

    bool public gameOver;

    struct move{
        address player;
        string tile;
        string side;
    }

    struct player{
        address player;
        bytes32 handHash;
    }

    player[] public players;
    move[] public moves;


    event GameStarted();

    constructor() public payable {
    }

    function join(address player2Addr, address player3Addr, address player4Addr,bytes32 player1HandHash
    ,bytes32 player2HandHash,bytes32 player3HandHash,bytes32 player4HandHash) public returns (address){

        players.push(player(msg.sender,player1HandHash));
        players.push(player(player2Addr,player2HandHash));
        players.push(player(player3Addr,player3HandHash));
        players.push(player(player4Addr,player4HandHash));
        emit GameStarted();
        return(msg.sender);
    }
    function savingMove(address playerAddr, string memory tile, string memory side) public {
        moves.push(move(playerAddr, tile, side));
    }
}
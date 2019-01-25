const express = require("express");
const EventEmitter = require("events");
const app = express();


const hands = require("./hands.js");

let NewDeck = () => 
            ["2h","3h","4h", "5h","6h","7h","8h","9h","10h","Jh","Qh","Kh","Ah",
            "2s","3s","4s", "5s","6s","7s","8s","9s","10s","Js","Qs","Ks","As",
            "2c","3c","4c", "5c","6c","7c","8c","9c","10c","Jc","Qc","Kc","Ac",
            "2d","3d","4d", "5d","6d","7d","8d","9d","10d","Jd","Qd","Kd","Ad"];

class PlayerInfo {
  constructor(position, playerName, balance, cardHand, hasBet, folded, hand, score, winner) {
    this.position = position;
    this.playerName = playerName;
    this.balance = balance;
    this.cardHand = cardHand;
    this.hasBet = hasBet;
    this.folded = folded;
    this.hand = hand;
    this.score = score;
    this.winner = winner;
  }
}

class GameRoom {
    constructor(id) {
        this.id = id;
        this.players = {};
        this.numOfPlayers = 0;
        this.deck = [];

        //State

        this.communityCards= [],
        this.pot= 0,
        this.largestBet=0;


        //Game stats
        this.round=0,
        this.turn=0,
        this.smallBlind=20;
        this.bigBlind=40;
        this.numOfChecks=0;
        this.numOfCalls=0;
        this.foldedPositions=[];
        this.showdown = false;

        this.setNewDeck = this.setNewDeck.bind(this);
        this.addNewPlayer = this.addNewPlayer.bind(this);
        this.dealCards = this.dealCards.bind(this);
        this.addCommunityCards = this.addCommunityCards.bind(this);
        this.addCardHand = this.addCardHand.bind(this);
        this.bet = this.bet.bind(this);
        this.placeBlinds = this.placeBlinds.bind(this);
        this.advanceTurn = this.advanceTurn.bind(this);
        this.advanceRound = this.advanceRound.bind(this);
        this.resetPlayersBets = this.resetPlayersBets.bind(this);
        this.checkBet = this.checkBet.bind(this);  
        this.checkVictory = this.checkVictory.bind(this);  
        this.reward = this.reward.bind(this);
        this.fold = this.fold.bind(this);
        this.serveState = this.serveState.bind(this); 
    }
    setNewDeck() {
        this.deck = NewDeck();
    }
    addNewPlayer(name) {
        let playerId = Math.round(Math.random()*100).toString();
        if(!this.players[playerId]) {
            this.players[playerId] = new PlayerInfo(
            this.numOfPlayers, //position
            name.toUpperCase(), //playerName
            500, //balance
            [], //cardHand
            0, //hasBet
            false, //folded
            "", //hand
            0, //score
            false //winner
            );
            this.numOfPlayers++;
            if (this.numOfPlayers === 2)
              this.placeBlinds()
            return playerId;
        } else {
            this.addNewPlayer(name);
        }
    }
    dealCards() {
        this.setNewDeck();
        let players = this.players;
        for (let playerId in players) {
          this.addCardHand(playerId);
        }
    }
    
    placeBlinds() {
        let players = this.players;
        let numOfPlayers = this.numOfPlayers;
    
        let bigBlind = (this.round+1 < numOfPlayers) ? this.round+1 : this.round+1-numOfPlayers;
        let first, second;
        for(let player in players) {
          if(players[player].position===this.round) {
            first = players[player];
          } else if(players[player].position===bigBlind) {
            second = players[player];
          }       
        }
        first.balance-=this.smallBlind;
        second.balance-=this.bigBlind;
        first.hasBet+=this.smallBlind;
        second.hasBet+=this.bigBlind; 
        this.numOfCalls = -1;
        this.pot = this.pot + this.smallBlind + this.bigBlind;
        this.largestBet = this.bigBlind;
        this.dealCards();
        this.advanceTurn(2);
    }
    
    advanceTurn(turns = 1) {
        let numOfPlayers = this.numOfPlayers;
        let turn = this.turn + parseInt(turns);
        if(turn>=numOfPlayers)
          turn-=numOfPlayers;
    
        if(this.foldedPositions.includes(turn))
          this.advanceTurn(turns+1);
        else
          this.turn = turn;
    }
    
    checkBet() {
        let numOfPlayers = this.numOfPlayers;
        if (this.numOfChecks === numOfPlayers-this.foldedPositions.length ||
          this.numOfCalls === numOfPlayers-this.foldedPositions.length-1 || 
          (this.numOfChecks===1 && this.communityCards.length===0)) {
            if(this.communityCards.length<5)
              this.addCommunityCards();
            else
              this.checkVictory();
        } else 
          this.advanceTurn(1);
    }
    
    checkVictory() {
        let players = this.players;
        const checks = ["royal","straightFlush","fourKind","fullHouse","flush","straight",
                        "threeKind","twoPairs","pair","highCard"];
        let maxScore = 0;
        let winners = [];               
                  
        for (let player in players) {
          if(!players[player].folded) {
            let cardHand = players[player].cardHand.join("")+this.communityCards.join("");
            for (let i=0; i<checks.length; i++) {
              let check = checks[i];
              let test = hands[check].Test(cardHand);
              if (test) {
                players[player].hand = test.name;
                players[player].score = test.score;
                if(test.score>maxScore) { 
                  maxScore = test.score;
                  winners = []; 
                  winners.push(players[player]);
                } else if(test.score===maxScore) {
                    winners.push(players[player]);
                }
                break;   
              }
            }
          }
        }

        winners.forEach((player)=>player.winner = true);  
        this.showdown = true;
        setTimeout(this.reward,30000);  
    }
    
    reward() {
        let players = this.players;
        let pot = this.pot;
        let winners = [];
        for (let player in players) {
          players[player].score=0;
          players[player].hand="";
          if(players[player].winner)
            winners.push(players[player]);
          players[player].winner=false;
          players[player].folded=false;
        }
        for (let winner in winners) {
          winners[winner].balance += Math.floor(pot/winners.length);
        }

        this.advanceRound(1);
    }
    
    advanceRound(rounds = 1) {
        let numOfPlayers = this.numOfPlayers;
        let round = this.round+parseInt(rounds);
        if(round>=numOfPlayers)
          round-=numOfPlayers;
        this.showdown = false;
        this.communityCards = [];
        this.foldedPositions = [];
        this.pot = 0;  
        this.numOfCalls = 0;
        this.numOfChecks = 0;
        this.resetPlayersBets();        
        this.round = round;
        this.turn = round;
        this.placeBlinds();
        emitter.emit(this.id);
    }
    
    addCommunityCards() {
        let cardList = [...this.communityCards];
        let cardsToAdd = (cardList.length<3) ? 3 : 1;
        let deck = this.deck;
    
        while (cardsToAdd>0 && deck.length>0 && cardList.length<5) {
          let randomCard = Math.floor(Math.random()*(deck.length-1));
          cardList.push(deck[randomCard]);
          deck.splice(randomCard,1);
          cardsToAdd--;
        }
    
        this.communityCards = cardList;
        this.largestBet = 0;
        this.turn = this.round;
        this.numOfCalls = 0;
        this.numOfChecks = 0;
        this.resetPlayersBets();
    }
    
    resetPlayersBets() {
        let players = this.players;
        for(let player in players) {
          players[player].hasBet = 0;
        }
    }
    
    addCardHand(id) {
        let players = this.players;
        let cardList = [];
        let cardsToAdd = 2;
        let deck = this.deck;
    
        while (cardsToAdd>0 && deck.length>0) {
          let randomCard = Math.floor(Math.random()*(deck.length-1));
          cardList.push(deck[randomCard]);
          deck.splice(randomCard,1);
          cardsToAdd--;
        }
        players[id].cardHand = cardList;
    } 
     
    bet(id,sum) {
        let players = this.players;
        if(players[id].position === this.turn) {
          let pot = this.pot;
          
          sum=parseInt(sum);
          if(sum>players[id].balance)
            sum=players[id].balance;
      
          players[id].balance-=sum;
          players[id].hasBet+=sum;
          pot+=sum;
      
          if(players[id].hasBet>this.largestBet) {
            this.largestBet = players[id].hasBet;
            this.numOfCalls = 0;
            this.numOfChecks = 0;
          } else if(sum===0) {
            this.numOfChecks++;
            this.numOfCalls = 0;
          } else { 
            this.numOfCalls++;
            this.numOfChecks = 0;      
          }
      
          this.pot = pot;
          this.checkBet();
        }
    }

    fold(id) {
        let players = this.players;
        if(players[id].position === this.turn) {
          let numOfPlayers = this.numOfPlayers;
          
          players[id].folded = true;
          this.foldedPositions.push(players[id].position);
          
          if(this.foldedPositions.length === numOfPlayers-1) {
            this.showdown = true;
            for(let player in players) {
              if(!this.foldedPositions.includes(players[player].position))
                players[player].winner = true;
            }
          } else 
            this.advanceTurn(1);
        }
    }

    serveState(id) {
      let state = {};
      state.communityCards = this.communityCards;
      state.pot = this.pot;
      state.largestBet = this.largestBet;
      state.players = new Array(this.numOfPlayers);
      for (let playerId in this.players) {
        let playerStats = {};
        playerStats.playerName = this.players[playerId].playerName;
        playerStats.balance = this.players[playerId].balance;
        playerStats.hasBet = this.players[playerId].hasBet;
        playerStats.folded = this.players[playerId].folded;
        playerStats.hand = this.players[playerId].hand;
        playerStats.score = this.players[playerId].score;
        playerStats.winner = this.players[playerId].winner;
        if (id===playerId && !this.showdown) {
          playerStats.control = true;
          playerStats.cardHand = this.players[playerId].cardHand;
        } else if(!this.showdown) {
          playerStats.control = false;
          playerStats.cardHand = [false,false];
        } else {
          playerStats.control = false;
          playerStats.cardHand = this.players[playerId].cardHand;          
        }
        if (this.turn === this.players[playerId].position)
          playerStats.turn = true;
        else 
          playerStats.turn = false;
        state.players[this.players[playerId].position] = playerStats;
      }
      return state;
    }
};

let gameRooms = {};
let emitter = new EventEmitter();

app.use(express.static("./dist"));

app.get("/favicon.ico", (req,res)=>res.sendStatus(204));

app.get("/gameroom/:id/sse/", (req,res)=>{
  res.writeHead(200, {"Content-Type":"text/event-stream",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive"});
  emitter.on(req.params.id,()=>{
    res.write("data: \n\n");
  });
});

app.get("/gameroom/:id/servestate/:playerid", (req,res)=>{
  if(gameRooms[req.params.id]) {
    res.send(gameRooms[req.params.id].serveState(req.params.playerid));
  } else {
    res.end(404);    
  }
});

app.get("/gameroom/:id/player/:playerid/bet/:bet", (req,res)=>{
  if(gameRooms[req.params.id]) {
    gameRooms[req.params.id].bet(req.params.playerid,req.params.bet);
    res.send(gameRooms[req.params.id].serveState(req.params.playerid));
    emitter.emit(req.params.id);
  } else {
    res.end(404);    
  }
});

app.get("/gameroom/:id/player/:playerid/fold", (req,res)=>{
  if(gameRooms[req.params.id]) {
    gameRooms[req.params.id].fold(req.params.playerid);
    res.send(gameRooms[req.params.id].serveState(req.params.playerid));
    emitter.emit(req.params.id);
  } else {
    res.end(404);    
  }
});

app.get("/gameroom/:id/addplayer/:name", (req,res)=>{
  if(gameRooms[req.params.id]) {

    res.status(200);
    res.send(gameRooms[req.params.id].addNewPlayer(req.params.name));
    emitter.emit(req.params.id);
  } else {
    gameRooms[req.params.id] = new GameRoom(req.params.id);
    res.status(200);
    res.send(gameRooms[req.params.id].addNewPlayer(req.params.name));
  }
});

app.listen(3000, ()=>console.log("express listening on 3000"));

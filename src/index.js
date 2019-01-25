import React from "react";
import {render} from "react-dom";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameStarted: false,
            playerId:""
        };

        this.playerName = "";
        this.gameRoom = "";

        this.setPlayerName = this.setPlayerName.bind(this);
        this.setGameRoom = this.setGameRoom.bind(this);
        this.startGame = this.startGame.bind(this);
    }

    setPlayerName(evt) {
        const name = evt.target.value.toUpperCase();
        this.playerName = name;
    }

    setGameRoom(evt) {
        const gameRoom = evt.target.value;
        this.gameRoom = gameRoom;
    }

    startGame() {
        if(this.playerName && this.gameRoom) {
            let xhr = new XMLHttpRequest();
            
            xhr.addEventListener("load", ()=>{
                this.setState({playerId: xhr.responseText});
                this.setState({gameStarted: true});
            });
            xhr.open("GET","/gameroom/"+this.gameRoom+"/addplayer/"+this.playerName);
            xhr.send();
        }
    }
    

    render() {
        if(!this.state.gameStarted)
            return <MainMenu setPlayerName={this.setPlayerName} setGameRoom={this.setGameRoom} startGame={this.startGame}/>
        else
            return <CardTable gameRoom = {this.gameRoom} playerId = {this.state.playerId} />
    }
}

const MainMenu = (props) => {
    return (
        <div className="MainMenu">
            <span> Player Name: </span><input type="text" onChange={props.setPlayerName} />
            <span> Game Room: </span><input type="text" onChange={props.setGameRoom} />
            <Button onClick={props.startGame} text="Let's start!"/>
        </div>
    )
}



class CardTable extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            communityCards: [],
            pot: 0,
            largestBet: 0,
            players: []
        };

        this.bet = this.bet.bind(this);
        this.fold = this.fold.bind(this);
        this.updateState = this.updateState.bind(this);
    }

    updateState() {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", ()=>{ 
            this.setState(JSON.parse(xhr.response));
        });
        xhr.open("GET","/gameroom/"+this.props.gameRoom+"/servestate/"+this.props.playerId);
        xhr.send();
    }

    bet(bet) { // TODO: add limit
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", ()=>{ 
            this.setState(JSON.parse(xhr.response));
        });
        xhr.open("GET","/gameroom/"+this.props.gameRoom +
                "/player/"+this.props.playerId+"/bet/"+bet);
        xhr.send();
    }

    fold() {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", ()=>{ 
            this.setState(JSON.parse(xhr.response));
        });
        xhr.open("GET","/gameroom/"+this.props.gameRoom +
                "/player/"+this.props.playerId+"/fold");
        xhr.send();
    }

    componentDidMount() {
        let evtSource = new EventSource("/gameroom/"+this.props.gameRoom+"/sse");
        evtSource.onmessage =()=>this.updateState();
        this.updateState();
    }

    render() {
        let playerList = [];
        this.state.players.forEach((player, index)=>{
            playerList.push(
                <Player 
                    key = {index}
                    playerName = {player.playerName}
                    control = {player.control}
                    turn = {player.turn}
                    balance = {player.balance}
                    hasBet = {player.hasBet}
                    cardHand = {player.cardHand}
                    hand = {player.hand}
                    score = {player.score}
                    winner = {player.winner}
                    folded = {player.folded}
                    bet = {this.bet}
                    fold = {this.fold}
                    largestBet = {this.state.largestBet}
                    updateState = {this.updateState}
                />
        )});
        

        return (
            <div className="CardTable">
            <CommunityCards communityCards={this.state.communityCards}/>
            <Pot pot={this.state.pot}/>
            {playerList}        
        </div>
        )
    }
}

const Player = (props) => {    
    let customBet = 0;
    let name = props.playerName;
    return (
        <div className="Player">
            <span> {name} </span> <br/>
            {(props.turn) ? <span>Turn</span> : null } <br/>
            <span> Balance: {props.balance}</span> <br/>        
            {(!props.folded) ? <CardHand cardHand={props.cardHand} /> : <span> Folded. </span> }
            {(props.control && props.turn) ? 
            <div>
                {(props.largestBet > props.hasBet) ? 
                    <Button onClick={()=>props.bet(props.largestBet-props.hasBet)} text="Call"/> :
                    <Button onClick={()=>props.bet(0)} text="Check"/>
                }
                <div>
                    <input type="text" onChange={(evt)=>customBet=parseInt(evt.target.value)} />
                    <Button onClick={()=>props.bet(props.largestBet-props.hasBet+customBet)} text="Raise" />
                </div>
                <Button onClick={()=>props.fold(name)} text="Fold" />
            </div> : null}
            {(props.hand)? <span> Hand: {props.hand}</span> : null}
            <br />
            {(props.score)? <span> Score: {props.score}</span> : null}
            <br />
            {(props.winner) ? <span> Winner !</span> : null}
        </div>
    )

}

const CommunityCards = (props) => {
    const cards = props.communityCards.map((e,i)=><Card key={i} card={e} closed={false} />);
    return (
        <div className="CommunityCards">
            {cards}
        </div>
    )
}

const CardHand = (props) => {
    const cards = props.cardHand.map((e,i)=><Card key={i} card={e} closed={false} />);
    return (
        <div className="CardHand">
            {cards}
        </div>
    )
}

const Card = (props) => {
    if (props.card) {
        const suitIcons = { h:"♥", s:"♠", d:"♦", c:"♣" };
        const suit = props.card[props.card.length-1];
        let cls = (/h|d/.test(suit)) ? "card-suit red" : "card-suit";
  
        return (
            <div className="Card">
                <div className="card-face">
                    {props.card.substring(0,props.card.length-1)}
                </div>                
                <div className={cls}>
                    {suitIcons[suit]}
                </div>         
            </div>
        )
    } else {
        return <div className="Card">******</div>
    }

    
}

const Pot = (props) => {
    return <div className="Pot"> Pot is {props.pot} </div>
}

const Button = (props) => <button onClick={props.onClick}>{props.text}</button>


//######## Render Content ########//

render(
    <App />,
    document.getElementById("react-render")
);
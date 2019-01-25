module.exports = hands = { 
  royal:{
    score:9000,
    Test(str){
      let result = /Ah/.test(str) && /Kh/.test(str) && /Qh/.test(str) && /Jh/.test(str) && /10h/.test(str) ||
            /As/.test(str) && /Ks/.test(str) && /Qs/.test(str) && /Js/.test(str) && /10s/.test(str) ||
            /Ac/.test(str) && /Kc/.test(str) && /Qc/.test(str) && /Jc/.test(str) && /10c/.test(str) ||
            /Ad/.test(str) && /Kd/.test(str) && /Qd/.test(str) && /Jd/.test(str) && /10d/.test(str);
      return (result) ? {name:"Royal Flush", score:this.score} : false;
    }
  },
  straightFlush:{
    score:8000,
    Test(str) {
      const suits = ["h","s","d","c"];
      const cards = ["A","Ace", "K","King", "Q","Queen", "J","Jack", "10","Ten", "9","Nine", "8","Eight",
                  "7","Seven", "6","Six", "5","Five", "4","Four", "3","Three", "2","Two"];    

      for (let i=0; i<suits.length; i++) {
        let re = new RegExp(suits[i],"g");
        if (str.match(re) && str.match(re).length>=5) {                 
          for(let y=0;y<cards.length-8;y+=2) {
            let re1 = new RegExp(cards[y]+suits[i]);
            let re2 = new RegExp(cards[y+2]+suits[i]);
            let re3 = new RegExp(cards[y+4]+suits[i]);
            let re4 = new RegExp(cards[y+6]+suits[i]);
            let re5 = new RegExp(cards[y+8]+suits[i]);           
            if(re1.test(str) && re2.test(str) && re3.test(str) 
                && re4.test(str) && re5.test(str)) {
              return {
                name: `Straight Flush (${cards[y+1]})`,
                score: this.score + (cards.length-i)/2
              }
            }
          }
        }
      }
      return false; 
    }       
  },
  fourKind:{
    score:7000,
    Test(str) {
      const cards = ["A","Ace", "K","King", "Q","Queen", "J","Jack", "10","Ten", "9","Nine", "8","Eight",
                  "7","Seven", "6","Six", "5","Five", "4","Four", "3","Three", "2","Two"];  
      let score = 0;
      let name = "";
      let four;
      for (let i=0; i<cards.length-1; i+=2) {
        let re = new RegExp(cards[i],"g");
        if (str.match(re) && str.match(re).length===4) {
          four = cards[i];
          name = `Four of a kind (${cards[i+1]})`;
          score += 13*(cards.length-i)/2;
          break;
        }
      }
      if(four) {
        for (let i=0; i<cards.length-1; i+=2) {
          let re = new RegExp(cards[i]);
          if (cards[i]!==four && re.test(str)) {
            score += (cards.length-i)/2;
            return {
              name: name,
              score: this.score + score
            }
          }
        }
      }
      return false;
    }
  },
  fullHouse:{
    score:6000,
    Test(str) {
      const cards = ["A","Ace", "K","King", "Q","Queen", "J","Jack", "10","Ten", "9","Nine", "8","Eight",
                  "7","Seven", "6","Six", "5","Five", "4","Four", "3","Three", "2","Two"];  

      let three;
      let name;
      let score = 0;
      for (let i=0; i<cards.length-1; i+=2) {
        let re = new RegExp(cards[i],"g");
        if (str.match(re) && str.match(re).length===3) {

          three = cards[i];
          name = cards[i+1];
          score += 13*(cards.length-i)/2;
          break;          
        }
      }
      if (three) {
        for (let i=0; i<cards.length-1; i+=2) {
          let re = new RegExp(cards[i],"g");
          if (cards[i]!==three && str.match(re) && str.match(re).length===2) {
            name += ` over ${cards[i+1]}`;
            score +=(cards.length-i)/2;
            return {
              name: `Full House, ${name}`,
              score: this.score + score
            }          
          }
        }
      }
      return false;
    }
  },
  flush:{
    score:5000,
    Test(str) {
      const suits = ["h","s","d","c"];
      const cards = ["A","Ace", "K","King", "Q","Queen", "J","Jack", "10","Ten", "9","Nine", "8","Eight",
                  "7","Seven", "6","Six", "5","Five", "4","Four", "3","Three", "2","Two"];      
      let flushSuit = "";
      let score = 0;
      let name = "";
      let count = 0;

      for (let i=0; i<suits.length; i++) {
        let re = new RegExp(suits[i],"g");
        if (str.match(re) && str.match(re).length===5) {
          flushSuit = suits[i];
          break;
        }
      }
      if (flushSuit) {
        for (let i=0; i<cards.length-1; i+=2) {
          let re = new RegExp(cards[i]+flushSuit);          
          if (re.test(str)) {
            if (!name) name=`Flush (${cards[i+1]})`;
            score+=(cards.length-i)/2;
            count++;
            if(count===5) {
              return {
                name:name,
                score:this.score + score
              }
            }
          }
        }        
      }
      return false;
    }
  },
  straight:{
    score:4000,
    Test(str) {
      const cards = [/A/,"Ace", /K/,"King", /Q/,"Queen", /J/,"Jack", /10/,"Ten", /9/,"Nine", /8/,"Eight",
                  /7/,"Seven", /6/,"Six", /5/,"Five", /4/,"Four", /3/,"Three", /2/,"Two"];

      for(let i=0;i<cards.length-8;i+=2) {
        if(cards[i].test(str) && cards[i+2].test(str) && cards[i+4].test(str) 
            && cards[i+6].test(str) && cards[i+8].test(str)) {
          return {
            name: `Straight (${cards[i+1]})`,
            score: this.score + (cards.length-i)/2
          }
        }
      }
      return false; 
    }          
  },
  threeKind:{
    score:3000,
    Test(str) {
      const cards = ["A","Ace", "K","King", "Q","Queen", "J","Jack", "10","Ten", "9","Nine", "8","Eight",
                  "7","Seven", "6","Six", "5","Five", "4","Four", "3","Three", "2","Two"];  
      let three;
      let name;
      let score = 0;
      let count = 0;
      for (let i=0; i<cards.length-1; i+=2) {
        let re = new RegExp(cards[i],"g");
        if (str.match(re) && str.match(re).length===3) {
          three = cards[i];
          name = `Three of a kind (${cards[i+1]})`;
          score += 13*(cards.length-i)/2;
          break;
        }
      }
      if (three) {
        for (let i=0; i<cards.length-1; i+=2) {
          let re = new RegExp(cards[i]);
          if (cards[i]!==three && re.test(str)) {
            score += (cards.length-i)/2;
            count++;
            if(count===2) {
              return {
                name:name,
                score:this.score + score
              }             
            }
            break;
          }
        }
      }
      return false;
    }
  },
  twoPairs:{
    score:2000,
    Test(str) {
      const cards = ["A","Ace", "K","King", "Q","Queen", "J","Jack", "10","Ten", "9","Nine", "8","Eight",
                  "7","Seven", "6","Six", "5","Five", "4","Four", "3","Three", "2","Two"];  

      let pair;
      let pair2;
      let name;
      let score = 0;
      for (let i=0; i<cards.length-1; i+=2) {
        let re = new RegExp(cards[i],"g");
        if (str.match(re) && str.match(re).length===2) {
          pair = cards[i];
          name = cards[i+1];
          score +=13*(cards.length-i)/2;
          break;          
        }
      }
      if (pair) {
        for (let i=0; i<cards.length-1; i+=2) {
          let re = new RegExp(cards[i],"g");
          if (cards[i]!==pair && str.match(re) && str.match(re).length===2) {
            pair2 = cards[i];
            name += ` and ${cards[i+1]}`;
            score +=13*(cards.length-i)/2;
            break;     
          }
        }
      }
      if (pair2) {
        for (let i=0; i<cards.length-1; i+=2) {
          let re = new RegExp(cards[i]);
          if (cards[i]!==pair && cards[i]!==pair2 && re.test(str)) {
            score += (cards.length-i)/2;
            return {
              name: `Two Pairs (${name})`,
              score: this.score + score
            }          
          }
        }
      }
      return false;
    }
  },
  pair:{
    score:1000,
    Test(str) {
      const cards = ["A","Ace", "K","King", "Q","Queen", "J","Jack", "10","Ten", "9","Nine", "8","Eight",
                  "7","Seven", "6","Six", "5","Five", "4","Four", "3","Three", "2","Two"];  
      let score = 0;
      let pair;
      let name = "";
      let count = 0;
      for (let i=0; i<cards.length-1; i+=2) {
        let re = new RegExp(cards[i],"g");
        if (str.match(re) && str.match(re).length===2) {
          pair = cards[i];
          score += 13*(cards.length-i)/2;
          name = `Pair (${cards[i+1]})`;
          break;
        }
      }
      if (pair) {
        for (let i=0; i<cards.length-1; i+=2) {
          let re = new RegExp(cards[i]);
          if (cards[i]!==pair && re.test(str)) {
            score += (cards.length-i)/2;
            count++;
            if(count===3) {
              return {
                name: name,
                score: this.score + score
              } 
            }
          }
        }
      }
      return false;
    }
  },
  highCard:{
    score:0,
    Test(str) {
      const cards = [/A/,"Ace", /K/,"King", /Q/,"Queen", /J/,"Jack", /10/,"Ten", /9/,"Nine", /8/,"Eight",
                  /7/,"Seven", /6/,"Six", /5/,"Five", /4/,"Four", /3/,"Three", /2/,"Two"];
      let score = 0;
      let name = "";
      let count = 0;
      for (let i=0; i<cards.length-1; i+=2) {
        if (cards[i].test(str)) {
          if(!name) name=`High Card (${cards[i+1]})`;
          score+=(cards.length-i)/2;
          count++;
          if(count===5) {
            return {
              name:name,
              score:this.score + score
            }
          }
        }
      }            
    }
  }
};

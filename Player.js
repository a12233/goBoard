// Agents that represent either a player or an AI
function Player(color){
    this.color = color;
}

Player.prototype.myTurn = function(){
    this.game.setCurrentColor(this.color);
    // gameInfo.setText((function(string){
    //     return string.charAt(0).toUpperCase() + string.slice(1);
    // })(this.color)+"'s turn.");
    // gameInfo.setColor(this.color);
    // gameInfo.setBlinking(false);
};

Player.prototype.watch = function(){};

Player.prototype.setGo = function(r,c){
    return this.game.setGo(r, c, this.color);
};

function HumanPlayer(color, game){
    Player.call(this, color, game);
}

HumanPlayer.prototype = new Player();

HumanPlayer.prototype.myTurn = function(){
    Player.prototype.myTurn.call(this);
    this.game.toHuman(this.color);
};

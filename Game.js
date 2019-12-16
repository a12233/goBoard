$(document).ready(function(){
    var game = new Game($(".go-board"), $(".board tbody"));
    
    var adjustSize = adjustSizeGen();

    $(window).resize(adjustSize);

    adjustSize();

    game.mode='hvh';
    game.init(new HumanPlayer("black"), new HumanPlayer("white"));
    game.start();
    $("#new-game").on('click', function(){
        try{
            game.white.worker.terminate();
            game.black.worker.terminate();
        }catch(e){}
        game.mode='hvh';
        game.init(new HumanPlayer("black"), new HumanPlayer("white"));
        game.start();
    });
    $("#undo-button").on('click', function(){
        game.undo();
    });
    window.gameInfo = (function(){
        var blinking = false,
            text = "",
            color = "";

        var self = {};

        self.getBlinking = function(){
            return blinking;
        };

        var mainObj = $("#game-info");
        self.setBlinking = function(val){
            if(val !== blinking){
                blinking = val;
                if(val){
                    mainObj.addClass("blinking");
                }else{
                    mainObj.removeClass("blinking");
                }
            }
        };

        self.getText = function(){
            return text;
        };

        var textObj = $("#game-info>.cont");
        self.setText = function(val){
            text = val;
            textObj.html(val);
        };

        self.getColor = function(){
            return color;
        };

        var colorObj = $("#game-info>.go");
        self.setColor = function(color){
            colorObj.removeClass("white").removeClass("black");
            if(color){
                colorObj.addClass(color);
            }
        };

        return self;
    })();
});
/*************************************************************************** */
function Game(boardElm, boardBackgroundElm){
    this.mode = "hvh";
    this.rounds = 0;
    var white, black,
        playing = false,
        history = [],
        players = {},
        board = new Board(boardElm, boardBackgroundElm),
        currentColor = "black";

    board.clicked = function(r, c){
        var p = players[currentColor];
        if(p instanceof HumanPlayer){
            p.setGo(r, c);
        }
    };

    this.getCurrentPlayer = function(){
        return players[currentColor];
    };

    this.setCurrentColor = function(color){
        currentColor = color;
    };

    this.toHuman = function(color){
        board.setClickable(true, color);
    };

    this.toOthers = function(){
        board.setClickable(false);
    };

    this.update = function(r, c, color){
        if(playing){
            this.rounds++;
            board.updateMap(r, c, color);
            black.watch(r, c, color);
            white.watch(r, c, color);
            setTimeout(progress, 0);
        }
    };

    function progress(){
        if(currentColor === 'black'){
            white.myTurn();
        }else{
            black.myTurn();
        }
    }

    this.setGo = function(r, c, color){
        if(!playing || board.isSet(r, c))return false;
        history.push({
            r: r,
            c: c,
            color:color
        });
        board.highlight(r, c);
        board.setGo(r, c, color);

        var result = board.getGameResult(r, c, color);

        if(result === "draw"){
            this.draw();
        }else if(result === "win"){
            this.win();
            board.winChange(r, c, color);
        }else{
            this.update(r, c, color);
        }
        return true;
    };

    this.undo = function(){
        if(!history.length)return;
        var last = history.pop();
        board.unsetGo(last.r,last.c);
        
        var last = history[history.length - 1];
        if(history.length > 0) board.highlight(last.r, last.c);
        else board.unHighlight();
        players[last.color].other.myTurn();
    };

    this.draw = function(){
        playing = false;
        board.setClickable(false);
    };

    this.win = function(){
        playing = false;
        board.setClickable(false);
        // showWinDialog(this);
    };

    this.init = function(player1, player2){
        console.log(player1, player2);
        this.rounds = 0;
        history = [];
        board.init();
        players = {};
        players[player1.color] = player1;
        players[player2.color] = player2;
        white = players['white'];
        black = players['black'];
        white.game = this;
        black.game = this;
        white.other = black;
        black.other = white;
        if(!(black instanceof HumanPlayer)){
            board.setWarning(0, true);
        }

        if(!(white instanceof HumanPlayer)){
            board.setWarning(1, true);
        }
    };

    this.start = function(){
        playing = true;
        players.black.myTurn();
    };
}
function adjustSizeGen(){
    var smallScreen = navigator.userAgent.toLowerCase().match(/(iphone|ipod)/);

    var gameRegion = $("#game-region"),
        tds = $('.board td'),
        board = $('.go-board'),
        gameHeader = $('header.game-ult'),
        gameInfo = $('#game-info'),
        mainButs = $('#main-but-group'),
        otherButs = $('#other-but-group');

    return function(){
        var avaih = window.innerHeight,
            avaiw = window.innerWidth,
            h = Math.max(avaih - 7, avaih * 0.98),
            w = Math.max(avaiw - 7, avaih * 0.98),
            vspace = Math.min(h - 150, w),
            hspace = Math.min(w - 320, h - 40),
            hsize;

        if(smallScreen){
            if(avaih > avaiw){
                vspace = avaiw;
                hspace = 0;
            }else{``
                hspace = avaih - 40;
                vspace = 0;
            }
        }

        if(vspace > hspace){
            hsize = Math.min(~~((vspace - 15) / 15 / 2), ~~((avaiw - 22) / 15 / 2));
            gameRegion.css({
                'padding': hsize+6,
                'margin-left': -((2*hsize+1)*15+12)/2,
                'padding-top': 100+hsize,
                'padding-bottom': 50+hsize,
                'margin-top':  -(15 * hsize + 82)
            });
            tds.css('padding',hsize);
            board.css({
                'top': 100,
                'bottom': 50,
                'left': 6,
                'right': 6
            });
            gameHeader.css('line-height', 80+'px');
            gameInfo.css({
                'top': 20,
                'width': ((2*hsize+1)*15+12)/2-150
            });
            mainButs.css({
                'top': 6,
                'right': 6,
                'width': 160
            });
            otherButs.css({
                'bottom': 6,
                'right': 6,
                'width': 160
            });
        }else{
            hsize = ~~((hspace - 15) / 15 / 2);
            gameRegion.css({
                'padding': hsize+6,
                'margin-left': -((2*hsize+1)*15+320)/2,
                'padding-left': 160+hsize,
                'padding-right': 160+hsize,
                'padding-top': 36+hsize,
                'margin-top': -(hsize * 15 + 28)
            });
            tds.css('padding',hsize);
            board.css({
                'top': 36,
                'bottom': 6,
                'left': 160,
                'right': 160
            });
            gameHeader.css('line-height', 36+hsize+'px');
            gameInfo.css({
                'left': 15,
                'top': 36+hsize,
                'width': 160+6-45-hsize/2
            });
            mainButs.css({
                'top': 36+hsize,
                'right': 6,
                'width': 160
            });
            otherButs.css({
                'bottom': 6+hsize,
                'right': 6,
                'width': 160
            });
        }

    };
}

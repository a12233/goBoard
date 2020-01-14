$(document).ready(function(){
    var gameRegion = "<div id='game-region'></div>"
    $("#myGame").append("<div data-role='page' data-theme='w' id='game-page' class='no-background'></div").append("<div data-role='content' class='center no-padding'></div>").append(gameRegion)
    $("#game-region").append("<header class='game-ult'>Gomoku</header>", "<div id='main-but-group' class='game-ult'></div>","<div id='myBoard'></div>")
    $("#main-but-group").append("<button id='new-game'>New Game</button>","<button id='undo-button'>Undo</button>")
    var goBoard = "<div class='go-board' data-enhance=false></div>"
    var boardBody = "<table class='board' data-enhance=false><tbody></tbody></table>"
    $("#myBoard").append(goBoard,boardBody)
    var game = new Game($(".go-board"), $(".board tbody"));
    var adjustSize = adjustSizeGen();
    $(window).resize(adjustSize);
    adjustSize();
    game.mode='hvh';
    game.init(new Player("black"), new Player("white"));
    game.start();
    $("#new-game").on('click', function(){
        game.mode='hvh';
        game.init(new Player("black"), new Player("white"));
        game.start();
    });
    $("#undo-button").on('click', function(){
        game.undo();
    });
});
/*************************************************************************** */
function Game(boardplace, boardBackgroundplace){
    this.mode = "hvh";
    this.rounds = 0;
    var white, black,
        playing = false,
        history = [],
        players = {},
        board = new Board(boardplace, boardBackgroundplace),
        currentColor = "black";

    board.clicked = function(r, c){
        players[currentColor].setGo(r, c);
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
        history.push({ //Game history 
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
        if(!(black instanceof Player)){
            board.setWarning(0, true);
        }

        if(!(white instanceof Player)){
            board.setWarning(1, true);
        }
    };

    this.start = function(){
        playing = true;
        players.black.myTurn();
    };
}

//formatting 
function adjustSizeGen(){
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

        // if(smallScreen){
        //     if(avaih > avaiw){
        //         vspace = avaiw;
        //         hspace = 0;
        //     }else{``
        //         hspace = avaih - 40;
        //         vspace = 0;
        //     }
        // }

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
/************************************************************************/
function Place(r, c, board, boardSize){
    // a place for go on the board
    var place = document.createElement("div");
    place.className = "go-place";

    var s = place.style;
    s.top = r/boardSize*100+'%',
    s.left = c/boardSize*100+'%',
    s.right = 100-(c+1)/boardSize*100+'%',
    s.bottom = 100-(r+1)/boardSize*100+'%',
    s.position = 'absolute';

    var inner = document.createElement("div");
    inner.className = "go";
    place.appendChild(inner);

    place.onclick = function(){
        board.clicked(r, c);
    };
    
    place = $(place);
    this.place = place;
    this.isSet = false;
}

Place.prototype.set = function(color){
    this.place.addClass("set").addClass(color).removeClass("warning");
    this.isSet = true;``
};

Place.prototype.unset = function(){
    this.place.removeClass("black").removeClass("white").removeClass("set").removeClass("last-move");
    this.isSet = false;
};

Place.prototype.highlight = function(){
    this.place.addClass("last-move");
};

Place.prototype.warns = function(){
    this.place.addClass("warning");
};

Place.prototype.unwarns = function(){
    this.place.removeClass("warning");
};
/***************************************************************************** */
var Board = function(boardplace, backgroundplace){
    var squares = document.createDocumentFragment();
    var boardSize = 15; 

    //create squares , boardSize -1 
    for(var i = 0; i < boardSize-1; i++){
        var row = document.createElement("tr");
        for(var j = 0; j < boardSize-1; j++){
            row.appendChild(document.createElement("td"));
        }
        squares.appendChild(row);
    }
    backgroundplace.append(squares);

    var clickable = true,
        places = [],
        map = [],
        numToColor = ["black", "white"],
        colorToNum = (function(){
            var obj = {};
            numToColor.forEach(function(place, ind){
                obj[place] = ind;
            });
            return obj;
        })(),
        moves = [
            [1,0],
            [0,1],
            [1,1],
            [1,-1]
        ],
        setNum = 0;

    var intersections = document.createDocumentFragment();

    //intersections = board size 
    for(var r = 0; r < boardSize; r++){
        places.push([]);
        for(var c = 0; c < boardSize; c++){
            places[r].push(new Place(r, c, this, boardSize));
            intersections.appendChild(places[r][c].place[0]);
        }
    }
    [[7, 7],[3, 3], [3, 11], [11, 3], [11, 11]].forEach(function(e){
        places[e[0]][e[1]].place.addClass("go-darkdot");
    });

    boardplace.append(intersections);


    //init move history? 
    (function(){
        for (var i=0;i<2;i++){
            var tmp=[];
            for(var j=0;j<4;j++){
                var tmpp=[];
                for(var k=0;k<15;k++){
                    var tmpr=[];
                    for(var l=0;l<15;l++){
                        tmpr.push(1);
                    }
                    tmpp.push(tmpr);
                }
                tmp.push(tmpp);
            }
            map.push(tmp);
        }
    })();


    this.setClickable = function(yes, color){
        clickable = yes;
        if(yes){
            boardplace.addClass("playing");
        }else{
            boardplace.removeClass("playing");
        }
        if(color){
            boardplace.removeClass("black").removeClass("white").addClass(color);
        }
    };

    this.setGo = function(r, c, color){
        places[r][c].set(color);
        setNum++;
    };

    this.unsetGo = function(r, c){
        places[r][c].unset();
        this.updateMap(r, c);
        setNum--;
    };

    this.highlight = function(r,c){
        this.unHighlight();
        places[r][c].highlight();
    };

    this.unHighlight = function(){
        $(".last-move").removeClass("last-move");
    };

    //check win condition 
    this.winChange = function(r, c, color){
        boardplace.find(".warning").removeClass("warning");
        var num = colorToNum[color],
            dir;
        for(var i = 0; i < 4; i++){
            if(map[num][i][r][c] >= 5){
                dir = i;
                break;
            }
        }
        $(".go-place").css("opacity", 0.5);
        for(var i = -1; i < 2; i += 2){
            var rr = r, cc = c;
            do{
                places[rr][cc].place.css("opacity", 1);
                rr += moves[dir][0] * i;
                cc += moves[dir][1] * i;
            }while(rr >= 0 && rr < 15 && cc >= 0 && cc < 15 && map[num][dir][rr][cc] == -num);
        }
    };

    this.isSet = function(r, c){
        return places[r][c].isSet;
    };

    this.getGameResult = function(r, c, lastColor){
        var n = colorToNum[lastColor];
        if(map[n].some(function(e){
            return e[r][c] > 4;
        })){
            return "win";
        }
        if(setNum === 225){
            return "draw";
        }
        return false;
    };

    this.init = function(){
        boardplace.find(".warning").removeClass("warning");
        boardplace.find(".go-place").css("opacity", "");
        this.unHighlight();
        setNum = 0;
        map.forEach(function(color){
            color.forEach(function(direction){
                direction.forEach(function(row){
                    row.forEach(function(column, ind){
                        row[ind] = 1;
                    });
                });
            });
        });
        places.forEach(function(row){
            row.forEach(function(p){
                p.unset();
            });
        });
    };

    var warnings = [false, false];

    this.setWarning = function(num, shouldWarn){
        warnings[num] = !!shouldWarn;
    };

    function updateWarning(r,c,num,dir){
        if(warnings[num]){
            if(map[num][dir][r][c] > 4){
                places[r][c].warns();
            }else{
                places[r][c].unwarns();
            }
        }
    }
    window.m = map;
    this.updateMap = function(r,c,color){
        var remove=false, num = colorToNum[color];
        if(num === undefined){
            remove = true;
        }
        _updateMap(r,c,num,remove);
    };

    function _updateMap(r,c,num,remove){
        if(remove){
            for(num = 0;num < 2; num++){
                for(var i = 0; i < 4; i++){
                    map[num][i][r][c] = 1;
                    updateWarning(r, c, num, i);
                    //coefficient
                    for(var coe= -1; coe < 2; coe += 2){
                        var x = r, y = c,len = 0;
                        do{
                            x += moves[i][0]*coe;
                            y += moves[i][1]*coe;
                            len++;
                        }while(x >= 0 && y >= 0 && x < 15 && y < 15 && map[num][i][x][y] === -num);
                        if(x >= 0 && y >= 0 && x < 15 && y < 15&& map[num][i][x][y]>0){
                            map[num][i][x][y] = len;
                            updateWarning(x,y,num,i);
                            map[num][i][r][c] += len - 1;
                            updateWarning(r,c,num,i);
                            var cont = 0, mx = x + moves[i][0] * coe, my = y + moves[i][1] * coe;
                            while(mx >= 0 && my >= 0 && mx < 15 && my < 15 && map[num][i][mx][my] === -num){
                                cont++;
                                mx += moves[i][0]*coe;
                                my += moves[i][1]*coe;
                            }
                            map[num][i][x][y] += cont;
                            updateWarning(x,y,num,i);
                        }else{
                            map[num][i][r][c] += len - 1;
                            updateWarning(r,c,num,i);
                        }
                    }
                }
            }
        }else{
            for(var i = 0; i < 4; i++)for(var coe =- 1; coe < 2; coe += 2){
                //update for the current color
                var x = r, y = c;
                do{
                    x += moves[i][0] * coe;
                    y += moves[i][1] * coe;
                }while(x >= 0 && y >= 0 && x < 15 && y < 15 && map[num][i][x][y] === -num);
                if(x >= 0 && y >= 0 && x < 15 && y < 15 && map[num][i][x][y] > 0){
                    map[num][i][x][y] = map[num][i][r][c]+1;
                    var cont = 0, mx = x + moves[i][0] * coe, my = y + moves[i][1] * coe;
                    while(mx >= 0 && my >= 0 && mx < 15 && my < 15 && map[num][i][mx][my] === -num){
                        cont++;
                        mx += moves[i][0] * coe;
                        my += moves[i][1] * coe;
                    }
                    map[num][i][x][y] += cont;
                    updateWarning(x, y, num, i);
                }
                //update for the other color
                x = r;
                y = c;
                do{
                    x += moves[i][0] * coe;
                    y += moves[i][1] * coe;
                }while(x >= 0 && y >= 0 && x < 15 && y < 15 && map[1-num][i][x][y] == num - 1);
            }
            for(var i = 0; i < 2; i++)for(var j = 0; j < 4; j++){
                map[i][j][r][c] = -num;
                updateWarning(r,c,num,i);
            }
        }
    }
};
/* ************************************************************************/
function Player(color){
    this.color = color;
}
Player.prototype.myTurn = function(){
    this.game.setCurrentColor(this.color);
    this.game.toHuman(this.color);
};
Player.prototype.setGo = function(r,c){
    return this.game.setGo(r, c, this.color);
};

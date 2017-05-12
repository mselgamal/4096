
/*
 * tile {
    number:
    x:
    y:
    value:
    htmlElement:
 }
 **/

main();

function main() {
    
    var grid = []; // 4 by 4 2-D grid
    var hasStateChanged = false;    // if state is true then grid state has changes
    var score = 0;
    var rows = 4;
    var cols = 4;
    
    window.onload = function () {
        document.getElementById('newgame-btn').onclick = newGame;
        createGrid();
        printGrid(); // prints all grid contents to browser console
        window.addEventListener('keyup',move);
        window.addEventListener('keydown',function (event) {
            event.preventDefault();
        });
        var s = document.getElementById('best-score-value');
        var bestscore = localStorage.getItem("bestscore");
        if (bestscore) {
            s.innerHTML = bestscore;
        } else {
            s.innerHTML = 0;
            localStorage.setItem("bestscore","0");
        }
        
    };
    
    function newGame() {
        for (i = 0; i < rows ;i++) {
            for (idx = 0; idx < cols ;idx++) {
                makeTileEmpty(grid[i][idx]);
            }
        }
        score = 0;
        updateScore();
        insertRndNumTile(2);
    }
    
    function updateScore() {
        var s = document.getElementById('score-value');
        s.innerHTML = score;
    }
    
    // creates Grid
    function createGrid() {
        var tileNum = 1;
        var prevX = 0, prevY = 0;
        for (i = 0; i < rows ;i++) {
            grid[i] = [];
            for (idx = 0; idx < cols ;idx++) {
                var tile = {};
                tile.number = tileNum;
                tile.value = 0;
                tile.htmlElement = createTile(tileNum++,prevX,prevY);
                tile.y = Number(tile.htmlElement.get(0).attr('y'));
                tile.x = Number(tile.htmlElement.get(0).attr('x'));
                prevX += 100;
                grid[i][idx] = tile;
            }
            prevX = 0;
            prevY += 100;
        }
        
        updateScore();
        insertRndNumTile(2);
    }
    
    // inserts a random numbered tile with value 2
    function insertRndNumTile(num) {
        if (!num) {
            num = 1;
        }
        var count = 0;
        var length = 0;
        while (count < num) {
            var r = Math.floor(Math.random() * 4);
            var c = Math.floor(Math.random() * 4);
            console.log("rnd [r][c]: "+r+" "+c);
            var tile = grid[r][c];
            if (tile.value === 0) {
                count++;
                makeRndTileNumbered(tile,4);
            } else {
                length++;
                console.log('Length: '+length);
                continue;
            }   
        }
    }
    
    // prints grid to browser console
    function printGrid() {
        for (i = 0; i < grid.length ;i++) {
            for (idx = 0; idx < grid[i].length ;idx++) {
                console.log(grid[i][idx]);
            }
        }
    }

    function isGameOver() {
        for (let i = 0; i < grid.length ;i++) {
            for (let j = 1; j < grid[i].length ;j++) {
                if (grid[i][j-1].value === grid[i][j].value) {
                    return false;
                } else if (grid[j-1][i].value === grid[j][i].value) {
                    return false;
                } else if (grid[i][j-1].value === 0 || grid[i][j].value === 0) {
                    return false;
                } else if (grid[j-1][i].value === 0 || grid[j][i].value === 0) {
                    return false;
                }
            }
        }

        return true;
    }

    function isGameWon() {
        for (let i = 0; i < grid.length ;i++) {
            for (let j = 0; j < grid[i].length ;j++) {
                if (grid[i][j].value === 4096) {
                    return true;
                }
            }
        }

        return false;
    }
    
    /*
     * call back function
     * when keyboard right,left,up,down is detected this function is called
     */
    function move(event) {
        var x = event.keyCode;
        hasStateChanged = false;
        
        switch (x) {
            case 37:
                console.log('left');
                moveLeftOrRight(shiftTilesLeft);
                break;
            case 38:
                console.log('up');
                moveUpOrDown(shiftTilesRight);
                break;
            case 39:
                console.log('right');
                moveLeftOrRight(shiftTilesRight);
                break;
            case 40:
                console.log('down');
                moveUpOrDown(shiftTilesLeft);
                break;
            default:
        }
        
        updateScore();    
        console.log('gridState: ' + hasStateChanged);
        var bestscore = localStorage.getItem('bestscore');
        if (score > bestscore) { 
            localStorage.setItem('bestscore',score+"");
            var s = document.getElementById('best-score-value');
            s.innerHTML = score;
        }

        if (isGameWon()) {
            alert("Game Over! you WON!! : )");
        }else if (isGameOver()) {
            alert("Game Over! you lost");
        } else if (hasStateChanged) {
            insertRndNumTile();
        }


    }
    
    // slide tiles up or down
    function moveUpOrDown(shiftTiles) {
        var row = [];
        var idx = 0;
        
        for (var i = 0; i < grid.length ;i++) {
            idx = 0;
            for (var l = grid.length-1; l >= 0  ;l--) {
                row[idx++] = grid[l][i];
            }
            var newRow = shiftTiles(row);
            updateRow(newRow,row);
        }
    }
    
    // slide tiles left or right
    function moveLeftOrRight(shiftTiles) {
        var i = 0;
        while ( i < grid.length) {
            var newRow = shiftTiles(grid[i]);
            updateRow(newRow,grid[i]);
            i++;
        }
    }
    
    /*
     * shift tiles to the left:
     *  - check if you have two pairs, if true then collapse pairs and push to furthest left slots
     *  - Otherwise, split the row by half until you have 1 block, preform the right checks and insert the block
     *    in the correct row position.
     *
     *    return a new row with the correct order.
     */
    function shiftTilesLeft(row) {
        var newRow;
        var temp1 = checkForPairs(row);
        var temp2 = checkForPattern(row);
        
        if (temp1.length === 2) {
            newRow = temp1;
        } else if (temp2.length === 2) {
            newRow = temp2;
        } else {
            newRow = [0,0,0,0];
            var rowState = {hasChanged:0};
            var currRow = splitRow(row);
            splitThenShiftL(currRow[0],newRow,rowState);
            splitThenShiftL(currRow[1],newRow,rowState);
            console.log(newRow);
            
            return newRow;
        }
        
        var i = 0;
        while (i++ < row.length-2) {
            newRow.push(0); 
        }
        
        console.log(newRow);
        return newRow;
    }
    
    // shiftTilesLeft helper function
    function splitThenShiftL(half,row,state) {
        if (half.length > 1) {
            var halfs = splitArray(half);
            splitThenShiftL(halfs[0],row,state);
            splitThenShiftL(halfs[1],row,state);
        } else if (half.length === 1) {
            for (i = 0; i < row.length ;i++) {
                if (row[i] === 0) {
                    row[i] = half[0];
                    break;
                } else if (row[i] === half[0] && state.hasChanged === 0 && row[i+1] === 0) {
                    state.hasChanged = 1;
                    row[i] += half[0];
                    score += row[i];
                    break;
                }
            }
        }
    }
    
    /*
     * shift tiles to the right:
     *  - check if you have two pairs, if true then collapse pairs and push to furthest right slots
     *  - Otherwise, split the row by half until you have 1 block, preform the right checks and insert the block
     *    in the correct row position.
     *
     *    return a new row with the correct order.
     */
    function shiftTilesRight(row) {
        var newRow;
        var temp1 = checkForPairs(row);
        var temp2 = checkForPattern(row);
        
        if (temp1.length === 2) {
            newRow = temp1;
        } else if (temp2.length === 2) {
            newRow = temp2;
        } else {
            newRow = [0,0,0,0];
            var rowState = {hasChanged:0};
            var currRow = splitRow(row);
            splitThenShiftR(currRow[1],newRow,rowState);
            splitThenShiftR(currRow[0],newRow,rowState);
            console.log(newRow);
            
            return newRow;
        }
        
        var i = 0;
        while (i++ < row.length-2) {
            newRow.unshift(0); 
        }
        
        console.log(newRow);
        return newRow;
    }
    
    // shiftTilesRight helper function
    function splitThenShiftR(half,row,state) {
        if (half.length > 1) {
            var halfs = splitArray(half);
            splitThenShiftR(halfs[1],row,state);
            splitThenShiftR(halfs[0],row,state);
        } else if (half.length === 1) {
            for (i = row.length-1; i >= 0 ;i--) {
                if (row[i] === 0) {
                    row[i] = half[0];
                    break;
                } else if (row[i] === half[0] && state.hasChanged === 0 && row[i-1] === 0) {
                    state.hasChanged = 1;
                    row[i] += half[0];
                    score += row[i];
                    break;
                }
            }
        }
    }
    
    // splits a row of tile objects in half and returns both halfs
    function splitRow(row) {
        var left = [];
        var right = [];
        
        for ( i = 0,idx = 0; i < row.length ;i++) {
            if (i < row.length/2) {
                left[i] = row[i].value;
            } else {
                right[idx++] = row[i].value;
            }
        }
        
        return [left,right];
    }
    
    // splits an array of values in half and returns both halfs
    function splitArray(row) {
        var left = [];
        var right = [];
        
        for ( i = 0,idx = 0; i < row.length ;i++) {
            if (i < row.length/2) {
                left[i] = row[i];
            } else {
                right[idx++] = row[i];
            }
        }
        
        return [left,right];
    }
    
    // checks if a row has 2 pairs, XXYY
    // return [] or return [X^2,Y^2]
    function checkForPairs(row) {
        var result = [];
        
        for (i = 1 ; i < row.length/2 ;i++) {
            if (row[0].value === 0 || row[0].value !== row[i].value) {
                return [];
            }
        }
        
        for (idx = row.length/2+1; idx < row.length ;idx++) {
            if (row[row.length/2].value === 0 || row[row.length/2].value !== row[idx].value) {
                return [];
            }
        }
        
        result[0] = row[0].value * row.length/2;
        result[1] = row[row.length-1].value * row.length/2;
        score += result[0] + result[1];
        
        return result;
    }
    
    // checks if a row has pattern of XXXX or pattern of XYXY, where x != y
    // return [] or return [X^2,Y^2]
    function checkForPattern(row) {
        var result = [];
        var prev = null;
        
        for (var i = 0; i < row.length ;i += 2) {
            if (prev === null) {
                prev = row[i];
            } else if (prev.value !== row[i].value || prev.value === 0) {
                return [];
            }
            prev =  row[i];
        }
        
        prev = null;
        for (var idx = 1; idx < row.length ;idx += 2) {
            if (prev === null) {
                prev = row[idx];
            } else if (prev.value !== row[idx].value || prev.value === 0) {
                return [];
            }
            prev = row[idx];
        }
        
        result[0] = row[0].value * row.length/2;
        result[1] = row[row.length-1].value * row.length/2;
        score += result[0] + result[1];
        
        return result;
    }
    
    // copies the content of one row to another
    function updateRow(newRow,currRow) {
        var i = 0;
        while (i < newRow.length) {
            
            if (newRow[i] !== currRow[i].value && newRow[i] !== 0) {
                hasStateChanged = true;
            }
                        
            if (newRow[i] === 0 && currRow[i].value !== 0) {
                makeTileEmpty(currRow[i]);
            } else if (newRow[i] !== 0 && currRow[i].value === 0) {
                makeTileNumbered(currRow[i],newRow[i]);
            } else if (newRow[i] !== 0 && currRow[i].value !== 0) {
                makeTileEmpty(currRow[i]);
                makeTileNumbered(currRow[i],newRow[i]);
            }
            i++;
        }
    }
    
    // makes a tile empty, by changing tile object values
    function makeTileEmpty(tile) {
        
        if (!tile) {
            tile = currentTile;
        }
        
        var rec = SVG.get('rec-'+tile.number);
        rec.fill('grey');
        tile.value = 0;
        var text = SVG.get('value-'+tile.number);
        text.text('');
    }
    
    // create a tile and return <g></g> object
    function createTile(num,x,y) {
        var draw = SVG('grid');
        var g = draw.group();
        var rect = draw.rect(100, 100).fill('grey').attr('stroke','black').attr('x',x+5).attr('y',y+5).attr('id',('rec-'+num));
        var text = draw.plain('').attr('x',Number(x)+40).attr('y',Number(y)+20).attr('font-size','30').attr('id',('value-'+num)).attr('text-anchor','middle');
        g.add(rect);
        g.add(text);
        return g;
    }
    
    // makes a tile numbered, by changing tile object values and assigning a number
    function makeRndTileNumbered(tile,value) {
        
        if (!tile && !value) {
            tile = currentTile;
            value = updateValue;
        }
        
        var rec = SVG.get('rec-'+tile.number);
        rec.animate(400,'-',100).rotate(360);
        rec.fill('AntiqueWhite');
        tile.value = value;
        var text = SVG.get('value-'+tile.number);
        text.text(value+"");
    }
    
    // makes a tile numbered, by changing tile object values and assigning a number
    function makeTileNumbered(tile,value) {
        
        if (!tile && !value) {
            tile = currentTile;
            value = updateValue;
        }
        
        var rec = SVG.get('rec-'+tile.number);
        rec.fill('AntiqueWhite');
        tile.value = value;
        var text = SVG.get('value-'+tile.number);
        text.text(value+"");
    }
    
}

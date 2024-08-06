const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const SCREEN_W = 12
const SCREEN_H = 20
const BLOCK_SIZE = 20

let screen = Array(SCREEN_H*SCREEN_W);

// ブロック
let blockX = 5;
let blockY = 0;

const blockShape = [1,1,0,0,
                    1,1,0,0]

// 入力ハンドラー
document.addEventListener('keydown', keyDownHandler, false);

function keyDownHandler(event) {
    if (event.key === 'Left' || event.key === 'ArrowLeft') {
        if (!outOfArea(blockX-1, blockY, blockShape))
            blockX -= 1;
    } 

    if (event.key === 'Right' || event.key === 'ArrowRight') {
        if (!outOfArea(blockX+1, blockY, blockShape))
            blockX += 1;
    }

    if (event.key === 'd') {
        if (!outOfArea(blockX, blockY+1, blockShape)
            && !blockHit(blockX, blockY+1, blockShape))
            blockY += 1;
    }

    if (event.key == 'r') {
        init();
    }
}

function drawRect(x,y, block) {
    context.strokeStyle = '#fff';
    context.lineWidth = 2;
    context.strokeRect((x+1) * BLOCK_SIZE, (y+1) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    if (block==1) {
        context.fillStyle = '#fff'
        context.fillRect((x+1) * BLOCK_SIZE, (y+1) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
}

function drawScreen() {
    for (j = 0; j < SCREEN_H; j++) {
        for (i = 0; i < SCREEN_W; i++) {
            block = screen[ i + j*SCREEN_W ];
            drawRect(i, j, block);
        }
    }
}

function hasBrick(x,y) {
    return 0!=screen[x + y*SCREEN_W];
}

function doFuncOnShape(shape, f) {
    if (shape == undefined) return;
    for (j = 0; j < 2; j++) {
        for (i = 0; i < 4; i++) {
            if (shape[i+j*4]==1) {
                f(i, j)
            }
        }
    }
}

function outOfArea(x, y, shape) {
    let flg = false;
    doFuncOnShape(shape, function (i,j) {
        if (x+i < 0 || x+i >= SCREEN_W || y+i >= SCREEN_H)
            flg = true;
    });
    return flg;
}

function drawBlock(x, y, shape) {
    doFuncOnShape(shape, function (i,j) {
        drawRect(x+i, y+j, 1);
    });
}

function blockHit(x, y, shape) {
    // ブロックの形データ4 x 2を見ていく
    for (j = 0; j < 2; j++) {
        for (i = 0; i < 4; i++) {
            if (shape[i+j*4]==1) {
                if (hasBrick(x+i, y+j))
                    return true;
            }
        }
    }
    return false;
}

function putBlock(x, y, shape) {
    // ブロックの形データ4 x 2を見ていく
    for (j = 0; j < 2; j++) {
        for (i = 0; i < 4; i++) {
            if (shape[i+j*4]==1) {
                setBrick(x+i, y+j, 1);
            }
        }
    }
}
function setBrick(x, y, block) {
    screen[x + y*SCREEN_W] = block;
}


function lineIsComplete(line) {
    for (i = 0; i < SCREEN_W-1; i++) {
        if (screen[i + line*SCREEN_W]==0)
            return false;
    }
    return true;
}

function checkLineComplete() {
    do {
        deleted_line = false;
        for (j = SCREEN_H-1; j >=0 ; j--) {
            if (lineIsComplete(j)) {
                deleteLine(j);
                j++;
                deleted_line = true;
            }
        }
    } while (deleted_line);
}

function deleteLine(line) {
    for (j = line-1; j >= 0; j--) {
        copyLine(j,j+1);
    }
}

function copyLine(src, tgt) {
    for (i = 0; i < SCREEN_W; i++) {
        screen[i + tgt*SCREEN_W] = screen[i + src*SCREEN_W];
    }
}


const WAIT_COUNT = 40;
let wait_count = 0;

function is_in_interval(count) {
    wait_count += 1;
    if (wait_count < count) {
        return true;
    }
    wait_count = 0;
    return false;
}

function update() {
    if (is_in_interval(WAIT_COUNT))
        return;

    if (blockHit(blockX, blockY+1, blockShape)) {
        putBlock(blockX, blockY, blockShape); // ブロックを積み上げる
        blockY = 0;
        return;
    }

    checkLineComplete(); 

    blockY += 1; 
}

function draw_text_center(text, font='30px Consolas') {
    context.font = font;
    context.textAlign = 'left';
    text_w = context.measureText(text).width;
    context.fillText(text, canvas.width/2-text_w/2, canvas.height/2);
}

function init() {
    screen.fill(0);
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawScreen();
    drawBlock(blockX, blockY, blockShape);
    update();
}

init();

setInterval(draw, 10);

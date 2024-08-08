const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const SCREEN_W = 12
const SCREEN_H = 20
const BLOCK_SIZE = 20

let screen = Array(SCREEN_H*SCREEN_W);

// ブロック
let blockX = 5;
let blockY = 0;
let rotate = 0;

const blockShapeTable = [
    [1,1,0,0,
     1,1,0,0], // O type
    [1,1,1,1,
     0,0,0,0], // I type
    [0,1,1,0,
     1,1,0,0], // S type
    [1,1,0,0,
     0,1,1,0], // Z type
    [1,0,0,0,
     1,1,1,0], // L type
    [0,0,1,0,
     1,1,1,0], // J type
    [1,1,1,0,
     0,1,0,0], // T type
]

let blockShape;

// 入力ハンドラー
document.addEventListener('keydown', keyDownHandler, false);

function keyDownHandler(event) {
    if (event.key === 'Left' || event.key === 'ArrowLeft') {
        if (!blockHit(blockX-1, blockY, blockShape, rotate))
            blockX -= 1;
    } 

    if (event.key === 'Right' || event.key === 'ArrowRight') {
        if (!blockHit(blockX+1, blockY, blockShape, rotate))
            blockX += 1;
    }

    if (event.key === 'd') {
        if (!blockHit(blockX, blockY+1, blockShape, rotate))
            blockY += 1;
    }

    if (event.key === 'x') {
        new_rotate = (rotate+1)%4;
        if (!blockHit(blockX, blockY+1, blockShape, new_rotate))
            rotate = new_rotate;
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
    if (x < 0 || x >= SCREEN_W || y >= SCREEN_H)
        return true;
    return 0!=screen[x + y*SCREEN_W];
}

function drawBlock(x, y, shape, rotate) {
    for (j = 0; j < 2; j++) {
        for (i = 0; i < 4; i++) {
            if (shape[i+j*4]==1) {
                switch(rotate) {
                case 0: drawRect(x+i, y+j, 1); break;
                case 1: drawRect(x+j, y-i, 1); break;
                case 2: drawRect(x-i, y-j, 1); break;
                case 3: drawRect(x-j, y+i, 1); break;
                }
            }
        }
    }
}

function blockHit(x, y, shape, rotate) {
    // ブロックの形データ4 x 2を見ていく
    for (j = 0; j < 2; j++) {
        for (i = 0; i < 4; i++) {
            if (shape[i+j*4]==1) {
                flg = false;
                switch(rotate) {
                case 0: flg = hasBrick(x+i, y+j); break;
                case 1: flg = hasBrick(x+j, y-i); break;
                case 2: flg = hasBrick(x-i, y-j); break;
                case 3: flg = hasBrick(x-j, y+i); break;
                }
                if (flg) return true;
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
                switch(rotate) {
                case 0: flg = setBrick(x+i, y+j,1); break;
                case 1: flg = setBrick(x+j, y-i,1); break;
                case 2: flg = setBrick(x-i, y-j,1); break;
                case 3: flg = setBrick(x-j, y+i,1); break;
                }
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

    if (blockHit(blockX, blockY+1, blockShape, rotate)) {
        putBlock(blockX, blockY, blockShape, rotate); // ブロックを積み上げる
        initFallBlock();
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

function initFallBlock() {
    blockX = 5;
    blockY = 0;
    rotate = 0;
    bsi = Math.floor(Math.random()*5);
    blockShape = blockShapeTable[bsi];
}

function init() {
    initFallBlock();
    screen.fill(0);
    rotate = 0;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawScreen();
    drawBlock(blockX, blockY, blockShape, rotate);
    update();
}

init();

setInterval(draw, 10);

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const State = {
    STANBY: 0,
    GAME: 1,
    GAME_OVER: 2
}

// パドル
let padX = canvas.width / 2;
const padY = canvas.height - 60;
const padWidth = 100;
const padHeight = 20;
let padSpeed = 0;

// ボール
const ballRadius = 10;
let ballX;
let ballY;
let ballSpeedX;
let ballSpeedY;

// ゲーム状態管理
let gameState = State.STANBY;
let score = 0;
let high_score = 0;

// 入力ハンドラー
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function drawBall() {
    context.fillStyle = '#fff';
    context.fillRect(ballX-ballRadius/2, ballY-ballRadius/2, ballRadius*2, ballRadius*2);
}

function drawPaddle() {
    context.fillStyle = '#fff';
    context.fillRect(padX, padY, padWidth, padHeight);
}

function keyDownHandler(event) {
    if (event.key === 'Left' || event.key === 'ArrowLeft') {
        padSpeed = -10;
    } 

    if (event.key === 'Right' || event.key === 'ArrowRight') {
        padSpeed = +10;
    }

    if (event.key == 's') {
        if (gameState == State.STANBY) gameState = State.GAME;
    }
    if (gameState == State.GAME_OVER) gameState = State.STANBY; 
}

function keyUpHandler(event) {
}

function isHitPaddle() {
    if (ballX+ballRadius < padX) {
        return false;
    }
    if (ballX-ballRadius > padX+padWidth) {
        return false;
    }
    if (ballY+ballRadius < padY) {
        return false;
    }
    if (ballY-ballRadius  > padY+padHeight) {
        return false;
    }
    return true;
}

function update() {

    // ボールの位置を更新
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // ボールの位置が下の境界を超えたらゲームオーバー
    if (ballY + ballRadius > canvas.height) {
        gameState = State.GAME_OVER;
    }

    // ボールの位置が上の境界に触れたら跳ね返って点数追加
    if(ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
        score += 1;
    }

    // ボールの位置が左右の境界を超えたときの処理
    if (ballX - ballRadius < 0 || ballX + ballRadius > canvas.width) {
        ballSpeedX = -ballSpeedX;
    }

    padX += padSpeed;
    if (padX < 0) padX = 0;
    if (padX + padWidth > canvas.width) padX = canvas.width - padWidth;
    if (padSpeed > 0) padSpeed -= 1;
    if (padSpeed < 0) padSpeed += 1;

    if (isHitPaddle()) {
        if (padSpeed != 0) {
            dx = padSpeed > 0 ? 1 : -1;
            if (Math.abs(ballSpeedX+dx) >= 1 && Math.abs(ballSpeedX+dx) <= 3) 
                ballSpeedX += dx; 
        }
        if (ballY >= padY && ballY <= padY+padHeight) {
            ballSpeedX = -ballSpeedX;
        }
        ballSpeedY = -ballSpeedY;
    }

}

function draw_text_center(text, font='30px Consolas') {
    context.font = font;
    context.textAlign = 'left';
    text_w = context.measureText(text).width;
    context.fillText(text, canvas.width/2-text_w/2, canvas.height/2);
}

function draw_scores() {
    context.font = '20px Consolas';
    context.textAlign = 'left';

    score_text = 'Score: ' + score;
    context.fillText(score_text, 10, canvas.height-10);

    hscore_text = 'High Score: ' + high_score;
    context.fillText(hscore_text, canvas.width-200, canvas.height-10);
}

function init() {
    // パドル位置の初期化
    padX = canvas.width / 2 - padWidth/2;
    // ボールの位置の初期化
    ballX = padX + padWidth/2; 
    ballY = padY - ballRadius*2;
    ballSpeedX = 2;
    ballSpeedY = -2;
    // スコア初期化
    if (high_score < score) high_score = score;
    score = 0;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    draw_scores();
    drawBall();
    drawPaddle();
    switch (gameState) {
    case State.STANBY:
        init();
        draw_text_center("Press 'S' Key to Start");
        break;
    case State.GAME:
        update();
        break;
    case State.GAME_OVER:
        draw_text_center("Game Over!!");
        break;
    }
}

setInterval(draw, 10);

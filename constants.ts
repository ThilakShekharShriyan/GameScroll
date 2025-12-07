
import { Game } from './types';

// Helper for Mock Ad Banner
// Empty by default. If an ad exists, the system injects the code to overwrite this.
const DRAW_AD_CODE = `
function drawAd(ctx) {
    // No-op by default. 
    // Ad logic is injected by the ad manager if a sponsor is available.
}
`;

// ------------------------------------------------------------------
// 1. FLAPPY BIRD (FASTER)
// ------------------------------------------------------------------
export const FLAPPY_CODE = `
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400; canvas.height = 600;

let frames = 0;
const state = { current: 0, getReady: 0, game: 1, over: 2 };

${DRAW_AD_CODE}

let score = { value: 0, best: 0 };

let bird = {
    x: 50, y: 150, speed: 0, gravity: 0.35, jump: 5.5, radius: 12,
    draw: function() {
        ctx.fillStyle = "#ec4899";
        ctx.fillRect(this.x-10, this.y-10, 20, 20);
    },
    update: function() {
        if (state.current == state.getReady) { this.y = 150; } 
        else {
            this.speed += this.gravity;
            this.y += this.speed;
            if (this.y + this.radius >= 550) {
                this.y = 550;
                if (state.current == state.game) state.current = state.over;
            }
        }
    },
    move: function() { this.speed = -this.jump; }
}

const pipes = {
    position: [], w: 50, h: 400, gap: 140, dx: 4,
    draw: function() {
        ctx.fillStyle = "#22c55e";
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            ctx.fillRect(p.x, p.y, this.w, this.h);
            ctx.fillRect(p.x, p.y + this.h + this.gap, this.w, this.h);
        }
    },
    update: function() {
        if (state.current !== state.game) return;
        if (frames % 90 == 0) this.position.push({ x: 400, y: -150 * (Math.random() + 1) });
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            let bottom = p.y + this.h + this.gap;
            if (bird.x+10 > p.x && bird.x-10 < p.x + this.w && (bird.y-10 < p.y + this.h || bird.y+10 > bottom)) state.current = state.over;
            p.x -= this.dx;
            if (p.x + this.w <= 0) {
                this.position.shift();
                score.value += 1;
            }
        }
    },
    reset: function() { this.position = []; }
}

window.addEventListener("keydown", function(evt) {
    if (evt.code === "Space") {
        if(state.current === state.getReady) state.current = state.game;
        else if(state.current === state.game) bird.move();
        else { pipes.reset(); bird.speed = 0; score.value = 0; state.current = state.getReady; bird.y=150; }
    }
});

function loop() {
    try {
        // CLEAR_CANVAS
        ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, 400, 600);
        
        pipes.update(); pipes.draw();
        bird.update(); bird.draw();
        
        ctx.fillStyle="#334155"; ctx.fillRect(0, 550, 400, 50);

        ctx.fillStyle = "#FFF"; ctx.font = "35px sans-serif"; ctx.textAlign = "center";
        if (state.current == state.game) ctx.fillText(score.value, 200, 50);
        else if (state.current == state.over) {
            ctx.fillText("Score: " + score.value, 200, 80);
            drawAd(ctx);
        } else ctx.fillText("Get Ready!", 200, 300);
        
        frames++;
        requestAnimationFrame(loop);
    } catch(e) {}
}
loop();
`;

// ------------------------------------------------------------------
// 2. RETRO SNAKE
// ------------------------------------------------------------------
export const SNAKE_CODE = `
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400; canvas.height = 600;
const grid = 20;
let count = 0;
let snake = { x: 160, y: 160, dx: grid, dy: 0, cells: [], maxCells: 4 };
let apple = { x: 320, y: 320 };
let gameOver = false;
let score = 0;
${DRAW_AD_CODE}
function loop() {
  requestAnimationFrame(loop);
  if (gameOver) {
      // CLEAR_CANVAS
      ctx.fillStyle = 'black'; ctx.fillRect(0,0,400,600);
      
      ctx.fillStyle = 'red'; ctx.textAlign = 'center'; ctx.fillText("GAME OVER", 200, 300);
      drawAd(ctx); return;
  }
  if (++count < 3) return; count = 0;
  
  // CLEAR_CANVAS
  ctx.clearRect(0,0,400,600);
  ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,400,600);

  snake.x += snake.dx; snake.y += snake.dy;
  if (snake.x < 0) snake.x = 400 - grid; else if (snake.x >= 400) snake.x = 0;
  if (snake.y < 0) snake.y = 600 - grid; else if (snake.y >= 600) snake.y = 0;
  snake.cells.unshift({x: snake.x, y: snake.y});
  if (snake.cells.length > snake.maxCells) snake.cells.pop();
  ctx.fillStyle = '#ec4899'; ctx.fillRect(apple.x, apple.y, grid-2, grid-2);
  ctx.fillStyle = '#10b981';
  snake.cells.forEach((cell, i) => {
    ctx.fillRect(cell.x, cell.y, grid-1, grid-1);
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++; score++;
      apple.x = Math.floor(Math.random() * 20) * grid; apple.y = Math.floor(Math.random() * 30) * grid;
    }
    for (let j = i + 1; j < snake.cells.length; j++) if (cell.x === snake.cells[j].x && cell.y === snake.cells[j].y) gameOver = true;
  });
}
document.addEventListener('keydown', e => {
  if (e.which === 37 && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
  else if (e.which === 38 && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
  else if (e.which === 39 && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
  else if (e.which === 40 && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }
  else if (gameOver && e.code === 'Space') { gameOver=false; snake.maxCells=4; snake.x=160; snake.y=160; score=0; }
});
requestAnimationFrame(loop);
`;

// ------------------------------------------------------------------
// 3. BREAKOUT (NEW)
// ------------------------------------------------------------------
export const BREAKOUT_CODE = `
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400; canvas.height = 600;

${DRAW_AD_CODE}

// Game Objects
const paddle = { x: 150, y: 550, w: 100, h: 10, dx: 0, speed: 7 };
const ball = { x: 200, y: 300, r: 6, dx: 4, dy: 4 };
const bricks = [];
const brickInfo = { w: 35, h: 15, padding: 5, offX: 25, offY: 30, rows: 6, cols: 9 };

let score = 0;
let state = 'playing'; // playing, gameover, won

// Init Bricks
for(let c=0; c<brickInfo.cols; c++) {
    bricks[c] = [];
    for(let r=0; r<brickInfo.rows; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Controls
let rightPressed = false;
let leftPressed = false;
document.addEventListener("keydown", (e) => {
    if(e.key == "Right" || e.key == "ArrowRight") rightPressed = true;
    else if(e.key == "Left" || e.key == "ArrowLeft") leftPressed = true;
    else if(e.code == "Space" && state !== 'playing') document.location.reload();
});
document.addEventListener("keyup", (e) => {
    if(e.key == "Right" || e.key == "ArrowRight") rightPressed = false;
    else if(e.key == "Left" || e.key == "ArrowLeft") leftPressed = false;
});

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fillStyle = "#38bdf8"; // Sky blue
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.fillStyle = "#10b981"; // Emerald
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for(let c=0; c<brickInfo.cols; c++) {
        for(let r=0; r<brickInfo.rows; r++) {
            if(bricks[c][r].status == 1) {
                const brickX = (c*(brickInfo.w+brickInfo.padding)) + brickInfo.offX;
                const brickY = (r*(brickInfo.h+brickInfo.padding)) + brickInfo.offY;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickInfo.w, brickInfo.h);
                // Neon gradient colors based on row
                ctx.fillStyle = r % 2 === 0 ? "#f472b6" : "#c084fc"; 
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for(let c=0; c<brickInfo.cols; c++) {
        for(let r=0; r<brickInfo.rows; r++) {
            const b = bricks[c][r];
            if(b.status == 1) {
                if(ball.x > b.x && ball.x < b.x+brickInfo.w && ball.y > b.y && ball.y < b.y+brickInfo.h) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    if(score == brickInfo.rows*brickInfo.cols) {
                        state = 'won';
                    }
                }
            }
        }
    }
}

function loop() {
    // CLEAR_CANVAS
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state === 'playing') {
        drawBricks();
        drawBall();
        drawPaddle();
        collisionDetection();

        // 1. Wall Collisions (Left/Right)
        if(ball.x + ball.dx > canvas.width-ball.r || ball.x + ball.dx < ball.r) {
            ball.dx = -ball.dx;
        }

        // 2. Ceiling Collision
        if(ball.y + ball.dy < ball.r) {
            ball.dy = -ball.dy;
        }
        
        // 3. Paddle Collision
        // Check if ball is moving down and overlaps paddle rect
        if (
            ball.dy > 0 &&
            ball.x > paddle.x && 
            ball.x < paddle.x + paddle.w &&
            ball.y + ball.r >= paddle.y && 
            ball.y - ball.r <= paddle.y + paddle.h
        ) {
             ball.dy = -ball.dy * 1.05; // Bounce & Speed up
             ball.y = paddle.y - ball.r - 2; // Prevent sticking
        }

        // 4. Game Over (Floor)
        if (ball.y - ball.r > canvas.height) {
            state = 'gameover';
        }

        ball.x += ball.dx;
        ball.y += ball.dy;

        // Paddle Move
        if(rightPressed && paddle.x < canvas.width-paddle.w) paddle.x += paddle.speed;
        else if(leftPressed && paddle.x > 0) paddle.x -= paddle.speed;

        // Score
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Score: "+score, 8, 20);

    } else {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        if (state === 'gameover') {
            ctx.font = '40px sans-serif';
            ctx.fillText("GAME OVER", 200, 300);
            drawAd(ctx);
        } else {
            ctx.font = '40px sans-serif';
            ctx.fillText("YOU WON!", 200, 300);
        }
        ctx.font = '20px sans-serif';
        ctx.fillText("Press Space to Restart", 200, 350);
    }

    requestAnimationFrame(loop);
}

loop();
`;

// ------------------------------------------------------------------
// 4. TYPING DEFENSE (NEW)
// ------------------------------------------------------------------
export const TYPING_CODE = `
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400; canvas.height = 600;

${DRAW_AD_CODE}

const WORDS = ["CODE", "JAVA", "REACT", "HTML", "CSS", "NODE", "FLUX", "GRID", "LOOP", "VARS", "BYTE", "MEGA", "GIGA", "TECH", "DATA", "BIOS", "SYNC", "WIFI", "DISK", "FILE"];

let fallingWords = [];
let score = 0;
let lives = 5;
let spawnRate = 120;
let frame = 0;
let inputBuffer = "";
let gameOver = false;

class FallingWord {
    constructor() {
        this.text = WORDS[Math.floor(Math.random() * WORDS.length)];
        this.x = Math.random() * (350 - 50) + 50;
        this.y = -20;
        this.speed = Math.random() * 1.5 + 0.5;
        this.color = "#34d399";
    }
    draw() {
        ctx.font = "bold 20px monospace";
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
        
        // Highlight matched part
        if (inputBuffer.length > 0 && this.text.startsWith(inputBuffer)) {
             ctx.fillStyle = "#fbbf24"; // Amber highlight
             ctx.fillText(inputBuffer, this.x, this.y);
        }
    }
    update() {
        this.y += this.speed;
    }
}

window.addEventListener('keydown', (e) => {
    if (gameOver) {
        if (e.code === 'Space') document.location.reload();
        return;
    }
    
    if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
        inputBuffer += e.key.toUpperCase();
        checkInput();
    } else if (e.key === 'Backspace') {
        inputBuffer = inputBuffer.slice(0, -1);
    }
});

function checkInput() {
    // Find matching word
    const matchIndex = fallingWords.findIndex(w => w.text === inputBuffer);
    if (matchIndex !== -1) {
        // Destroy word
        fallingWords.splice(matchIndex, 1);
        score += 10;
        inputBuffer = "";
        
        // Visual flare (mock)
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,400,600); 
    } else {
        // Check if any word starts with input, if not reset buffer
        const partialMatch = fallingWords.some(w => w.text.startsWith(inputBuffer));
        if (!partialMatch) {
            inputBuffer = ""; // Wrong key resets in this hard mode
        }
    }
}

function loop() {
    // CLEAR_CANVAS
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 400, 600);

    if (!gameOver) {
        frame++;
        if (frame % spawnRate === 0) {
            fallingWords.push(new FallingWord());
            if (spawnRate > 40) spawnRate--;
        }

        // Draw HUD
        ctx.fillStyle = "white";
        ctx.font = "16px sans-serif";
        ctx.fillText("Score: " + score, 20, 30);
        ctx.fillText("Lives: " + lives, 320, 30);
        
        ctx.fillStyle = "#64748b";
        ctx.font = "24px monospace";
        ctx.textAlign = "center";
        ctx.fillText(inputBuffer, 200, 550);

        // Update Words
        for (let i = fallingWords.length - 1; i >= 0; i--) {
            const w = fallingWords[i];
            w.update();
            w.draw();

            if (w.y > 600) {
                fallingWords.splice(i, 1);
                lives--;
                if (lives <= 0) gameOver = true;
            }
        }
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0,0,400,600);
        
        ctx.textAlign = "center";
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 40px sans-serif";
        ctx.fillText("SYSTEM FAILURE", 200, 250);
        
        ctx.fillStyle = "white";
        ctx.font = "20px sans-serif";
        ctx.fillText("Final Score: " + score, 200, 300);
        ctx.fillText("Press Space to Reboot", 200, 340);
        
        drawAd(ctx);
    }

    requestAnimationFrame(loop);
}

loop();
`;

// ------------------------------------------------------------------
// 5. WORDLE (NEW)
// ------------------------------------------------------------------
export const WORDLE_CODE = `
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400; canvas.height = 600;

${DRAW_AD_CODE}

const WORDS = [
    "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE", "BADLY", "BAKER", "BASES", "BASIC", "BASIS", "BEACH", "BEGAN", "BEGIN", "BEGUN", "BEING", "BELOW", "BENCH", "BILLY", "BIRTH", "BLACK", "BLAME", "BLIND", "BLOCK", "BLOOD", "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CALIF", "CARRY", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLOCK", "CLOSE", "COACH", "COAST", "COULD", "COUNT", "COURT", "COVER", "CRAFT", "CRASH", "CREAM", "CRIME", "CROSS", "CROWD", "CROWN", "CURVE", "CYCLE", "DAILY", "DANCE", "DATED", "DEALT", "DEATH", "DEBUG", "DEBUT", "DELAY", "DEPTH", "DOING", "DOUBT", "DRAFT", "DRAMA", "DREAM", "DRESS", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FIBER", "FIELD", "FIFTH", "FIFTY", "FIGHT", "FINAL", "FIRST", "FIXED", "FLASH", "FLEET", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT", "FRUIT", "FULLY", "FUNNY", "GIANT", "GIVEN", "GLASS", "GLOBE", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRASS", "GREAT", "GREEN", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HAPPY", "HARRY", "HEART", "HEAVY", "HENCE", "HENRY", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "ISSUE", "JAPAN", "JIMMY", "JOINT", "JONES", "JUDGE", "KNOWN", "LABEL", "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LEWIS", "LIGHT", "LIMIT", "LINKS", "LIVES", "LOCAL", "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYING", "MAGIC", "MAJOR", "MAKER", "MARCH", "MARIA", "MATCH", "MAYBE", "MAYOR", "MEANT", "MEDIA", "METAL", "MIGHT", "MINOR", "MINUS", "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NEEDS", "NEVER", "NEWLY", "NIGHT", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCCUR", "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "PAINT", "PANEL", "PAPER", "PARTY", "PEACE", "PETER", "PHASE", "PHONE", "PHOTO", "PIECE", "PILOT", "PITCH", "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "QUEEN", "QUICK", "QUIET", "QUITE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "READY", "REFER", "RIGHT", "RIVAL", "RIVER", "ROBIN", "ROGER", "ROMAN", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SCALE", "SCENE", "SCOPE", "SCORE", "SENSE", "SERVE", "SEVEN", "SHALL", "SHAPE", "SHARE", "SHARP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOWN", "SIGHT", "SINCE", "SIXTH", "SIXTY", "SIZED", "SKILL", "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE", "SMITH", "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPENT", "SPLIT", "SPOKE", "SPORT", "STAFF", "STAGE", "STAND", "START", "STATE", "STEAM", "STEEL", "STICK", "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET", "TABLE", "TAKEN", "TASTE", "TAXES", "TEACH", "TEETH", "TEXAS", "THANK", "THEFT", "THEIR", "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW", "THROW", "TIGHT", "TIMES", "TIRED", "TITLE", "TODAY", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIN", "TREAT", "TREND", "TRIAL", "TRIED", "TRIES", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE", "UNDER", "UNDUE", "UNION", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOICE", "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST", "WRITE", "WRONG", "WROTE", "YIELD", "YOUNG", "YOUTH"
];
const TARGET = WORDS[Math.floor(Math.random() * WORDS.length)];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
let guesses = [];
let currentGuess = "";
let gameOver = false;
let message = "";
let shake = 0;

const COLORS = {
    correct: '#538d4e',
    present: '#b59f3b',
    absent: '#3a3a3c',
    default: '#121213',
    text: '#ffffff',
    border: '#3a3a3c',
    filledBorder: '#565758'
};

function drawGrid() {
    const boxSize = 60;
    const gap = 5;
    const startX = (400 - (5 * boxSize + 4 * gap)) / 2 + (shake > 0 ? Math.sin(shake) * 5 : 0);
    const startY = 50;

    for (let i = 0; i < MAX_GUESSES; i++) {
        for (let j = 0; j < WORD_LENGTH; j++) {
            let letter = "";
            let color = COLORS.default;
            let borderColor = COLORS.border;

            if (i < guesses.length) {
                letter = guesses[i][j];
                const targetLetter = TARGET[j];
                // Simple presence check
                if (letter === targetLetter) color = COLORS.correct;
                else if (TARGET.includes(letter)) color = COLORS.present;
                else color = COLORS.absent;
                borderColor = color;
            } else if (i === guesses.length) {
                if (j < currentGuess.length) {
                    letter = currentGuess[j];
                    borderColor = COLORS.filledBorder;
                }
            }

            ctx.fillStyle = color;
            ctx.fillRect(startX + j * (boxSize + gap), startY + i * (boxSize + gap), boxSize, boxSize);
            
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(startX + j * (boxSize + gap), startY + i * (boxSize + gap), boxSize, boxSize);

            if (letter) {
                ctx.fillStyle = COLORS.text;
                ctx.font = "bold 32px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(letter, startX + j * (boxSize + gap) + boxSize/2, startY + i * (boxSize + gap) + boxSize/2 + 2);
            }
        }
    }
}

function loop() {
    ctx.fillStyle = '#121213';
    ctx.fillRect(0, 0, 400, 600);

    drawGrid();
    if(shake > 0) shake--;

    if (message) {
        ctx.fillStyle = "white";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(message, 200, 480);
    }
    
    if (gameOver) {
         drawAd(ctx);
         ctx.fillStyle = "white";
         ctx.font = "16px sans-serif";
         ctx.textAlign = "center";
         ctx.fillText("Press Space to Play Again", 200, 505);
    } else {
        ctx.fillStyle = "#565758";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Type with your keyboard", 200, 580);
    }

    requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
    if (gameOver) {
        if (e.code === 'Space') document.location.reload();
        return;
    }

    const key = e.key.toUpperCase();

    if (key === 'ENTER') {
        if (currentGuess.length === 5) {
            if (WORDS.includes(currentGuess)) {
                guesses.push(currentGuess);
                if (currentGuess === TARGET) {
                    message = "SPLENDID!";
                    gameOver = true;
                } else if (guesses.length >= MAX_GUESSES) {
                    message = "ANSWER: " + TARGET;
                    gameOver = true;
                }
                currentGuess = "";
            } else {
                message = "Not in word list";
                shake = 20;
                setTimeout(() => message = "", 1500);
            }
        } else {
             message = "Not enough letters";
             shake = 20;
             setTimeout(() => message = "", 1500);
        }
    } else if (key === 'BACKSPACE') {
        currentGuess = currentGuess.slice(0, -1);
        message = "";
    } else if (key.length === 1 && key.match(/[A-Z]/) && currentGuess.length < 5) {
        currentGuess += key;
        message = "";
    }
});

loop();
`;

// ------------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------------

export const MOCK_GAMES: Game[] = [
  {
    id: '1',
    title: 'Wordle Unlimited',
    description: 'Guess the 5-letter word.',
    creator: 'WordMaster',
    code: WORDLE_CODE,
    likes: 12500,
    isLiked: true,
    comments: 2,
    commentsList: [
        { id: 'c1', username: 'PuzzleQueen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', text: 'Harder than NYT but I love it!', createdAt: Date.now() - 3600000 },
        { id: 'c2', username: 'DevGuy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', text: 'Clean implementation.', createdAt: Date.now() - 7200000 }
    ],
    shares: 2200,
    tags: ['puzzle', 'brain', 'viral'],
    createdAt: Date.now(),
    sponsoredBy: undefined
  },
  {
    id: '2',
    title: 'Neon Snake',
    description: 'Hyper speed snake.',
    creator: 'RetroFan',
    code: SNAKE_CODE, 
    likes: 3200,
    isLiked: false,
    comments: 1,
    commentsList: [
        { id: 'c3', username: 'SpeedRunner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', text: 'This is too fast!!!', createdAt: Date.now() - 1000000 }
    ],
    shares: 45,
    tags: ['puzzle', 'retro', 'neon'],
    createdAt: Date.now() - 100000,
    sponsoredBy: undefined
  }
];

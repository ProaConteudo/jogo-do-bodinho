const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const rankingList = document.getElementById('rankingList');

// Carregar imagens
const bodinhoImg = new Image();
bodinhoImg.src = 'bodinho.png';

const bolaImg = new Image();
bolaImg.src = 'bola.png';

// Cores do Canal GOAT (para elementos visuais opcionais)
const colorGOATYellow = '#FFD700';
const colorGOATBlack = '#000000';

// Bodinho
const bodinhoWidth = 40; // Tamanho ajustado
const bodinhoHeight = 30; // Tamanho ajustado
let bodinhoX = (canvas.width - bodinhoWidth) / 2;
const bodinhoY = canvas.height - bodinhoHeight - 10;
const bodinhoSpeed = 5;

// Bola
const ballRadius = 10; // Tamanho ajustado
let balls = [];
const ballSpeedBase = 2;
const ballSpawnInterval = 1000; // Milissegundos

// Jogo
let score = 0;
let gameInterval;
const gameDuration = 30000; // 30 segundos
let timeLeft = gameDuration / 1000;
let gameStarted = false;
let playerName = '';

// Ranking (simples, armazenado na sessão do navegador com nome do jogador)
let gameHistory = JSON.parse(sessionStorage.getItem('goatRanking')) || [];

function askForName() {
    playerName = prompt("Digite seu nome de GOAT:");
    if (!playerName) {
        playerName = "Jogador Anônimo";
    }
}

function drawBodinho() {
    ctx.drawImage(bodinhoImg, bodinhoX, bodinhoY, bodinhoWidth, bodinhoHeight);
}

function drawBall(ball) {
    ctx.drawImage(bolaImg, ball.x - ballRadius, ball.y - ballRadius, 2 * ballRadius, 2 * ballRadius);
}

function updateBodinho() {
    if (leftPressed && bodinhoX > 0) {
        bodinhoX -= bodinhoSpeed;
    }
    if (rightPressed && bodinhoX < canvas.width - bodinhoWidth) {
        bodinhoX += bodinhoSpeed;
    }
}

function updateBalls() {
    for (let i = 0; i < balls.length; i++) {
        balls[i].y += balls[i].speed;

        // Detectar colisão
        if (balls[i].y + ballRadius > bodinhoY &&
            balls[i].x > bodinhoX &&
            balls[i].x < bodinhoX + bodinhoWidth) {
            score++;
            balls.splice(i, 1);
            i--;
        } else if (balls[i].y > canvas.height + ballRadius) {
            balls.splice(i, 1);
            i--;
        }
    }
}

function spawnBall() {
    const x = Math.random() * (canvas.width - 2 * ballRadius) + ballRadius;
    const speed = ballSpeedBase + Math.random() * 2;
    balls.push({ x, y: -ballRadius, speed });
}

function drawScore() {
    ctx.fillStyle = '#333';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Jogador: ${playerName}`, 10, 20); // Exibe o nome do jogador
    ctx.fillText(`Pontuação: ${score}`, 10, 40);
    ctx.fillText(`Tempo: ${timeLeft.toFixed(1)}s`, 10, 60);
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBodinho();
    for (const ball of balls) {
        drawBall(ball);
    }
    drawScore();
    updateBodinho();
    updateBalls();

    if (timeLeft <= 0) {
        clearInterval(gameInterval);
        endGame();
    }
}

function startGame() {
    askForName(); // Pede o nome do jogador ao iniciar o jogo
    score = 0;
    balls = [];
    bodinhoX = (canvas.width - bodinhoWidth) / 2;
    timeLeft = gameDuration / 1000;
    gameStarted = true;
    startTime = Date.now();
    gameInterval = setInterval(updateGame, 1000 / 60); // 60 FPS
    setInterval(spawnBall, ballSpawnInterval);
}

function endGame() {
    gameStarted = false;
    alert(`Fim de Jogo, ${playerName}! Sua pontuação foi: ${score}`);
    updateRanking(score, playerName); // Passa o nome para a função de ranking
    displayRanking();
}

function getGOATLevel(score) {
    if (score < 10) return "Novato";
    if (score < 30) return "Aspirante a GOAT";
    if (score < 60) return "Quase um GOAT";
    if (score < 100) return "GOAT em Treinamento";
    return "O Bode GOAT";
}

function updateRanking(currentScore, playerName) {
    gameHistory.push({ name: playerName, score: currentScore }); // Salva nome e pontuação
    gameHistory.sort((a, b) => b.score - a.score); // Ordena por pontuação
    sessionStorage.setItem('goatRanking', JSON.stringify(gameHistory));
}

function displayRanking() {
    rankingList.innerHTML = '';
    for (let i = 0; i < Math.min(5, gameHistory.length); i++) {
        const listItem = document.createElement('li');
        listItem.textContent = `${i + 1}. ${gameHistory[i].name}: ${gameHistory[i].score} - Nível: ${getGOATLevel(gameHistory[i].score)}`;
        rankingList.appendChild(listItem);
    }
}

let leftPressed = false;
let rightPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === 'ArrowRight') {
        rightPressed = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key === 'ArrowRight') {
        rightPressed = false;
    }
});

// Iniciar o jogo quando a página carregar
startGame();
displayRanking();

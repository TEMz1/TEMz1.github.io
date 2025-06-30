// ----------------- COUNTDOWN LOGIC ------------------
    let gameStarted = false;
    
    function startCountdown() {
      const overlay = document.getElementById("countdown-overlay");
      const countdownNumber = document.getElementById("countdown-number");
      let count = 3;
      
      const countdownInterval = setInterval(() => {
        if (count > 0) {
          countdownNumber.textContent = count;
          countdownNumber.style.animation = 'none';
          setTimeout(() => {
            countdownNumber.style.animation = 'countdown-pulse 1s ease-in-out';
          }, 10);
          count--;
        } else {
          countdownNumber.textContent = "GO!";
          countdownNumber.style.color = "#4ecdc4";
          setTimeout(() => {
            overlay.style.display = "none";
            gameStarted = true;
            bgm.currentTime = 0;  // Mulai dari awal
            bgm.play();
          }, 1000);
          clearInterval(countdownInterval);
        }
      }, 1000);
    }

    // ----------------- GAME LOGIC ------------------
    let lastPose = "stay";
    const laneCount = 3;
    const laneWidth = 100;
    let currentLane = 1;
    const player = document.getElementById("player");
    const gameContainer = document.getElementById("game-container");
    const scoreEl = document.getElementById("score");
    const highScoreEl = document.getElementById("highscore");
    const gestureEl = document.getElementById("gesture");
    const finishLine = document.getElementById("finish-line");
    let speed = 8.5;
    let speedFinishLine = speed;
    let score = 0;
    let highScore = 0; // Removed localStorage
    let gameOver = false;
    let gameFinish = false;
    let finishLineActive = false;
    const finishScore = 2500;
    const sfxLose = new Audio('sound/explotion.mp3');
    const sfxWin = new Audio('sound/victory.mp3');
    const sfxMove = new Audio('sound/move.mp3');
    const sfxClick = new Audio('sound/click.mp3');
    const bgm = new Audio('sound/backsong.mp3');
bgm.loop = true;          // Biar muter terus
bgm.volume = 0.2;     

    function updatePlayerPosition() {
      player.style.left = currentLane * laneWidth + (300 - laneCount * laneWidth) / 2 + "px";
    }

    function showWinModal() {
    //   document.getElementById("final-score-win").textContent = score;
      document.getElementById("win-modal").style.display = "flex";
    }

    function showLoseModal() {
    //   document.getElementById("final-score-lose").textContent = score;
      document.getElementById("lose-modal").style.display = "flex";
    }

    function endGame() {
      gameOver = true;
      sfxLose.play();
      bgm.pause();            // Stop lagu
      bgm.currentTime = 0;
      setTimeout(() => {
        showLoseModal();
      }, 10);
    }

    function finishGame() {
      gameFinish = true;
      sfxWin.play();
      bgm.pause();            // Stop lagu
      bgm.currentTime = 0;
      setTimeout(() => {
        showWinModal();
      }, 10);
    }

    function restartGame() {
      sfxClick.currentTime = 0;
      sfxClick.play();
      setTimeout(() => {
    location.reload();
  }, 500);
      
    }

    function backHome() {
      sfxClick.currentTime = 0;
      sfxClick.play();
      setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
      
    }

    function createObstacle() {
  const availableLanes = getAvailableLanes();
  if (availableLanes.length === 0) return null; // Semua lane penuh, tidak spawn

  // Random pilih salah satu lane yang kosong
  const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
  
  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  obstacle.style.left = lane * laneWidth + (300 - laneCount * laneWidth) / 2 + "px";
  obstacle.style.top = "0px";
  obstacle.style.width = "60px";
  obstacle.style.height = "80px";
  gameContainer.appendChild(obstacle);
  return obstacle;
}


    function createFinishLine() {
      finishLine.style.top = "0px";
      finishLine.style.display = "block";
      finishLineActive = true;
    }

    function checkCollision(playerRect, obsRect) {
      return !(
        obsRect.bottom < playerRect.top ||
        obsRect.top > playerRect.bottom ||
        obsRect.right < playerRect.left ||
        obsRect.left > playerRect.right
      );
    }

    let obstacles = [];
    
    setInterval(() => {
  if (!gameOver && !gameFinish && gameStarted && Math.random() < (0.7 + speed * 0.01)) {
    const obs = createObstacle();
    if (obs) obstacles.push(obs);

  }
}, 1400);
function getActiveLanes() {
  // Hasil: array lane (0/1/2) yang sedang ada obstacle
  return obstacles
    .filter(obs => {
      const top = parseFloat(obs.style.top);
      return top < 700; // masih aktif di layar
    })
    .map(obs => {
      // cari lane ke berapa dia
      return Math.round((parseFloat(obs.style.left) - (300 - laneCount * laneWidth) / 2) / laneWidth);
    });
}
function getAvailableLanes() {
  const activeLanes = getActiveLanes(); // Sudah kamu buat di atas
  // Ambil array 0,1,2 lalu filter yang tidak aktif
  return Array.from({length: laneCount}, (_, i) => i).filter(i => !activeLanes.includes(i));
}



    function gameLoop() {
      if (gameOver || !gameStarted || gameFinish) {
        if (gameStarted) return;
        requestAnimationFrame(gameLoop);
        return false;
      }

      if (score >= finishScore && !finishLineActive) {
        createFinishLine();
      }

      const playerRect = player.getBoundingClientRect();

      if (finishLineActive) {
        let top = parseFloat(finishLine.style.top);
        top += speedFinishLine;
        finishLine.style.top = top + "px";
        const finishRect = finishLine.getBoundingClientRect();
        if (checkCollision(playerRect, finishRect)) {
          gameFinish = true;
          finishGame();
          return;
        }
        if (top > 700) {
          finishLine.style.display = "none";
          finishLineActive = false;
        }
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        let top = parseFloat(obs.style.top);
        top += speed;
        obs.style.top = top + "px";

        const obsRect = obs.getBoundingClientRect();
        if (checkCollision(playerRect, obsRect)) {
          endGame();
          return;
        }

        if (top > 700) {
          obs.remove();
          obstacles.splice(i, 1);
        }
      }

      score++;
      scoreEl.textContent = score;
      requestAnimationFrame(gameLoop);
    }

    updatePlayerPosition();
    
    // Start countdown first, then game loop
    startCountdown();
    gameLoop();

    // ----------------- GESTURE + CAMERA ------------------
    let model, webcam, ctx;
    const URL = "./my_model/";

    async function initTeachableModel() {
      try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmPose.load(modelURL, metadataURL);
        webcam = new tmPose.Webcam(200, 200, true);
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(loop);

        const canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");
      } catch (error) {
        console.log("Model loading failed, continuing without gesture control");
        gestureEl.textContent = "Camera/Model not available";
      }
    }

    async function loop() {
      if (webcam && model) {
        webcam.update();
        await predict();
        drawCam();
      }
      window.requestAnimationFrame(loop);
    }

    async function predict() {
      if (!model || !webcam) return;
      
      try {
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        const prediction = await model.predict(posenetOutput);

        let highest = prediction.reduce((max, p) =>
          p.probability > max.probability ? p : max
        );

        gestureEl.textContent = highest.className;

        if (highest.probability > 0.9) {
          handlePose(highest.className.toLowerCase());
        }
      } catch (error) {
        console.log("Prediction error:", error);
      }
    }

    function handlePose(pose) {
      if (gameOver || !gameStarted || gameFinish) return;

      if (pose === "left" && lastPose === "stay" && currentLane > 0) {
        currentLane--;
        updatePlayerPosition();
        sfxMove.currentTime = 0;
        sfxMove.play();
      } else if (pose === "right" && lastPose === "stay" && currentLane < laneCount - 1) {
        currentLane++;
        updatePlayerPosition();
        sfxMove.currentTime = 0;
        sfxMove.play();
      }

      lastPose = pose;
    }

    function drawCam() {
      if (!ctx || !webcam) return;
      
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(webcam.canvas, -200, 0);
      ctx.restore();
    }

    // Add keyboard controls as backup
    document.addEventListener('keydown', (event) => {
      if (!gameStarted || gameOver || gameFinish) return;
      
      if (event.key === 'ArrowLeft' && currentLane > 0) {
        currentLane--;
        updatePlayerPosition();
      } else if (event.key === 'ArrowRight' && currentLane < laneCount - 1) {
        currentLane++;
        updatePlayerPosition();
      }
    });

    initTeachableModel();
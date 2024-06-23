
        const canvas = document.querySelector('canvas')
        const ctx = canvas.getContext('2d') //se puede hacer 'webgl', 'webgl2', 'bitmaprenderer'

        canvas.width = 448
        canvas.height = 400

        /* Variables de nuestro juego */

        /* VARIABLE JUEGO EN PAUSA - GAME OVER - WIN*/
        let isPaused = false;
        let gameOver = false;
        let win = false;
        /*SCORE*/
        let score = 0;
        /* VARIABLE DE VIDAS*/
        let lives = 3;
        /* NIVELES */
        let level = 0;
        /* VARIABLES DE LA PELOTA */
        const ballRadius = 3;
        // posicion de la pelota
        let x = canvas.width / 2
        let y = canvas.height - 30

        const BALL_SPEED = 3;
        // velocidad de la pelota , la indicamos con la direccion a la que va
        // si el numero es mas alto, irá mas rapido
        let dx = BALL_SPEED
        // si es - ira hacia abajo, si va positivo ira hacia arriba. 
        // Esto es porque el canvas funciona así.
        let dy = -BALL_SPEED

        /* VARIABLES DE LA PALETA*/ 
        const paddleHeight = 10;
        const paddleWidth = 50;

        let paddleX = (canvas.width - paddleWidth) / 2
        let paddleY = canvas.height - paddleHeight - 10

        let rightPressed = false
        let leftPressed = false

        const PADDLE_SENSITIVITY = 8

        /* VARIABLES DE LOS LADRILLOS*/

        const bricksRowCount = 6;
        const brickColumnCount = 13;
        const brickWidth = 30;
        const brickHeight = 14;
        const brickPadding = 3;
        const brickOffsetTop = 40;
        const brickOffsetLeft = 12;
        const bricks = [];
        const colors = ['#D174FD', '#FDD674', '#FD7474', '#6FBFFE', '#9BDF74', '#DF74D8', '#FD9C3D', '#8B89C0'];


        const BRICK_STATUS = {
            ACTIVE: 1,
            DESTROYED: 0
        }

        for (let c = 0; c < brickColumnCount; c++){
            bricks[c] = [] //inicializamos con un array vacío
            for(let r = 0; r < bricksRowCount; r++){
                //calculamos la posicion del ladrillo en la pantalla
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft 
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop
                //assignar un color aleatorio a un bloque --> truquillo sencillo
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                //guardamos la información de cada ladrillo
                bricks[c][r] = { 
                    x: brickX, 
                    y: brickY, 
                    status: BRICK_STATUS.ACTIVE, 
                    color: randomColor
                };
            }
        }

        function drawBall() {
            // empezamos un camino
            ctx.beginPath()
            //necesitmos las coordenadas, el radio, y los angulos de inicio y de final de nuestro circulo
            ctx.arc(x, y, ballRadius, 0, Math.PI * 2)
            // como lo podemos rellenar
            ctx.fillStyle = '#fff'
            ctx.fill()
            ctx.closePath()
        }

        function drawPaddle() {
            ctx.fillStyle = '#B8B8C4'
            ctx.fillRect(
                paddleX, //la cordenada X
                paddleY, //la cordenada y
                paddleWidth, //el ancho del dibujo
                paddleHeight // el anto del dibujo
            )
        }
        
        function drawBricks () {
            for (let c = 0; c < brickColumnCount; c++){
                for(let r = 0; r < bricksRowCount; r++){
                    const currentBrick = bricks[c][r]
                    if(currentBrick.status === BRICK_STATUS.DESTROYED)
                    continue;
                    ctx.beginPath();
                    ctx.fillStyle = currentBrick.color;
                    
                    ctx.rect(
                        currentBrick.x,
                        currentBrick.y,
                        brickWidth,
                        brickHeight
                    )
                    
                    ctx.fill()
                    ctx.closePath();
                }
            }
        }

        function drawLives() {
            for (let i = 0; i < lives; i++) {
            ctx.beginPath()
            ctx.arc(canvas.width - (20 * (i + 1)), 15, ballRadius + 2, 0, Math.PI * 2);
            ctx.fillStyle = '#fff'
            ctx.fill()
            ctx.closePath()
            }
        }

        function drawScore() {
            ctx.font = '16px monospace';
            ctx.fillStyle = '#fff';
            ctx.fillText('Score: ' + score, 8, 20);
        }

        function collisionDetection () {
            for (let c = 0; c < brickColumnCount; c++){
                for(let r = 0; r < bricksRowCount; r++){
                    const currentBrick = bricks[c][r]
                    if(currentBrick.status === BRICK_STATUS.DESTROYED) continue;
                    
                    const isBallSameXAsBrick =
                        x > currentBrick.x && 
                        x < currentBrick.x + brickWidth
                    
                    const isBallSameYAsBrick =
                        y > currentBrick.y &&
                        y < currentBrick.y + brickHeight

                    if (isBallSameXAsBrick && isBallSameYAsBrick){
                        dy = -dy
                        currentBrick.status = BRICK_STATUS.DESTROYED
                        score += 10;
                    }
                }
            }
        }
        
        function ballMovement () {
            // rebotar las pelotas en los laterales
            if(
                x + dx > canvas.width - ballRadius ||//la pared derecha
                x + dx < ballRadius //Pared izquierda
            ){
                dx = -dx
            }

            //rebotar en la parte de arriba
            if (y + dy < ballRadius) {
                dy = -dy
            }

            //la pelota toca la pala
            const isBallSameXAsPaddle = 
                x > paddleX && 
                x < paddleX + paddleWidth

            const isBallTouchingPaddle =
                y + dy > paddleY 
            
            if (isBallSameXAsPaddle && isBallTouchingPaddle) {
                dy = -dy               
            }
            else if (//la pelota toca el suelo
                y + dy > canvas.height - ballRadius
            ) {
                lives--;
                if(lives === 0){
                    gameOver = true;
                    const gameOverMessage = document.getElementById('gameOverMessage');
                    gameOverMessage.textContent = 'Game Over - Score: ' + score;
                    gameOverMessage.style.display = 'block';
                    togglePause();
                } else { 
                    resetBallAndPaddle()
                }
            }
            x += dx
            y += dy
        }
        
        function paddleMovement() {
            if (rightPressed && paddleX < canvas.width - paddleWidth) {
                paddleX += PADDLE_SENSITIVITY
            } else if (leftPressed && paddleX > 0) {
                paddleX -= PADDLE_SENSITIVITY
            }
        }

        function cleanCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }

        function resetBallAndPaddle() {
            x = canvas.width / 2;
            y = canvas.height - 30;
            dx = 4;
            dy = -4;
            paddleX = (canvas.width - paddleWidth) / 2;
        }

        function checkWin() {
            win = true;
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < bricksRowCount; r++) {
                    if (bricks[c][r].status !== BRICK_STATUS.DESTROYED){
                        win = false;
                        break;
                    } 
                }
                if (!win){
                        break;
                }
            }
        
            if (win) {
                const winMessage = document.getElementById('winMessage');
                winMessage.textContent = 'You Win!! - Score: ' + score;
                winMessage.style.display = 'block';
                togglePause();
                
                // level++;
                // configureGame();
                // resetBallAndPaddle();
                // levelMessage.textContent = `Level ${level + 1}`;
            }
        }

        function initEvents ()  {
            document.addEventListener('keydown', keyDownHandler)
            document.addEventListener('keyup', keyUpHandler)

            function keyDownHandler (event){
                const { key } = event
                if (key === 'Right' || key === 'ArrowRight') {
                    rightPressed = true
                } else if (key === 'Left' || key === 'ArrowLeft') {
                    leftPressed = true
                }
            }

            function keyUpHandler (event) {
            const { key } = event
                if (key === 'Right' || key === 'ArrowRight') {
                    rightPressed = false
                } else if (key === 'Left' || key === 'ArrowLeft') {
                    leftPressed = false
                }
            }

            document.addEventListener('keydown', function(event) {
                if (event.code === 'Space') {
                    if (gameOver || win) {
                            document.location.reload();
                    } else {
                        togglePause();
                    }
                }
            });
        } 

        function togglePause() {
            isPaused = !isPaused;
            const pauseMessage = document.getElementById('pauseMessage');

            if (gameOver || win){
                isPaused === true;
                pauseMessage.style.display = 'none';
            } else if (isPaused) {
                pauseMessage.style.display = 'block';
            } else {
                pauseMessage.style.display = 'none';
                draw(); // Reanuda la animación
            }
        } 

        // const levels = [
        //     {
        //         brickColumnCount: 6,
        //         brickRowCount: 13,
        //         ballSpeed: 3,
        //         paddleSpeed: 8,
        //         lives: 3,
        //     },
        //     {
        //         brickColumnCount: 6,
        //         brickRowCount: 14,
        //         ballSpeed: 4,
        //         paddleSpeed: 10,
        //         lives: 3,
        //     },
        // ];

        // function configureGame() {
        //     const currentLevel = levels[level];
        //     brickColumnCount = currentLevel.brickColumnCount;
        //     brickRowCount = currentLevel.brickRowCount;
        //     ballSpeed = currentLevel.ballSpeed;
        //     paddleSpeed = currentLevel.paddleSpeed;
        //     lives = currentLevel.lives;
        // }

        // const levelMessage = document.getElementById('levelMessage');
        // levelMessage.textContent = `Level ${level + 1}`;



        function draw () {
            
            if (isPaused) return;
            cleanCanvas()
            //Aqui hacemos los dibujos y checks de colisiones
            //primero hay que dibujar los elementos:
            drawBall()
            drawPaddle()
            drawBricks()
            drawLives()
            drawScore()
            
            //colisiones y movimeintos
            collisionDetection()
            ballMovement()
            paddleMovement()
            
            //es una especie de bucle infinito:
            window.requestAnimationFrame(draw) //metodo para ejecutarse justo antes de que se repinte la pantalla. Se hace un loop infinito.

            checkWin()

        }

        draw()
        initEvents()

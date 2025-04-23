let eatSound, gameOverSound, bgMusic;

function preload() {
    eatSound = loadSound("assets/eat.mp3");
    gameOverSound = loadSound("assets/gameover.mp3");
    bgMusic = loadSound("assets/background.mp3");
}

let canvas, game;
function setup() {
    canvas = createCanvas(400, 400);
    userStartAudio();
    game = new Game();
    frameRate(60);

    bgMusic.setVolume(0.3);
    bgMusic.loop();
}

function draw() {
    background(220);
    game.run();
}

class Snake {
    constructor() {
        this.position = [{ x: 200, y: 200 }];
        this.direction = "RIGHT";
        this.nextDirection = "RIGHT";
    }

    move() {
        this.direction = this.nextDirection;
        let head = { ...this.position[0] };
        switch (this.direction) {
            case "UP": head.y -= 10; break;
            case "DOWN": head.y += 10; break;
            case "LEFT": head.x -= 10; break;
            case "RIGHT": head.x += 10; break;
        }
        this.position.unshift(head);
    }

    grow(size) {
        for (let i = 0; i < (size === 15 ? 3 : 1); i++) {
            let tail = { ...this.position[this.position.length - 1] };
            this.position.push(tail);
        }
    }

    check_collision() {
        let head = this.position[0];
        return (
            head.x < 10 || head.y < 10 || head.x >= width - 10 || head.y >= height - 10 ||
            this.position.slice(1).some(part => part.x === head.x && part.y === head.y)
        );
    }
}

class Food {
    constructor() {
        this.spawn_food();
    }

    spawn_food() {
        let x, y;
        do {
            x = Math.floor(random(1, 39)) * 10;
            y = Math.floor(random(1, 39)) * 10;
        } while (x < 10 || y < 10 || x >= width - 20 || y >= height - 20);
        
        this.position = { x, y };
        this.size = random() > 0.5 ? 15 : 10;
    }
}

class Game {
    constructor() {
        this.snake = new Snake();
        this.food = new Food();
        this.running = true;
        this.score = 0;
        this.speed = 150;
        this.lastMoveTime = millis();
    }

    check_food() {
        let head = this.snake.position[0];
        if (head.x === this.food.position.x && head.y === this.food.position.y) {
            let foodSize = this.food.size;
            this.snake.grow(foodSize);
            this.food.spawn_food();
            this.update_score(foodSize);
            eatSound.play();
        }
    }

    check_collision() {
        if (this.snake.check_collision()) {
            this.running = false;
            gameOverSound.play();
            bgMusic.stop();
            alert("Game Over! Score: " + this.score);
            location.reload();
        }
    }

    update_score(size) {
        this.score += size === 15 ? 20 : 10;
    }

    run() {
        let now = millis();
        if (now - this.lastMoveTime > this.speed) {
            if (this.running) {
                this.snake.move();
                this.check_food();
                this.snake.position.pop();
                this.check_collision();
                this.speed = max(30, 150 - this.snake.position.length * 2);
                this.lastMoveTime = now;
            }
        }
        this.draw_game();
    }

    draw_game() {
        fill("#8B0000");
        for (let i = 0; i < width; i += 20) {
            rect(i, 0, 20, 10);
            rect(i, height - 10, 20, 10);
        }
        for (let i = 0; i < height; i += 20) {
            rect(0, i, 10, 20);
            rect(width - 10, i, 10, 20);
        }

        fill("green");
        this.snake.position.forEach(part => {
            rect(part.x, part.y, 10, 10);
        });

        fill(this.food.size === 15 ? "blue" : "red");
        rect(this.food.position.x, this.food.position.y, this.food.size, this.food.size);
    }
}

function keyPressed() {
    const directionMap = { 38: "UP", 40: "DOWN", 37: "LEFT", 39: "RIGHT" };
    if (directionMap[keyCode]) {
        const newDirection = directionMap[keyCode];
        if (
            (newDirection === "UP" && game.snake.direction !== "DOWN") ||
            (newDirection === "DOWN" && game.snake.direction !== "UP") ||
            (newDirection === "LEFT" && game.snake.direction !== "RIGHT") ||
            (newDirection === "RIGHT" && game.snake.direction !== "LEFT")
        ) {
            game.snake.nextDirection = newDirection;
        }
    }
}
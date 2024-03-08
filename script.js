/*

TODO
- fix bullets stuck against edgepieces of walls
- flex hitboxes
- game end

*/


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 800 x 800
// Tank size: 28 x 52


const redTank = new Image();
redTank.src = "./images/redTank.png";
const blueTank = new Image();
blueTank.src = "./images/blueTank.png";
const greenTank = new Image();
greenTank.src = "./images/greenTank.png";
let walls = [];
let players = [];
let bullets = [];
let gameOver = 0;


class Controller {

    static keyboardListener() {

        window.addEventListener("keydown", (event) => {
    
            if (event.isComposing || event.keyCode === 229)
                return;

            for (const player of players) {

                switch (event.code) {

                    case player.schema.up:
                        player.forward = -1;
                        break;
                    
                    case player.schema.left:
                        player.turning = -1;
                        break;
                
                    case player.schema.down:
                        player.forward = 1;
                        break;
            
                    case player.schema.right:
                        player.turning = 1;
                        break;
                    
                    case player.schema.fire:
                        player.firing = true;
                        break;

                }

            }

        });

        window.addEventListener("keyup", (event) => {
    
            if (event.isComposing || event.keyCode === 229)
                return;

            for (const player of players) {

                switch (event.code) {

                    case player.schema.down:
                    case player.schema.up:
                        player.forward = 0;
                        break;
                    
                    case player.schema.right:
                    case player.schema.left:
                        player.turning = 0;
                        break;
                    
                    case player.schema.fire:
                        player.firing = false;
                        break;

                }

            }

        });

    }

}


class Player {

    constructor(num, x = 130, y = 170) {

        this.playerNum = num;
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.turning = 0;
        this.forward = 0;
        this.debounce = 999;
        this.firing = false;
        this.enabled = true;
        this.hit = false;
        this.hitFrames = 0;
        this.explosionImg = new Image();
        this.explosionImg.src = "./images/explosion.png";
        switch (num) {

            case 1:
                this.tank = redTank;
                this.schema = {
                    up: "KeyW",
                    left: "KeyA",
                    right: "KeyD",
                    down: "KeyS",
                    fire: "KeyQ"
                };
                break;

            case 2:
                this.tank = blueTank;
                this.schema = {
                    up: "ArrowUp",
                    left: "ArrowLeft",
                    right: "ArrowRight",
                    down: "ArrowDown",
                    fire: "ShiftRight"
                };
                break;

            case 3:
                this.tank = greenTank;
                this.schema = {
                    up: "KeyI",
                    left: "KeyJ",
                    right: "KeyL",
                    down: "KeyK",
                    fire: "Space"
                };
                break;
            
            default:
                console.log("Schema left unassigned");
                break;

        }

    }

    draw() {

        ctx.strokeStyle = "red";
        ctx.strokeRect(this.x - 19, this.y - 17, 35, 36);

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * (Math.PI / 180));
        ctx.drawImage(this.tank, -14, -33);
        ctx.rotate(-(this.angle * (Math.PI / 180)));
        ctx.translate(-this.x, -this.y);

    }

    controller() {

        if (this.hit) {
            this.damage();
            return;
        }
        if (!this.enabled) return;

        this.debounce++;
        
        if (this.turning == 1) {
            this.angle += 1;
            let rad = (this.angle) * (Math.PI / 180);
        } else if (this.turning == -1) {
            this.angle -= 1;
            let rad = (this.angle) * (Math.PI / 180);
        }

        let rad = (this.angle) * (Math.PI / 180);
        
        let multiplier = 1.5;
        if (this.forward == 1) { // down
            this.y += multiplier * Math.cos(rad);
            this.x -= multiplier * Math.sin(rad);
        } else if (this.forward == -1) { // up
            this.y -= multiplier * Math.cos(rad);
            this.x += multiplier * Math.sin(rad);
        }

        for (const wall of walls) {
            if (this.x + 16 >= wall.x && this.x - 19 <= wall.x + wall.width) {
                if (this.y + 19 >= wall.y && this.y - 17 <= wall.y + wall.height) {
                    // console.log("tank hitting wall");
                    if (this.forward == 1) {
                        this.y -= multiplier * Math.cos(rad);
                        this.x += multiplier * Math.sin(rad);
                    } else if (this.forward == -1) { // up
                        this.y += multiplier * Math.cos(rad);
                        this.x -= multiplier * Math.sin(rad);
                    }
                }
            }
        }

        if (this.firing && this.debounce >= 10) {
            this.debounce = 0;
            Bullet.addBullet("normal", 5, this.x + 40 * Math.sin(rad), this.y + -40 * Math.cos(rad), rad, this.playerNum);
        }

    }

    damage() {

        this.hit = true;
        this.debounce = -999;
        this.enabled = false;

        this.hitFrames++;

        ctx.drawImage(this.explosionImg, this.x - 43, this.y - 48, this.explosionImg.width * 2, this.explosionImg.height * 2);

        if (this.hitFrames > 90) {
            players = players.filter(player => player.playerNum != this.playerNum);
            if (players.length < 2) endGame();
        }

    }

}


class Bullet {

    static addBullet(type, speed, x, y, angleRad, playerNum) {

        bullets.push(new Bullet(type, speed, x, y, angleRad, playerNum));

    }

    constructor(type, speed, x, y, angleRad, playerNum) {
        
        this.id = Math.random();
        this.x = x;
        this.y = y;
        this.xF = 1;
        this.yF = 1;
        this.type = type;
        this.speed = speed;
        this.angleRad = angleRad;
        this.position = bullets.length;
        this.halflife = 0;
        this.trail = [];
        this.color = ((playerNum == 1) ? "red" : (playerNum == 2) ? "blue" : "green");

    }

    draw() {

        // ctx.fillstyle = "green";
        // ctx.fillRect(this.x - 3, this.y - 3, 6, 6);

        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = this.color;
        for (const t of this.trail) ctx.fillRect(t[0] - 1, t[1] - 1, 2, 2);
        this.trail.push([this.x, this.y]);
        if (this.trail.length >= 30) this.trail.shift();

    }

    controller() {

        this.halflife ++;
        
        this.y -= this.speed * Math.cos(this.angleRad) * this.yF;
        this.x += this.speed * Math.sin(this.angleRad) * this.xF;
        
        for (const wall of walls) {
            // console.log(wall.x);
            // console.log("wall.x: " + (wall.x <= this.x - 3));
            // console.log("wall.x + wall.width: " + (wall.x + wall.width >= this.x + 3));
            // console.log("wall.y: " + (wall.y <= this.y - 3)); // UNDER
            // console.log("wall.y + wall.height: " + (wall.y + wall.height >= this.y + 3)); // OVER
            // if (wall.x <= this.x - 3 && wall.x + wall.width >= this.x + 3) {
                // if (wall.y <= this.y - 3 && wall.y + wall.height >= this.y + 3) {
            if (this.x + 3 >= wall.x && this.x - 3 <= wall.x + wall.width) {
                if (this.y + 3 >= wall.y && this.y - 3 <= wall.y + wall.height) {
                    // console.log("collision");
                    this.y += this.speed * Math.cos(this.angleRad) * this.yF;
                    this.x -= this.speed * Math.sin(this.angleRad) * this.xF;
                    if (wall.width == 10) this.xF *= -1;
                    if (wall.height == 10) this.yF *= -1;
                    // console.log(this.yF);
                    // console.log(this.xF);
                    // console.log(this.angleRad);
                    // this.angleRad = this.angleRad;
                }
            }
        }

        // ctx.fillRect(this.x - 19, this.y - 17, 35, 36);
        for (const tank of players) {
            if (this.x + 3 >= tank.x - 19 && this.x - 3 <= tank.x + 16) {
                if (this.y + 3 >= tank.y - 17 && this.y - 3 <= tank.y + 19) {
                    console.log(`player ${tank.playerNum} has collided with a bullet`);
                    this.remove();
                    tank.damage();
                }
            }
        }
        
        if (this.x > 800 || this.x < 0 || this.y > 800 || this.y < 0 || this.halflife > 900) this.remove();

    }

    remove() {

        bullets = bullets.filter(bullet => bullet.id != this.id);

    }

}


class Wall {

    constructor(x, y, width, height) {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

    }

    draw() {

        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);

    }

}


function endGame() {

    if (players.length > 0) {
        console.log(`player ${players[0].playerNum} wins`);
    } else {
        console.log("all players dead");
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    players = [];

    prepare();

}


function prepare() {

    // for (let i = 0; i < 11; i++) {
    //     for (let v = 0; v < 11; v++) {
    //         walls.push(new Wall(i * 80, v * 80 - 2.5, 80, 5));
    //         walls.push(new Wall(i * 80, v * 80, 5, 80))
    //     }
    // }
    walls.push(new Wall(0, 0, 800, 10));
    walls.push(new Wall(0, 0, 10, 800));
    walls.push(new Wall(0, 790, 800, 10));
    walls.push(new Wall(790, 0, 10, 800));

    walls.push(new Wall(150, 250, 550, 10));
    walls.push(new Wall(500, 50, 10, 550));
    players.push(new Player(1, 450, 200));
    players.push(new Player(2, 550, 200));
    players.push(new Player(3, 550, 325));

    Controller.keyboardListener();

}

let lastFrame = performance.now();

function loop() {

    // const dt = (performance.now() - lastFrame) / 1000;
    // lastFrame = performance.now();

    // console.log(1 / dt);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const wall of walls) wall.draw();
    for (const player of players) {
        player.draw();
        player.controller();
    }
    for (const bullet of bullets) {
        bullet.draw();
        bullet.controller();
    }
    window.requestAnimationFrame(loop);

}

setTimeout(() => {
    prepare();
    loop();
}, 100);



// new Promise(resolve => setTimeout(resolve, 100)).then(() => { prepare(); loop(); });
// prepare();
// loop();
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

    constructor(num) {

        this.playerNum = num;
        this.x = 130;
        this.y = 170;
        this.angle = 0;
        this.turning = 0;
        this.forward = 0;
        this.firing = false;
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

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * (Math.PI / 180));
        ctx.drawImage(this.tank, -14, -33);
        ctx.rotate(-(this.angle * (Math.PI / 180)));
        ctx.translate(-this.x, -this.y);

    }

    controller() {
        
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

        if (this.firing) {
            let x = this.x;
            let y = this.y;
            Bullet.addBullet("normal", 5, x + 40 * Math.sin(rad), y + -40 * Math.cos(rad), rad);
        }

    }

}


class Bullet {

    static addBullet(type, speed, x, y, angleRad) {

        bullets.push(new Bullet(type, speed, x, y, angleRad));

    }

    constructor(type, speed, x, y, angleRad) {
        
        this.x = x;
        this.y = y;
        this.type = type;
        this.speed = speed;
        this.angleRad = angleRad;
        this.position = bullets.length;
        console.log(this.position);

    }

    draw() {

        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
        ctx.fill();

    }

    controller() {

        this.y -= this.speed * Math.cos(this.angleRad);
        this.x += this.speed * Math.sin(this.angleRad);

        console.log(bullets.length);

        if (this.x > 800 || this.x < 0) this.remove();
        if (this.y > 800 || this.y < 0) this.remove();

    }

    remove() {

        for (let i = 0; i < bullets.length; i++) {
            if (bullets[i] == this) {
                bullets = bullets.splice(i, 1);
                break;
            }
        }

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


function prepare() {

    for (let i = 0; i < 11; i++) {
        for (let v = 0; v < 11; v++) {
            walls.push(new Wall(i * 80, v * 80 - 2.5, 80, 5));
            walls.push(new Wall(i * 80, v * 80, 5, 80))
        }
    }
    players.push(new Player(1));

    Controller.keyboardListener();

}


function loop() {
    
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


new Promise(resolve => setTimeout(resolve, 100)).then(() => { prepare(); loop(); });
// prepare();
// loop();
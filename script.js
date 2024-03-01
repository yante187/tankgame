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


class Controller {

    static keyboardListener() {

        window.addEventListener("keydown", (event) => {
    
            if (event.isComposing || event.keyCode === 229)
                return;

            for (const player of players) {

                switch (event.code) {

                    case player.schema.up:
                        player.y -= 15;
                        break;
                    
                    case player.schema.left:
                        player.angle -= 3;
                        break;
                
                    case player.schema.down:
                        player.y += 15;
                        break;
            
                    case player.schema.right:
                        player.angle += 3;
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
        ctx.drawImage(this.tank, 0, 0);
        ctx.rotate(-(this.angle * (Math.PI / 180)));
        ctx.translate(-this.x, -this.y);

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
    for (const player of players) player.draw();
    window.requestAnimationFrame(loop);

}


new Promise(resolve => setTimeout(resolve, 100)).then(() => { prepare(); loop(); });
// prepare();
// loop();
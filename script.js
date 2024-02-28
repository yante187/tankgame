const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


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


a = new Wall(20, 20, 100, 10);
a.draw();
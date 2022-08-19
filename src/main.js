import "../styles/style.css";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.id = "game";

const ctx = canvas.getContext("2d");

const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

window.addEventListener("resize", resize);
resize();

let transformUp = 0;

let score = 0;

let gameOver = false;

const Constants = {
  blockHeight: 50,
  dropHeight: 300,
  startingWidth: 300,
  moveSpeed: 20,
  gravity: 1,
  fadeSpeed: 0.05,
  windowWidth: 20,
  windowHeight: 20,
  minWindowGap: 20,
};

/**
 * @type {FadingBlock[]}
 */
let fadingBlocks = [];

class FadingBlock {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.opacity = 1;

    this.rgb = [255, 0, 0];
  }

  draw() {
    ctx.fillStyle = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${this.opacity})`;
    ctx.fillRect(this.x, this.y + transformUp, this.width, this.height);
  }

  update() {
    this.opacity -= Constants.fadeSpeed;
  }
}

class Block {
  constructor() {
    this.comesFrom = Math.random() > 0.5 ? "left" : "right";

    this.width = (skyscraper[skyscraper.length - 1] || { width: Constants.startingWidth }).width;
    this.height = Constants.blockHeight;

    this.x = this.comesFrom === "left" ? 0 - this.width - 100 : canvas.width + this.width + 100;
    this.y =
      canvas.height -
      Constants.blockHeight -
      skyscraper.length * Constants.blockHeight -
      Constants.dropHeight;

    this.dropped = false;

    this.windows = 0;
    this.windowGap = 0;

    this.yVelocity = 0;
  }

  drop() {
    this.dropped = true;
  }

  draw() {
    ctx.fillStyle = "#444444";

		const center = skyscraper[0] ? skyscraper[0].x + skyscraper[0].width / 2 : canvas.width / 2;

		const { x, y, width, height } = { x: center - (center - this.x) * currentScale, y: canvas.height - (canvas.height - this.y) * currentScale + transformUp, width: this.width * currentScale, height: this.height * currentScale };

    ctx.fillRect(x, y, width, height);

    if (this.windows) {
      ctx.fillStyle = "#FFFF00";
      for (let i = 0; i < this.windows; i++) {
        ctx.fillRect(
          x + i * (Constants.windowWidth + this.windowGap) * currentScale + this.windowGap * currentScale,
          y + (this.height - Constants.windowHeight) / 2 * currentScale,
          Constants.windowWidth * currentScale,
          Constants.windowHeight * currentScale
        );
      }
    }
  }

  update() {
    if (!this.dropped) {
      this.x += (this.comesFrom === "left" ? 1 : -1) * Constants.moveSpeed;
    } else {
      this.yVelocity += Constants.gravity;

      const lastBlock = skyscraper[skyscraper.length - 1];

      if (this.y + this.yVelocity + this.height >= ((lastBlock && lastBlock.y) || canvas.height)) {
        this.y = ((lastBlock && lastBlock.y) || canvas.height) - this.height;

        if (lastBlock) {
          if (this.x < lastBlock.x) {
            this.width = Math.max(lastBlock.width - (lastBlock.x - this.x), 0);

            if (this.width === 0) {
              return true;
            }

            fadingBlocks.push(new FadingBlock(this.x, this.y, lastBlock.x - this.x, this.height));

            this.x = lastBlock.x;
          } else if (this.x + this.width > lastBlock.x + lastBlock.width) {
            this.width = Math.max(lastBlock.width - (this.x - lastBlock.x), 0);

            if (this.width === 0) {
              return true;
            }

            fadingBlocks.push(
              new FadingBlock(lastBlock.x + lastBlock.width, this.y, this.x - lastBlock.x, this.height)
            );

            this.x = lastBlock.x + lastBlock.width - this.width;
          } else {
            console.log("pefect!");
          }
        }

        skyscraper.push(this);

        dropping = new Block();

        score++;

        this.windows = Math.floor(
          (this.width - Constants.minWindowGap) / (Constants.windowWidth + Constants.minWindowGap)
        );

        this.windowGap =
          (this.width - Constants.minWindowGap - this.windows * Constants.windowWidth) / this.windows;

        console.log(this.windows);
      } else {
        this.y += this.yVelocity;
      }
    }
  }
}

let botMode = false;

window.addEventListener("keydown", e => {
	if (botMode) {
		botMode = false;
		return;
	}
	
  if (e.key === " ") {
    dropping.drop();
  }
});

/**
 * @type {Block[]}
 */
const skyscraper = [];

let finalTransformUp = 0;

let dropping = new Block();

const endGame = () => {
  gameOver = true;
  finalTransformUp = transformUp;

  console.log("you looze");
};

let currentScale = 1;

const render = () => {
  let continueRendering = true;

	ctx.clearRect(0, 0, canvas.width * (1 / currentScale), canvas.height * (1 / currentScale));

  if (gameOver) {
    // zoom out to fit whole skyscraper
    if (transformUp > 0) {
      transformUp -= finalTransformUp / 50;

			let targetScale = Math.min(1, window.innerHeight / 3 * 2 / (finalTransformUp + Constants.blockHeight * Math.min(skyscraper.length, 6)));
			
			currentScale += (targetScale - 1) / 50;

			console.log(currentScale);


    }
  } else {
    if (dropping.update()) {
      endGame();
    }

    dropping.draw();

    if (dropping.x > canvas.width + dropping.width + 100 || dropping.x < 0 - dropping.width - 100) {
      endGame();
    }

    fadingBlocks.forEach(block => {
      block.update();
      block.draw();
    });

    fadingBlocks = fadingBlocks.filter(block => block.opacity > 0);

    ctx.fillStyle = "black";
    ctx.font = "50px Arial";
    ctx.fillText(score, canvas.width / 2, 50);

    if (transformUp < Constants.blockHeight * (skyscraper.length - 6)) {
      transformUp += 1;
    }

		if (botMode) {
			if (skyscraper[skyscraper.length - 1] && Math.abs(dropping.x - skyscraper[skyscraper.length - 1].x) <= Constants.moveSpeed) {
				dropping.drop();
			} else if (!skyscraper[skyscraper.length - 1] && dropping.x > canvas.width / 2) {
				dropping.drop();
			}
		}
  }

  skyscraper.forEach(block => {
    block.draw();
  });

  continueRendering && requestAnimationFrame(render);
};

render();

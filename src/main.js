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
  moveSpeed: 10,
  gravity: 1,
  fadeSpeed: 0.05,
  windowWidth: 20,
  windowHeight: 20,
  minWindowGap: 20,
};

// from detectmobilebrowsers.com
const mobile = (function (a) {
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
      a
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      a.substr(0, 4)
    )
  )
    return true;
})(navigator.userAgent || navigator.vendor || window.opera);

if (mobile) {
	console.log('mobile');

	Constants.blockHeight /= 2;
	Constants.moveSpeed /= 2;
	Constants.startingWidth /= 2;
	Constants.windowWidth /= 2;
	Constants.windowHeight /= 2;
	Constants.minWindowGap /= 2;
}

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

    const { x, y, width, height } = {
      x: center - (center - this.x) * currentScale,
      y: canvas.height - (canvas.height - this.y) * currentScale + transformUp,
      width: this.width * currentScale,
      height: this.height * currentScale,
    };

    ctx.fillRect(x, y, width, height);

    if (this.windows) {
      ctx.fillStyle = "#FFFF00";
      for (let i = 0; i < this.windows; i++) {
        ctx.fillRect(
          x + i * (Constants.windowWidth + this.windowGap) * currentScale + this.windowGap * currentScale,
          y + ((this.height - Constants.windowHeight) / 2) * currentScale,
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

const drop = e => {
  if (botMode) {
    botMode = false;
    return;
  }

  if (e.key) {
    if (e.key === " ") {
      dropping.drop();
    }
  } else {
    dropping.drop();
  }
};

window.addEventListener("keydown", drop);
window.addEventListener("mousedown", drop);
window.addEventListener("touchstart", drop);

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

let { innerHeight: height, innerWidth: width } = window;

let rendering = true;

const render = () => {
  let continueRendering = true;

  ctx.clearRect(0, 0, canvas.width * (1 / currentScale), canvas.height * (1 / currentScale));

  if (gameOver) {
    // zoom out to fit whole skyscraper
    if (transformUp > 0) {
      transformUp -= finalTransformUp / 50;

      let targetScale = Math.min(
        1,
        ((window.innerHeight / 3) * 2) /
          (finalTransformUp + Constants.blockHeight * Math.min(skyscraper.length, 6))
      );

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
      if (
        skyscraper[skyscraper.length - 1] &&
        Math.abs(dropping.x - skyscraper[skyscraper.length - 1].x) <= Constants.moveSpeed
      ) {
        dropping.drop();
      } else if (!skyscraper[skyscraper.length - 1] && dropping.x > canvas.width / 2) {
        dropping.drop();
      }
    }
  }

  skyscraper.forEach(block => {
    block.draw();
  });

  ctx.fillStyle = "black";
  ctx.font = "50px Arial";
  ctx.fillText(score, canvas.width / 2, 50);

	if (height > width) {
		continueRendering = false;
		rendering = false;
	}

  continueRendering && requestAnimationFrame(render);
};

render();

window.addEventListener('resize', () => {
	height = window.innerHeight;
	width = window.innerWidth;

	if (height <= width && !rendering) {
		render();
		rendering = true;
	}
});
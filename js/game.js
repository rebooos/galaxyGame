const ENGINE = new function() {
	let ENGINE = this,
		canvas, context, 
		width, height, 
		nodes = [], nodeCount = 0, timer =0, userDraw, 
		forDestroy = {}, downKeys = {};

	let levelBackground = ["../galaxyGame/image/bg0.jpg", "../galaxyGame/image/bg1.jpg"];

	let $ = (id) => { return document.getElementById(id)};

	let rect = (x, y, w, h, clr) => {
		context.fillStyle = clr;
		context.fillRect(x, y, w, h);
	}

	let text = (x, y, clr, text) => {
		context.fillStyle = clr;
		context.fillText(text, x, y);
	};

	class Node {
		constructor (x, y, w, h, clr, upd) {
			this.id = nodeCount++;
			this.x = x;
			this.y = y; 
			this.w = w;
			this.h = h;
			this.clr = clr;
			this.update = upd;
			nodes.push(this);
		}

		_update() {
			if (typeof this.update === 'function')
				this.update(this); 
		}

		draw () {
			rect(this.x, this.y, this.w, this.h, this.clr);
		}

		destroy () {
			forDestroy[this.id] = this;
		}

		move (x, y) {
			this.x += x;
			this.y += y;
		}

		intersect (node) {
			return !(this.x + this.w < node.x 
				|| this.y + this.h < node.y
				|| this.x > node.x + node.w
				|| this.y > node.y + node.h);
		}
	}

	ENGINE.createNode = (x, y, w, h, clr, upd) => {
		return new Node(x, y, w, h, clr, upd);
	}

	ENGINE.drawText = (x, y, clr, _text) => {
		text(x, y, clr, _text);
	}

	ENGINE.update = () => {
		context.clearRect(0,0, width, height);
		for (let i = nodes.length-1; i >= 0; i--) {
			if (forDestroy[nodes[i].id]) {
				nodes.splice(i, 1);
				continue;
			}

			nodes[i]._update();
			nodes[i].draw();
		}
		if (userDraw) {
			userDraw(ENGINE);
		}
		requestAnimationFrame(ENGINE.update);
		timer++;
	};

	ENGINE.key = (key) => {
		return downKeys[key]
	};

	ENGINE.clearTimer = () => {
		timer = 0;
	};

	ENGINE.getTimer = () => {
		return timer;
	};

	ENGINE.setDraw = (f) => {
		userDraw = f;
	};

	ENGINE.start = (W, H) => {
		canvas = $('canvas');
		context = canvas.getContext('2d');

		background = new Image();
		background.src = levelBackground[0];

		width = W;
		height = H;
		canvas.width = width;
		canvas.height = height;

		background.onload = () => {
			context.drawImage(background,0,0, 300, 300);
		};
	    
		window.addEventListener('keydown', (e) => {
			downKeys[e.code] = true;
		});

		window.addEventListener('keyup', (e) => {
			downKeys[e.code] = false;
		});

		ENGINE.update();
	};
};

window.addEventListener('load', function() {
	ENGINE.start(640, 480);

	let enemies = [];
	let score = 0;
	let speedEnemieX = 0.5;
	let speedEnemieY = 10;
	let upperLine = 60;
	let bottomLine = 120;

	let enemy_ai = (node) => {
		node.x += speedEnemieX;
		if (node.x > canvas.width - 30 || node.x < 30) {
			speedEnemieX = -1 * speedEnemieX;
		}
	};

	let bullet_ai = (node) => {
		node.y -= 3;
		if (node.y +node.h < 0) {
			node.destroy();
		}

		for (let i = enemies.length-1; i >=0; i--) {
			if (node.intersect(enemies[i])) {
				enemies[i].destroy();
				node.destroy();
				enemies.splice(i, 1);
				score += 100;
				break;	
			}
		}
	}
	
	for (let j = 0; j < 3; j++ ) {
		for (let i = 0; i < 10; i++ ) {
			enemies.push(ENGINE.createNode(bottomLine + (20 + 20) * i, upperLine + (20+20)*j, 20, 20, '#ff6d5a', enemy_ai));
		}
	}
	
	let fire = (x, y) => {
		if (ENGINE.getTimer() > 100) {
			ENGINE.createNode(x, y, 10, 20, '#14ff00', bullet_ai);
			ENGINE.clearTimer();
		}
	}

	ENGINE.createNode(640/2-25, 480-50-30, 50, 50, '#64c858', (node) => {
		if (ENGINE.key('KeyA') || ENGINE.key('ArrowLeft')) {
			node.x -=2;
		}
		if (ENGINE.key('KeyD') || ENGINE.key('ArrowRight')) {
			node.x +=2;
		}
		if (ENGINE.key('Space')) {
			fire(node.x+25-5, node.y)
		}
	});

	ENGINE.setDraw((e) => {
		e.drawText(canvas.width/2-22, 10,'#8cff00', 'Game score:'+score);
	});
})
var game = new Phaser.Game(1000, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var martian, cursors, enemies, shoots, explosions;
var lastShoot = new Date(), SHOOT_INTERVAL = 300;

function preload() {
	game.load.image('martian', 'images/martian2.png');
	game.load.image('enemy', 'images/dummy_enemy.png');
	game.load.image('shoot', 'images/fire_shoot.png');
	game.load.spritesheet('explosion', 'images/explosion.png', 32, 32, 4);
	game.load.image('background', 'images/background.jpg');
}

function create() {

	game.world.setBounds(0, 0, 1000, 470);

	game.add.tileSprite(0, 0, game.stage.getBounds().width, game.cache.getImage('background').height, 'background');
	game.physics.startSystem(Phaser.Physics.ARCADE);
	enemies = game.add.group();
	shoots = game.add.group();
	explosions = game.add.group();

	createPlayer();
	createShoots();
  createEnemys();
	createExplosions();

	setInterval(spawnEnemy, 500);
}

function update() {
	checkKeyPress();
	doenemiesFollowPlayer();
	checkCollision();
}

function createPlayer(){
	cursors = game.input.keyboard.createCursorKeys()

	martian = game.add.sprite(500, 450, 'martian');
	game.physics.arcade.enable(martian);

	martian.body.bounce.y = 0.2;
 	martian.anchor.setTo(.5, .5);
  martian.body.gravity.y = 300;
  martian.body.collideWorldBounds = true;
}

function createExplosions(){
	for (var i = 0; i < 50; i++) {
		var explosion = explosions.create(-1000, -1000 + martian.body.height * .5, 'explosion');
		explosion.anchor.setTo(.5, .5);
		explosion.alive = false;
		explosion.scale.x = explosion.scale.y = 2;
		explosion.disabled = true;
		var explodeAnim = explosion.animations.add('explode');
		explodeAnim.onComplete.add(function() {
      this.kill();
  	}, explosion);
	}
}

function createShoots(){

	for (var i = 0; i < 50; i++) {
		var shoot = shoots.create(-1000, -1000 + martian.body.height * .5, 'shoot');
		shoot.anchor.setTo(.5, .5);
		shoot.alive = false;
		game.physics.arcade.enable(shoot);
		lastShoot = new Date();
		shoot.disabled = true;
		shoot.checkWorldBounds = true;
		shoot.outOfBoundsKill = true;
	}
}

function createEnemys(){
	var numEmenys = 10;

	for (var i = numEmenys; i >= 0; i--) {

		var dir = (Math.random() > 0.5) ? 1 : -1;
		var gapX = Math.random() * 500;

		var enemy = enemies.create(1400 * dir + gapX, 400, 'enemy');
		enemy.alive = false;
		enemy.scale.x = enemy.scale.y = 2;
		game.physics.arcade.enable(enemy);
		enemy.body.gravity.y = 300;
		enemy.body.collideWorldBounds = true;
		enemy.body.bounce.y = Math.random();
	};
}

function checkKeyPress(){
	//  Reset the players velocity (movement)
    martian.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        martian.body.velocity.x = -150;
        martian.scale.x = -1
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        martian.body.velocity.x = 150;
        martian.scale.x = 1
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)&& (new Date() - lastShoot > SHOOT_INTERVAL)){
    	shoot();
    }

		if (cursors.up.isDown && martian.body.y == 406){
				martian.body.velocity.y = -200;
    }
}

function doenemiesFollowPlayer(){
	enemies.forEach(function(enemy){
		if(enemy.x > martian.x){
			enemy.body.velocity.x = -100;
		}
		else{
			enemy.body.velocity.x = 100;
		}
	});
}

function shoot(){
	var playerScale = martian.scale.x;
	var shootGap = (playerScale !== -1 ) ? martian.body.width : 0
	var groupLength = shoots.lenght;
	var shoot = shoots.getFirstDead();

	if(!shoot){
		shoot = shoots.getFirstAlive();
	}

	shoot.reset(martian.body.x + shootGap, martian.body.y + ( martian.body.height * .5 ));
 	shoot.scale.x = martian.scale.x;
 	shoot.body.velocity.x = 600 * martian.scale.x;
	lastShoot = new Date();
	shoot.body.checkCollision.left = shoot.body.checkCollision.right = true;
}

function checkCollision(){
	game.physics.arcade.overlap(enemies, martian, function enemyTouched(){
		console.log('Player Killed');
	}, null, this);

	game.physics.arcade.overlap(shoots, enemies, function enemyShooted(shoot, enemy){
		enemy.kill();
		shoot.kill();
		shoot.alive = true;
		screenShake();
		addExplosion(enemy.body.x + enemy.body.width * .5, enemy.body.y + enemy.body.height * .5);
	}, null, this);
}

function screenShake(){
	var canvas = document.querySelector('canvas');
	canvas.classList.remove('shake');
	canvas.classList.add('shake');
	setTimeout(function(){
		canvas.classList.remove('shake');
	}, 1000);
}

function spawnEnemy(){
	var enemy = enemies.getFirstDead();

	if(enemy){
		var dir = (Math.random() > 0.5) ? 1 : -1;
		var gapX = Math.random() * 500;
		enemy.reset(1400 * dir + gapX, Math.random() * 400);
	}
}

function addExplosion(x, y){
	var explosion = explosions.getFirstDead();

	if(explosion){
		explosion.animations.play('explode', 20, false);
		explosion.reset(x, y);
		// game.paused = true
		// setTimeout(function(){
		// 		game.paused = false;
		// }, Math.random() * 100);
	}
}
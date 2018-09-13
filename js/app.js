// Grid constants
let GRID_Y = 83;
let GRID_X = 101;
let GRID_Y_TOP_EMPTY_SPACE = 50;
let GRID_Y_BOTTOM_EMPTY_SPACE = 20;
let MAX_PLAYER_MOVE_UP = 0 * GRID_Y + GRID_Y_TOP_EMPTY_SPACE;
let MAX_PLAYER_MOVE_DOWN = 5 * GRID_Y - GRID_Y_BOTTOM_EMPTY_SPACE;
let MAX_PLAYER_MOVE_LEFT = 0;
let MAX_PLAYER_MOVE_RIGHT = 4 * GRID_X;
// Player start constant
let PLAYER_START_X = GRID_X * 2;
let PLAYER_START_Y = GRID_Y * 5 - GRID_Y_BOTTOM_EMPTY_SPACE;
// Enemy Speed Min Max constants
let MIN_ENEMY_SPEED = 100;
let MAX_ENEMY_SPEED = 700;
// Enemy Spawn
let ENEMY_SPAWN = 4;
// Hitbox Adjustment
let RIGHT_ADJUST = 83;
let LEFT_ADJUST = 18;
let TOP_ADJUST = 81;
let BOTTOM_ADJUST = 132;
// Enemy Unique Hitbox Adjustment
let ENEMY_RIGHT_ADJUST = 98;
let ENEMY_LEFT_ADJUST = 3;
let ENEMY_TOP_ADJUST = 81;
let ENEMY_BOTTOM_ADJUST = 132;
// Gem Constants
let BLUE_GEM = 'images/Gem Blue.png';
let GREEN_GEM = 'images/Gem Green.png';
let ORANGE_GEM = 'images/Gem Orange.png';
// Player Sprite Constants
let BOY = 'images/char-boy.png';
let CAT_GIRL = 'images/char-cat-girl.png';
let HORN_GIRL = 'images/char-horn-girl.png';
let PINK_GIRL = 'images/char-pink-girl.png';
let PRINCESS_GIRL = 'images/char-princess-girl.png';

// Game sounds
let success = new Audio("./media/gotit.ogg");
let fail = new Audio("./media/fail.ogg");
let winner = new Audio("./media/quite-impressed.ogg");

// Returns a random integer between min (included) and max (excluded)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

// Returns true if compared actors intersect
function intersect(actor1, actor2) {
        return !(actor1.right < actor2.left ||
                actor1.left > actor2.right ||
                actor1.top > actor2.bottom ||
                actor1.bottom < actor2.top);
}

// Actor Super Class

let Actor = function(x, y, img, rightAdj, leftAdj, topAdj, botAdj) {
    this.x = x;
    this.y = y;
    this.rightAdj = rightAdj;
    this.leftAdj = leftAdj;
    this.topAdj = topAdj;
    this.botAdj = botAdj;
    this.sprite = img;
    this.right = this.x + this.rightAdj;
    this.left = this.x + this.leftAdj;
    this.top = this.y + this.topAdj;
    this.bottom = this.y + this.botAdj;
};
Actor.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
Actor.prototype.updateHitbox = function() {
    this.right = this.x + this.rightAdj;
    this.left = this.x + this.leftAdj;
    this.top = this.y + this.topAdj;
    this.bottom = this.y + this.botAdj;
};


// Enemy Class

let Enemy = function(x, y, rightAdj, leftAdj, topAdj, botAdj) {
    Actor.call(this, x, y, 'images/enemy-bug.png', rightAdj, leftAdj, topAdj, botAdj);
    // Determines a random speed for the enemy 
    this.speed = getRandomArbitrary(MIN_ENEMY_SPEED, MAX_ENEMY_SPEED);
    // Star reset
    this.starReset = false;
};

Enemy.prototype = Object.create(Actor.prototype);
Enemy.prototype.constructor = Enemy;
Enemy.prototype.update = function(dt) {
    // Resets the enemy sprite once it goes off screen to the right
    if(this.x > GRID_X * 5) {
        this.x = GRID_X * -1;
        this.y = GRID_Y * getRandomInt(1, 4) - GRID_Y_BOTTOM_EMPTY_SPACE;
        this.speed = getRandomArbitrary(MIN_ENEMY_SPEED, MAX_ENEMY_SPEED);
    }
    
    // When player grabs the star, enemy resets
    if(this.starReset === true) {
        this.x = GRID_X * -1;
        this.y = GRID_Y * getRandomInt(1, 4) - GRID_Y_BOTTOM_EMPTY_SPACE;
        this.speed = getRandomArbitrary(MIN_ENEMY_SPEED, MAX_ENEMY_SPEED);
        this.starReset = false;
    }
    this.x = this.x + this.speed * dt;
};

// Player Class

let Player = function(x, y, rightAdj, leftAdj, topAdj, botAdj) {
    this.charSelect = [BOY, CAT_GIRL, HORN_GIRL, PINK_GIRL, PRINCESS_GIRL];
    Actor.call(this, x, y, this.charSelect[getRandomInt(0, 5)], rightAdj, leftAdj, topAdj, botAdj);
    this.alive = true;
    this.score = 0;
    this.highScore = 0;
    this.lives = 3;
};
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;
Player.prototype.handleInput = function(keyCode) {
    if(keyCode == "up" && this.y > MAX_PLAYER_MOVE_UP) this.y = this.y - GRID_Y;
    else if(keyCode == "down" &&  this.y < MAX_PLAYER_MOVE_DOWN) this.y = this.y + GRID_Y;
    else if(keyCode == "left" && this.x > MAX_PLAYER_MOVE_LEFT) this.x = this.x - GRID_X;
    else if(keyCode == "right" && this.x < MAX_PLAYER_MOVE_RIGHT) this.x = this.x + GRID_X;
};

Player.prototype.update = function() {
    // Checks to see if player goes into water and gains a point
    if(this.y <= 0 * GRID_Y + GRID_Y_TOP_EMPTY_SPACE) {
        winner.play();
        this.x = PLAYER_START_X;
        this.y = PLAYER_START_Y;
        this.sprite = this.charSelect[getRandomInt(0, 5)];
        this.score = this.score + 1;
    }
    
    // Checks to see if player died and reset position
    if(this.alive === false) {
        fail.play();
        this.x = PLAYER_START_X;
        this.y = PLAYER_START_Y;
        this.sprite = this.charSelect[getRandomInt(0, 5)];
        this.alive = true;
        if(this.lives === 1){
            alert("Game Over !");
            this.score = 0;
            this.lives = 3;
        } else {
            this.lives = this.lives - 1;
        }
    }
};
Player.prototype.renderStatus = function() {
    ctx.clearRect(0, 20 , 505 , 25);
    ctx.font = "20px serif";
    // Draw scores on the top left
    ctx.fillText("Score: " + this.score, 0, 40);
    // Draw lives on the top right
    ctx.fillText("Lives: " + this.lives, 404, 40);
    // High score during gaming session
    if(this.score > this.highScore) this.highScore = this.score;
    ctx.fillText("High Score: " + this.highScore, 202, 40);
    
};

Player.prototype.checkCollisions = function(allEnemies, gem, heart, star) {
    
    let self = this;
    allEnemies.forEach(function(enemy) {
        if(intersect(enemy, self)){
           self.alive = false;
        }
    });
    
    if(intersect(gem, this)) {
        gem.taken = true;
        this.score = this.score + gem.value;
    }
    
    if(intersect(heart, this)) {
        heart.taken = true;
        this.lives = this.lives + 1;
    }
    
    if(intersect(star, this)) {
        star.taken = true;
        allEnemies.forEach(function(enemy) {
            enemy.starReset = true;
        });
    }
    
    
};


// Gem Class - Player gains points by grabbing gems

let Gem = function(x, y, rightAdj, leftAdj, topAdj, botAdj) {
    this.gemColor = [BLUE_GEM, GREEN_GEM, ORANGE_GEM];
    // Randomly will choose a gem with a value
    this.value = getRandomInt(0, 3) + 1;
    Actor.call(this, x, y, this.gemColor[this.value - 1], rightAdj, leftAdj, topAdj, botAdj);
    this.taken = false;
};
Gem.prototype = Object.create(Actor.prototype);
Gem.prototype.constructor = Gem;
Gem.prototype.update = function() {
    // Random type of gem will randomly spawn at a location after player grabs it
    if(this.taken === true) {
        success.play();
        this.value = getRandomInt(0, 3) + 1;
        this.sprite = this.gemColor[this.value - 1];
        // Reset gem in a random location
        this.x = GRID_X * getRandomInt(0, 5);
        this.y = GRID_Y * getRandomInt(1, 4) - GRID_Y_BOTTOM_EMPTY_SPACE;
        this.taken = false;
    }
};


// Heart Class - Player gains lives by grabbing hearts

let Heart = function(x, y, rightAdj, leftAdj, topAdj, botAdj) {
    Actor.call(this, x, y, 'images/Heart.png', rightAdj, leftAdj, topAdj, botAdj);
    this.taken = false;
};
Heart.prototype = Object.create(Actor.prototype);
Heart.prototype.constructor = Heart;
Heart.prototype.update = function() {
    // Heart will reset after it's taken
    if(this.taken === true) {
        success.play();
        this.x = GRID_X * getRandomInt(0, 5);
        this.y = GRID_Y * getRandomInt(1, 4) - GRID_Y_BOTTOM_EMPTY_SPACE;
        this.taken = false;
    }
};


// Star Class - Player resets all the enemies by grabbing stars

let Star = function(x, y, rightAdj, leftAdj, topAdj, botAdj) {
    Actor.call(this, x, y, 'images/Star.png', rightAdj, leftAdj, topAdj, botAdj);
    this.taken = false;
};
Star.prototype = Object.create(Actor.prototype);
Star.prototype.constructor = Star;
Star.prototype.update = function() {
    // Star will reset after it's taken
    if(this.taken === true) {
        success.play();
        this.x = GRID_X * getRandomInt(0, 5);
        this.y = GRID_Y * getRandomInt(1, 4) - GRID_Y_BOTTOM_EMPTY_SPACE;
        this.taken = false;
    }
};


// Instantiate Player Object
let player = new Player(PLAYER_START_X, PLAYER_START_Y, RIGHT_ADJUST, LEFT_ADJUST, TOP_ADJUST, BOTTOM_ADJUST);

// Instantiate Enemy Object in an array
let allEnemies = [];
for (let i = 0; i < ENEMY_SPAWN; i++)
    allEnemies.push(new Enemy(GRID_X * -1, GRID_Y * getRandomInt(1, 4) - GRID_Y_BOTTOM_EMPTY_SPACE, ENEMY_RIGHT_ADJUST, ENEMY_LEFT_ADJUST, ENEMY_TOP_ADJUST, ENEMY_BOTTOM_ADJUST));
    
// Instantiate Gem Object
let gem = new Gem(GRID_X * getRandomInt(0, 5), GRID_Y * getRandomInt(1, 4) - GRID_Y_BOTTOM_EMPTY_SPACE, RIGHT_ADJUST, LEFT_ADJUST, TOP_ADJUST, BOTTOM_ADJUST);

// Instantiate Heart Object
let heart = new Heart(GRID_X * getRandomInt(0, 5), GRID_Y * getRandomInt(1, 4) - GRID_Y_BOTTOM_EMPTY_SPACE, RIGHT_ADJUST, LEFT_ADJUST, TOP_ADJUST, BOTTOM_ADJUST);

// Instantiate Star Object
let star = new Star(GRID_X * getRandomInt(0, 5), GRID_Y * getRandomInt(1, 4) - GRID_Y_BOTTOM_EMPTY_SPACE, RIGHT_ADJUST, LEFT_ADJUST, TOP_ADJUST, BOTTOM_ADJUST);

// This listens for key presses and sends the keys to your
document.addEventListener('keyup', function(e) {
    let allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

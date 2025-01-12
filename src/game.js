// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let platforms;
let obstacles;
let score = 0;
let scoreText;
let highestScoreText;
let jumpButton;
let jumpKey;

function preload() {
    // 加载资源
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('obstacle', 'assets/obstacle.png');
    this.load.audio('jumpSound', 'assets/jump.mp3');
    this.load.audio('backgroundMusic', 'assets/background_music.mp3');
}

function create() {
    // 背景
    this.add.image(400, 300, 'background');

    // 背景动画（示例：滚动背景）
    const bg = this.add.tileSprite(0, 0, 800, 600, 'background');
    bg.setOrigin(0, 0);
    bg.tilePositionX = 0;

    // 地面
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    // 玩家
    player = this.physics.add.sprite(100, 450, 'player');
    player.setCollideWorldBounds(true);
    player.body.gravity.y = 300;

    // 动画
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // 控制
    if (Phaser.Device.isMobile) {
        // 手机端控制
        jumpButton = this.add.rectangle(70, 550, 100, 100, 0x0000FF);
        jumpButton.setInteractive();
        jumpButton.on('pointerdown', jump);
    } else {
        // PC端控制
        jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // 障碍物组
    obstacles = this.physics.add.group();

    // 生成障碍物
    this.time.addEvent({
        delay: 1000,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true
    });

    // 碰撞检测
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(obstacles, platforms);
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    // 音效
    jumpSound = this.sound.add('jumpSound');
    backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
    backgroundMusic.play();

    // 分数
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    highestScoreText = this.add.text(16, 50, 'High Score: ' + localStorage.getItem('highestScore') || 0, { fontSize: '32px', fill: '#000' });
}

function update() {
    // 玩家移动
    if (Phaser.Input.Keyboard.JustDown(jumpKey) || jumpButton.isDown) {
        jump();
    }

    // 背景滚动
    bg.tilePositionX -= 1;
}

function jump() {
    if (player.body.touching.down) {
        player.setVelocityY(-350);
        jumpSound.play();
    }
}

function spawnObstacle() {
    const obstacle = obstacles.create(800, 520, 'obstacle');
    obstacle.setVelocityX(-200);
    obstacle.setBounce(0.2);
    obstacle.setCollideWorldBounds(true);
}

function hitObstacle(player, obstacle) {
    backgroundMusic.stop();
    player.setTint(0xff0000);
    this.time.addEvent({
        delay: 1000,
        callback: restartGame,
        callbackScope: this,
        loop: false
    });
}

function restartGame() {
    score = 0;
    scoreText.setText('Score: 0');
    player.setTint(0xffffff);
    backgroundMusic.play();
}

// 记录最高分
function updateScore() {
    score += 1;
    scoreText.setText('Score: ' + score);
    const highestScore = localStorage.getItem('highestScore') || 0;
    if (score > highestScore) {
        localStorage.setItem('highestScore', score);
        highestScoreText.setText('High Score: ' + score);
    }
}

// 在update函数中调用updateScore
function update() {
    // 其他代码...
    updateScore();
}

import Wall from './wall.js'
import Path from './path.js'
import Boundary from './boundary.js'
import Bumper from './bumper.js'
import Paddle from './paddle.js'
import Stopper from './stopper.js'
// plugins
Matter.use(MatterAttractors);

// constants
const PATHS = {
    DOME: '0 0 0 250 19 250 20 231.9 25.7 196.1 36.9 161.7 53.3 129.5 74.6 100.2 100.2 74.6 129.5 53.3 161.7 36.9 196.1 25.7 231.9 20 268.1 20 303.9 25.7 338.3 36.9 370.5 53.3 399.8 74.6 425.4 100.2 446.7 129.5 463.1 161.7 474.3 196.1 480 231.9 480 250 500 250 500 0 0 0',
    DROP_LEFT: '0 0 20 0 70 100 20 150 0 150 0 0',
    DROP_RIGHT: '50 0 68 0 68 150 50 150 0 100 50 0',
    APRON_TOP_LEFT: '0 0 180 0 0 120 0 0',
    APRON_LEFT: '0 0 180 120 0 120 0 0',
    APRON_RIGHT: '180 0 180 120 0 120 180 0'
};
const COLOR = {
    BACKGROUND: '#212529',
    OUTER: '#495057',
    INNER: '#15aabf',
    BUMPER: '#fab005',
    BUMPER_LIT: '#fff3bf',
    PADDLE: '#e64980',
    PINBALL: '#dee2e6'
};
const GRAVITY = 0.6;
const WIREFRAMES = false;
const PADDLE_PULL = 0.004;
const MAX_VELOCITY = 50;

// score elements
let $currentScore = $('.current-score span');
let $highScore = $('.high-score span');

// shared variables
let leftUpStopper, leftDownStopper;
let rightUpStopper, rightDownStopper;
const CONFIG = {
    staticBodies: [ 
        new Path(440, 96,PATHS.DOME).path,
        new Path(30, 30, PATHS.APRON_TOP_LEFT).path,
        new Wall(120, 140, 20, 40).wall,
        new Wall(190, 140, 20, 40).wall,
        new Wall(260, 140, 20, 40).wall,
        new Wall(330, 140, 20, 40).wall,
        new Bumper(105, 250).bumper,
        new Bumper(225, 250).bumper,
        new Bumper(345, 250).bumper,
        new Bumper(165, 340).bumper,
        new Bumper(285, 340).bumper,
        new Wall(440, 620, 20, 722, 0, '#495057').wall,
        new Path(25, 360, PATHS.DROP_LEFT).path,
        new Path(425, 360, PATHS.DROP_RIGHT).path,
        new Path(25, 520, PATHS.DROP_LEFT).path,
        new Path(425, 520, PATHS.DROP_RIGHT).path,
        new Wall(120, 702, 20, 120).wall,
        new Wall(330, 702, 20, 120).wall,
        new Wall(60, 721, 20, 160).wall,
        new Wall(390, 721, 20, 160).wall,
        new Wall(93, 816, 20, 98, -0.96).wall,
        new Wall(357, 816, 20, 98, 0.96).wall,
        new Path(79, 932, PATHS.APRON_LEFT).path,
        new Path(371, 932, PATHS.APRON_RIGHT).path
    ]
}

function load() {
    let pinballGame = new PinballGame();
    pinballGame.init();
    pinballGame.createStaticBodies(CONFIG);
    pinballGame.createPaddles();
    pinballGame.createPinball();
    pinballGame.createEvents();
}

class PinballGame {

    init() {
        // engine (shared)
        this.engine = Matter.Engine.create();
        this.waitingForShooter = true;
        this.launchPower = 5;
        // world (shared)
        this.world = this.engine.world;
        this.world.bounds = {
            min: { x: 0, y: 0},
            max: { x: 500, y: 992 }
        };
        this.world.gravity.y = GRAVITY; // simulate rolling on a slanted table

        // render (shared)
        this.render = Matter.Render.create({
            element: document.querySelector('.container'),
            engine: this.engine,
            options: {
                width: this.world.bounds.max.x,
                height: this.world.bounds.max.y,
                wireframes: WIREFRAMES,
                background: COLOR.BACKGROUND
            }
        });
        Matter.Render.run(this.render);

        Matter.Runner.run(Matter.Runner.create(), this.engine);
        this.stopperGroup = Matter.Body.nextGroup(true);
        this.currentScore = 0;
        this.highScore = 0;
    }

    createStaticBodies(config) {
        Matter.World.add(this.world, new Boundary(this.world, 'top').boundary)
        Matter.World.add(this.world, new Boundary(this.world, 'bottom').boundary)
        Matter.World.add(this.world, new Boundary(this.world, 'left').boundary)
        Matter.World.add(this.world, new Boundary(this.world, 'right').boundary)

        CONFIG.staticBodies.forEach((item) => Matter.World.add(this.world, item))       
        Matter.World.add(this.world, [
            this.reset(225, 50),
            this.reset(465, 30)
        ]);
    }

    createPaddles() {

        // these bodies keep paddle swings contained, but allow the ball to pass through
        leftUpStopper = new Stopper(160, this.world.bounds.max.y-209, 'up', 'paddle-left-comp', this.stopperGroup);
        leftDownStopper = new Stopper(140, this.world.bounds.max.y-57, 'down', 'paddle-left-comp', this.stopperGroup);
        rightUpStopper = new Stopper(290, this.world.bounds.max.y-209, 'up', 'paddle-right-comp', this.stopperGroup);
        rightDownStopper = new Stopper(310, this.world.bounds.max.y-57, 'down', 'paddle-right-comp', this.stopperGroup);
        Matter.World.add(this.world, [leftUpStopper.stopper, leftDownStopper.stopper, rightUpStopper.stopper, rightDownStopper.stopper]);

        // this group lets paddle pieces overlap each other
        let paddleGroup = Matter.Body.nextGroup(true);
        this.paddleLeft = new Paddle(this.world, paddleGroup, 'left', 170)
        this.paddleRight = new Paddle(this.world, paddleGroup, 'right', 280)
        leftUpStopper.paddle = this.paddleLeft
        leftDownStopper.paddle = this.paddleLeft
        rightUpStopper.paddle = this.paddleRight
        rightDownStopper.paddle = this.paddleRight
    }

    createPinball() {
        // x/y are set to when pinball is launched
        this.pinball = Matter.Bodies.circle(0, 0, 14, {
            label: 'pinball',
            collisionFilter: {
                group: this.stopperGroup
            },
            render: {
                fillStyle: COLOR.PINBALL
            }
        });
        Matter.World.add(this.world, this.pinball);
        this.resetPinball();
    }

    createEvents() {
        // events for when the pinball hits stuff
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                if (pair.bodyB.label === 'pinball') {
                    switch (pair.bodyA.label) {
                        case 'reset':
                            this.resetPinball();
                            break;
                        case 'bumper':
                            this.pingBumper(pair.bodyA);
                            break;
                    }
                }
            });
        });

        // regulate pinball
        Matter.Events.on(this.engine, 'beforeUpdate', (event) => {
            // bumpers can quickly multiply velocity, so keep that in check
            Matter.Body.setVelocity(this.pinball, {
                x: Math.max(Math.min(this.pinball.velocity.x, MAX_VELOCITY), -MAX_VELOCITY),
                y: Math.max(Math.min(this.pinball.velocity.y, MAX_VELOCITY), -MAX_VELOCITY),
            });

            // cheap way to keep ball from going back down the shooter lane
            if (!this.waitingForShooter && this.pinball.position.x > 450 && this.pinball.velocity.y > 0) {
                Matter.Body.setVelocity(this.pinball, { x: 0, y: -10 });
            }
        });

        // mouse drag (god mode for grabbing pinball)
        Matter.World.add(this.world, Matter.MouseConstraint.create(this.engine, {
            mouse: Matter.Mouse.create(this.render.canvas),
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        }));

        // keyboard paddle events
        $('body').on('keydown', (e) => {
            if (e.which === 37) { // left arrow key
                this.paddleLeft.up()
            } else if (e.which === 39) { // right arrow key
                this.paddleRight.up()
            } else if (this.waitingForShooter) {
                if (e.key === 'k' || e.key === 'K') {
                    this.launchPower = (this.launchPower + 1) % 12
                } else if (e.key === '0') {
                    this.launchPower = 0
                } else if (e.key === '1') {
                    this.launchPower = 11;
                }
            }
        });
        $('body').on('keyup', (e) => {
            if (e.which === 37) { // left arrow key
                this.paddleLeft.down()
            } else if (e.which === 39) { // right arrow key
                this.paddleRight.down()
            } else if (this.waitingForShooter) {
                if  (e.key ==='k'|| e.key === 'K' || e.key ==='0' || e.key ==='1') {
                    this.launchPinball()
                }
            }
        });

        // click/tap paddle events
        $('.left-trigger')
            .on('mousedown touchstart', (e) => {
                this.paddleLeft.up()
            })
            .on('mouseup touchend', (e) => {
                this.paddleLeft.down()
            });
        $('.right-trigger')
        .on('mousedown touchstart', (e) => {
                this.paddleRight.up()
            })
            .on('mouseup touchend', (e) => {
                this.paddleRight.down()
            });
    }

    resetPinball() {
        this.waitingForShooter = true
        this.updateScore(0);
        Matter.Body.setPosition(this.pinball, { x: 465, y: 957 });
    }

    launchPinball() {
        if (this.waitingForShooter) {
            let velocity = -28.0 - (this.launchPower % 12 - 6.0)*0.333 ;
            console.log(`power: ${this.launchPower} velocity: ${velocity}`)
            Matter.Body.setVelocity(this.pinball, { 
                x: 0, 
                y: velocity
            });
            Matter.Body.setAngularVelocity(this.pinball, 0);
            this.waitingForShooter = false;
            this.launchPower = 5;
        }
    }

    pingBumper(bumper) {
        this.updateScore(this.currentScore + 10);

        // flash color
        bumper.render.fillStyle = COLOR.BUMPER_LIT;
        setTimeout(() => {
            bumper.render.fillStyle = COLOR.BUMPER;
        }, 100);
    }

    updateScore(newCurrentScore) {
        this.currentScore = newCurrentScore;
        $currentScore.text(this.currentScore);

        this.highScore = Math.max(this.currentScore, this.highScore);
        $highScore.text(this.highScore);
    }

    // matter.js has a built in random range function, but it is deterministic
    rand(min, max) {
        return Math.random() * (max - min) + min;
    }


    // contact with these bodies causes pinball to be relaunched
    reset(x, width) {
        return Matter.Bodies.rectangle(x, this.world.bounds.max.y - 19, width, 2, {
            label: 'reset',
            isStatic: true,
            render: {
                fillStyle: '#fff'
            }
        });
    }    
}

window.addEventListener('load', load, false);
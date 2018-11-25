import Wall from './wall.js'
import Path from './path.js'
import Boundary from './boundary.js'
import Bumper from './bumper.js'
import Paddle from './paddle.js'

// plugins
Matter.use(MatterAttractors);

// constants
const PATHS = {
    DOME: '0 0 0 250 19 250 20 231.9 25.7 196.1 36.9 161.7 53.3 129.5 74.6 100.2 100.2 74.6 129.5 53.3 161.7 36.9 196.1 25.7 231.9 20 268.1 20 303.9 25.7 338.3 36.9 370.5 53.3 399.8 74.6 425.4 100.2 446.7 129.5 463.1 161.7 474.3 196.1 480 231.9 480 250 500 250 500 0 0 0',
    DROP_LEFT: '0 0 20 0 70 100 20 150 0 150 0 0',
    DROP_RIGHT: '50 0 68 0 68 150 50 150 0 100 50 0',
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
const GRAVITY = 0.75;
const WIREFRAMES = false;
const PADDLE_PULL = 0.002;
const MAX_VELOCITY = 40;

// score elements
let $currentScore = $('.current-score span');
let $highScore = $('.high-score span');

// shared variables
let pinball, stopperGroup;
let leftUpStopper, leftDownStopper;
let rightUpStopper, rightDownStopper;

const CONFIG = {
    boundaries: [
        new Boundary(250, -30, 500, 100, '#ffffff').boundary,
        new Boundary(250, 830, 500, 100, '#498057').boundary,
        new Boundary(-30, 400, 100, 800, '#495087').boundary,
        new Boundary(530, 400, 100, 800, '#895057').boundary
    ],
    staticBodies: [ 
        new Path(440, 96,PATHS.DOME).path, 
        new Wall(140, 140, 20, 40).wall,
        new Wall(225, 140, 20, 40).wall,
        new Wall(310, 140, 20, 40).wall,
        new Bumper(105, 250).bumper,
        new Bumper(225, 250).bumper,
        new Bumper(345, 250).bumper,
        new Bumper(165, 340).bumper,
        new Bumper(285, 340).bumper,
        new Wall(440, 520, 20, 560).wall,
        new Path(25, 360, PATHS.DROP_LEFT).path,
        new Path(425, 360, PATHS.DROP_RIGHT).path,
        new Wall(120, 510, 20, 120).wall,
        new Wall(330, 510, 20, 120).wall,
        new Wall(60, 529, 20, 160).wall,
        new Wall(390, 529, 20, 160).wall,
        new Wall(93, 624, 20, 98, -0.96).wall,
        new Wall(357, 624, 20, 98, 0.96).wall,
        new Path(79, 740, PATHS.APRON_LEFT).path,
        new Path(371, 740, PATHS.APRON_RIGHT).path
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

        // world (shared)
        this.world = this.engine.world;
        this.world.bounds = {
            min: { x: 0, y: 0},
            max: { x: 500, y: 800 }
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

        // used for collision filtering on various bodies
        stopperGroup = Matter.Body.nextGroup(true);

        // starting values
        this.currentScore = 0;
        this.highScore = 0;
    }

    createStaticBodies(config) {
        config.boundaries.forEach((item) => Matter.World.add(this.world, item))
        CONFIG.staticBodies.forEach((item) => Matter.World.add(this.world, item))       
        Matter.World.add(this.world, [
            this.reset(225, 50),
            this.reset(465, 30)
        ]);
    }

    createPaddles() {

        // these bodies keep paddle swings contained, but allow the ball to pass through
        leftUpStopper = this.stopper(160, 591, 'up', 'paddle-left-comp');
        leftDownStopper = this.stopper(140, 743, 'down', 'paddle-left-comp');
        rightUpStopper = this.stopper(290, 591, 'up', 'paddle-right-comp');
        rightDownStopper = this.stopper(310, 743, 'down', 'paddle-right-comp');
        Matter.World.add(this.world, [leftUpStopper, leftDownStopper, rightUpStopper, rightDownStopper]);

        // this group lets paddle pieces overlap each other
        let paddleGroup = Matter.Body.nextGroup(true);
        this.paddleLeft = new Paddle(this.world, paddleGroup, 'left', 170)
        this.paddleRight = new Paddle(this.world, paddleGroup, 'right', 280)

    }

    createPinball() {
        // x/y are set to when pinball is launched
        pinball = Matter.Bodies.circle(0, 0, 14, {
            label: 'pinball',
            collisionFilter: {
                group: stopperGroup
            },
            render: {
                fillStyle: COLOR.PINBALL
            }
        });
        Matter.World.add(this.world, pinball);
        this.launchPinball();
    }

    createEvents() {
        // events for when the pinball hits stuff
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                if (pair.bodyB.label === 'pinball') {
                    switch (pair.bodyA.label) {
                        case 'reset':
                            this.launchPinball();
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
            Matter.Body.setVelocity(pinball, {
                x: Math.max(Math.min(pinball.velocity.x, MAX_VELOCITY), -MAX_VELOCITY),
                y: Math.max(Math.min(pinball.velocity.y, MAX_VELOCITY), -MAX_VELOCITY),
            });

            // cheap way to keep ball from going back down the shooter lane
            if (pinball.position.x > 450 && pinball.velocity.y > 0) {
                Matter.Body.setVelocity(pinball, { x: 0, y: -10 });
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
            }
        });
        $('body').on('keyup', (e) => {
            if (e.which === 37) { // left arrow key
                this.paddleLeft.down()
            } else if (e.which === 39) { // right arrow key
                this.paddleRight.down()
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

    launchPinball() {
        this.updateScore(0);
        Matter.Body.setPosition(pinball, { x: 465, y: 765 });
        Matter.Body.setVelocity(pinball, { x: 0, y: -25 + this.rand(-2, 2) });
        Matter.Body.setAngularVelocity(pinball, 0);
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


    // invisible bodies to constrict paddles
    stopper(x, y, position, attracteeLabel) {
        return Matter.Bodies.circle(x, y, 40, {
            isStatic: true,
            render: {
                visible: false,
            },
            collisionFilter: {
                group: stopperGroup
            },
            plugin: {
                attractors: [
                    (a, b) => {
                        if (b.label === attracteeLabel) {
                            let paddle = (b.label==='paddle-left-comp') ? this.paddleLeft : this.paddleRight
                            if ((position === 'up' && paddle.isUp) || (position === 'down' && !paddle.isUp)) {
                                return {
                                    x: (a.position.x - b.position.x) * PADDLE_PULL,
                                    y: (a.position.y - b.position.y) * PADDLE_PULL,
                                };
                            }
                        }
                    }
                ]
            }
        });
    }

    // contact with these bodies causes pinball to be relaunched
    reset(x, width) {
        return Matter.Bodies.rectangle(x, 781, width, 2, {
            label: 'reset',
            isStatic: true,
            render: {
                fillStyle: '#fff'
            }
        });
    }    
}

window.addEventListener('load', load, false);
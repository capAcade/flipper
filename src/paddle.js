export default class Paddle {
    constructor(world, paddleGroup, side, paddleX) {
        this.world = world
        this.side = side
        this.down()
        this.paddle = Matter.Bodies.trapezoid(paddleX, this.world.bounds.max.y - 140, 20, 80, 0.33, {
            label: `paddle-${this.side}` ,
            angle: 1.57 * this.sideFactor,
            chamfer: {},
            render: {
                fillStyle: PADDLE_COLOR
            }
        });
        this.brick = Matter.Bodies.rectangle(paddleX + 2 * this.sideFactor, this.world.bounds.max.y - 128, 40, 80, {
            angle: 1.62 * this.sideFactor,
            chamfer: {},
            render: {
                visible: false
            }
        });
        this.comp = Matter.Body.create({
            label: `paddle-${this.side}-comp`,
            parts: [this.paddle, this.brick]
        });
        this.hinge = Matter.Bodies.circle(paddleX - 28 * this.sideFactor, this.world.bounds.max.y - 140, 5, {
            isStatic: true,
            render: {
                visible: false
            }
        });
        this.paddle.collisionFilter.group = paddleGroup
        this.brick.collisionFilter.group = paddleGroup
        this.comp.collisionFilter.group = paddleGroup
        this.hinge.collisionFilter.group = paddleGroup

        this.con = Matter.Constraint.create({
            bodyA: this.comp,
            pointA: { x: -29.5 * this.sideFactor, y: -8.5 },
            bodyB: this.hinge,
            length: 0,
            stiffness: 0
        });
        Matter.World.add(this.world, [this.comp, this.hinge, this.con]);
        // Matter.Body.rotate(this.comp, 0.57 * this.sideFactor, { x: paddleX - 28 * this.sideFactor, y: 660 });
    }

    get isUp() {
        return this._isUp;
    }

    up() {
        this._isUp = true;
    }

    down() {
        this._isUp = false;
    }

    get sideFactor() {
        return this.side === 'left' ? 1 : -1;
    }
}
const PADDLE_COLOR = '#e64980';
export default class Bumper {
    constructor(x, y, color=BUMPER_COLOR) {
        this.bumper = Matter.Bodies.circle(x, y, 25, {
            label: 'bumper',
            isStatic: true,
            render: {
                fillStyle: color
            }
        });
        this.bumper.restitution = BUMPER_BOUNCE;
    }
}

const BUMPER_COLOR = '#fab005'
const BUMPER_BOUNCE = 1.5

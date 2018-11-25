export default class Stopper {
    constructor(x, y, position, attracteeLabel, collisionFilterGroup) {
        this.stopper = Matter.Bodies.circle(x, y, 40, {
            isStatic: true,
            render: {
                visible: false,
            },
            collisionFilter: {
                group: collisionFilterGroup
            },
            plugin: {
                attractors: [
                    (a, b) => {
                        if (this.paddle && b === this.paddle.comp) {
                            if ((position === 'up' && this.paddle.isUp) || (position === 'down' && !this.paddle.isUp)) {
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

    set paddle(paddle) {
        this._paddle = paddle
    }

    get paddle() {
        return this._paddle
    }
}

const PADDLE_PULL = 0.003
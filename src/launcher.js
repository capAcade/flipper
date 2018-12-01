export default class Launcher {
    constructor(pinball, steps=12) {
        this.pinball = pinball
        this.steps = steps
        this.force = Math.floor(this.steps/2)
        this.direction = 1
    }
 
    startPulling() {
        if (!this.alreadyPulling) {
            this.alreadyPulling = true
            this.pulling = setInterval(() => {this.pull()}, 100)
        }
    }

    pull() {
        if (this.force % this.steps == 0) {
            this.direction *= -1
        }
        this.force += this.direction 
    }

    launch() {
        let velocity = -28.0 - 0.66 * (this.force - Math.floor(this.steps/2));
        velocity += Math.random() * 0.333 - 0.333;
        Matter.Body.setVelocity(this.pinball, { 
            x: 0, 
            y: velocity
        })
        Matter.Body.setAngularVelocity(this.pinball, 0);
        this.reset()
    }

    reset() {
        this.alreadyPulling = false
        clearInterval(this.pulling)
        this.force = Math.floor(this.steps/2)
        this.direction = 1
    }
}
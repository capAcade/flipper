export default class Launcher {
    constructor(pinball, steps=12) {
        this.pinball = pinball
        this.steps = steps
        this.force = Math.floor(this.steps/2)
        this.direction = 1
    }

    pull() {
        if (this.force % this.steps == 0) {
            this.direction *= -1
        }
        this.force += this.direction 
    }

    launch() {
        let velocity = -28.0 - 0.333 * (this.force % this.steps - Math.floor(this.steps/2));
        console.log(`launching with force ${this.force} resulted in velocity ${velocity}`)
        Matter.Body.setVelocity(this.pinball, { 
            x: 0, 
            y: velocity
        })
        Matter.Body.setAngularVelocity(this.pinball, 0);

    }
}
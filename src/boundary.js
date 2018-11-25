export default class Boundary {
    
    constructor(world, side, color=BOUNDARY_COLOR) {
        this.world = world;
        let x=0, y=0, width=0, height = 0
        switch (side) {
            case 'top': 
                x = (this.world.bounds.max.x - this.world.bounds.min.x) / 2
                y = this.world.bounds.min.y - BOUNDARY_MARGIN
                width = this.world.bounds.max.x - this.world.bounds.min.x
                height = BOUNDARY_WIDTH
                break
            case 'bottom':
                x = (this.world.bounds.min.x + this.world.bounds.max.x) / 2
                y = this.world.bounds.max.y + BOUNDARY_MARGIN
                width = this.world.bounds.max.x - this.world.bounds.min.x
                height = BOUNDARY_WIDTH
                break
            case 'left':
                x = this.world.bounds.min.x - BOUNDARY_MARGIN
                y = (this.world.bounds.max.y - this.world.bounds.min.y) /2
                width = BOUNDARY_WIDTH
                height = this.world.bounds.max.y - this.world.bounds.min.y
                break
            case 'right':
                x = this.world.bounds.max.x + BOUNDARY_MARGIN
                y = (this.world.bounds.max.y - this.world.bounds.min.y) /2
                width = BOUNDARY_WIDTH
                height = this.world.bounds.max.y - this.world.bounds.min.y
                break
        }

        console.log(side, x, y, width, height)
        this.boundary = Matter.Bodies.rectangle(x, y, width, height, {
            isStatic: true,
                render: {
                    fillStyle: color
                }
            });
  
    }
}

const BOUNDARY_COLOR = '#495057';
const BOUNDARY_WIDTH = 100
const BOUNDARY_MARGIN = 30
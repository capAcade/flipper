export default class Boundary {
    constructor(x, y, width, height, color = BOUNDARY_COLOR) {
        this.boundary = Matter.Bodies.rectangle(x, y, width, height, {
            isStatic: true,
                render: {
                    fillStyle: color
                }
            });
    }

}

const BOUNDARY_COLOR = '#e64980';
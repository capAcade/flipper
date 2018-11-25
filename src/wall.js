const WALL_COLOR = '#15aabf';
export default class Wall {
    
    constructor (x, y, width, height, angle = 0, color = WALL_COLOR) {
		this.wall = Matter.Bodies.rectangle(x, y, width, height, {
			angle: angle,
			isStatic: true,
			chamfer: { radius: 10 },
			render: {
				fillStyle: color
			}
		});
    }
    
}


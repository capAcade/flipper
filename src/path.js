const PATH_COLOR = '#495057'

export default class Path {

    constructor(x,y,path, color=PATH_COLOR) {
        this.path = Matter.Bodies.fromVertices(x, y, Matter.Vertices.fromPath(path), {
            isStatic: true,
            render: {
                fillStyle: color,
                strokeStyle: color,
                lineWidth: 1
            }
        });
    }

}


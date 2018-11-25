export default class Path {

    constructor(x,y,path) {
        this.path = Matter.Bodies.fromVertices(x, y, Matter.Vertices.fromPath(path), {
            isStatic: true,
            render: {
                fillStyle: PATH_COLOR,
                strokeStyle: PATH_COLOR,
                lineWidth: 1
            }
        });
    }

}

const PATH_COLOR = '#495057'
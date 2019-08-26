class TetrisManager {
    constructor(document) {
        this.document = document;
        this.template = this.document.querySelector('#player-template');

        this.instances = [];
    }

    createPlayer() {
        const element = document
            .importNode(this.template.content, true)
            .children[0];

        const tetris = new Tetris(element);

        let tetrisMain = document.getElementById("main")
        tetrisMain.appendChild(tetris.element)

        // this.document.body.appendChild(tetris.element);

        this.instances.push(tetris);

        return tetris;
    }

    removePlayer(tetris) {
        let tetrisMain = document.getElementById("main")
        tetrisMain.removeChild(tetris.element)
        // this.document.body.removeChild(tetris.element);

        this.instances = this.instances.filter(instance => instance !== tetris);
    }

    sortPlayers(tetri) {
        tetri.forEach(tetris => {
            let tetrisMain = document.getElementById("main")
            tetrisMain.appendChild(tetris.element)
            // this.document.body.appendChild(tetris.element);
        });
    }
}

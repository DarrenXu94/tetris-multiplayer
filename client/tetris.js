class Tetris {
    constructor(element, isLocal) {
        this.gameReady = false;
        this.element = element;
        // this.canvas = element.querySelector('canvas');
        this.canvas = element.querySelector('.tetris');

        if (isLocal) {
            this.canvas.height = 600;
            this.canvas.width = 360;

            this.context = this.canvas.getContext('2d');
            this.context.scale(30, 30);
        } else {
            this.context = this.canvas.getContext('2d');
            this.context.scale(20, 20);
        }

        this.increaseDropSpeedCounter = new Date()

        this.arena = new Arena(12, 20);
        this.player = new Player(this);

        this.player.events.listen('score', score => {
            this.updateScore(score);
        });

        this.nextcanvas = element.querySelector('#pieces');
        this.nextcontext = this.nextcanvas.getContext('2d');
        this.nextcontext.scale(20, 20);
        this.nextcontext.fillStyle = '#000';
        this.nextcontext.fillRect(0, 0, this.nextcanvas.height, this.nextcanvas.width);

        this.initSavedPiece()

        this.piecesArray = []

        this.player.events.listen('nextPeices', piecesArray => {
            this.piecesArray = piecesArray
        });

        this.colors = [
            null,
            '#a000f1',
            '#f9e60a',
            '#ef8102',
            '#0f01f2',
            '#01f1f3',
            '#02f100',
            '#f00901',
            'white'
        ];

        let lastTime = 0;
        this._update = (time = 0) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            this.player.update(deltaTime);
            this.drawSavedPiece();
            this.increaseDropSpeed()
            this.draw();
            requestAnimationFrame(this._update);
        };

        this.updateScore(0);
    }

    initSavedPiece() {
        this.savedcanvas = this.element.querySelector('#saved');
        this.savedcontext = this.savedcanvas.getContext('2d');
        this.savedcontext.scale(20, 20);
        this.savedcontext.fillStyle = '#000';
        this.savedcontext.fillRect(0, 0, this.savedcanvas.height, this.savedcanvas.width);
    }

    increaseDropSpeed() {
        // console.log("Speed increased")
        let newTime = new Date()
        if (Math.abs(newTime - this.increaseDropSpeedCounter) > 5000 && this.player.DROP_SLOW > 100) {
            this.increaseDropSpeedCounter = newTime
            this.player.DROP_SLOW = this.player.DROP_SLOW * 0.95
        }
    }

    drawSavedPiece() {
        if (this.player.storedPiece) {
            this.savedcontext.fillStyle = '#000';
            this.savedcontext.fillRect(0, 0, this.savedcanvas.height, this.savedcanvas.width);
            let matrix = this.player.storedPiece
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.savedcontext.fillStyle = this.colors[value];
                        this.savedcontext.fillRect(x, y, 1, 1);
                    }
                });
            });

        }
    }

    draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.nextcontext.fillStyle = '#000';
        this.nextcontext.fillRect(0, 0, this.nextcanvas.height, this.nextcanvas.width);

        this.showNextPieces()

        this.drawMatrix(this.arena.matrix, { x: 0, y: 0 });
        this.drawMatrix(this.player.matrix, this.player.pos);

        if (this.player.futurePiece && !this.player.lineCleared) {
            this.drawMatrix(this.player.futurePiece.matrix, this.player.futurePiece.pos)
        }
    }

    drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = this.colors[value];
                    this.context.fillRect(x + offset.x,
                        y + offset.y,
                        1, 1);
                }
            });
        });
    }

    run() {
        if (this.gameReady) {

            this._update();
        }
    }

    serialize() {
        return {
            arena: {
                matrix: this.arena.matrix,
            },
            player: {
                matrix: this.player.matrix,
                pos: this.player.pos,
                score: this.player.score,
            },
        };
    }

    unserialize(state) {
        this.arena = Object.assign(state.arena);
        this.player = Object.assign(state.player);
        this.updateScore(this.player.score);
        this.draw();
    }

    updateScore(score) {
        this.element.querySelector('.score').innerText = score;
    }

    showNextPieces() {
        if (this.piecesArray.length > 1) {
            this.piecesArray.forEach((value, i) => {
                // console.log('%d: %s', i, value);
                // let matrix = this.piecesArray[i]
                let matrix = value
                matrix.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value !== 0) {
                            this.nextcontext.fillStyle = this.colors[value];
                            this.nextcontext.fillRect(x + i * 5, y, 1, 1);
                        }
                    });
                });
            });
        }
    }
}
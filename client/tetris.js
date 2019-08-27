class Tetris {
    constructor(element) {
        this.gameReady = false;
        this.element = element;
        // this.canvas = element.querySelector('canvas');
        this.canvas = element.querySelector('.tetris');
        this.context = this.canvas.getContext('2d');
        this.context.scale(20, 20);

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

        this.piecesArray = []

        this.player.events.listen('nextPeices', piecesArray => {
            this.piecesArray = piecesArray
        });

        this.colors = [
            null,
            '#FF0D72',
            '#0DC2FF',
            '#0DFF72',
            '#F538FF',
            '#FF8E0D',
            '#FFE138',
            '#3877FF',
        ];

        let lastTime = 0;
        this._update = (time = 0) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            this.player.update(deltaTime);
            this.element.querySelector('.juice').innerText = this.player.pauseJuice + " space juice left";


            this.draw();
            requestAnimationFrame(this._update);
        };

        this.updateScore(0);
    }

    draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.nextcontext.fillStyle = '#000';
        this.nextcontext.fillRect(0, 0, this.nextcanvas.height, this.nextcanvas.width);

        this.showNextPieces()


        this.drawMatrix(this.arena.matrix, { x: 0, y: 0 });
        this.drawMatrix(this.player.matrix, this.player.pos);
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
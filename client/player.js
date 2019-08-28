class Player {
    constructor(tetris) {
        this.DROP_SLOW = 1000;
        this.DROP_FAST = 50;

        this.events = new Events;

        this.tetris = tetris;
        this.arena = tetris.arena;

        this.dropCounter = 0;
        this.dropInterval = this.DROP_SLOW;

        this.pos = { x: 0, y: 0 };
        this.matrix = null;
        this.score = 0;

        this.holdingKeyDown = false

        this.nextPeices = []
        this.nextPeicesArrayLength = 3;

        this.pauseJuice = 200;

        this.futurePiece = null

        this.piecesAvailable = "ILJOTSZ".split("")

        this.reset();
    }

    createPiece(type) {
        if (type === 'T') {
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        } else if (type === 'O') {
            return [
                [2, 2],
                [2, 2],
            ];
        } else if (type === 'L') {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        } else if (type === 'J') {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        } else if (type === 'I') {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'Z') {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        }
    }

    drop() {
        this.pos.y++;
        this.dropCounter = 0;
        if (this.arena.collide(this)) {
            this.pos.y--;
            this.arena.merge(this);
            this.reset();
            this.score += this.arena.sweep(this);
            this.events.emit('score', this.score);
            return;
        }
        this.events.emit('pos', this.pos);
        this.events.emit('nextPeices', this.nextPeices);
        this.showFuturePiece()

    }

    restoreHoldEnergy(amount) {
        this.pauseJuice += amount
    }

    holdPiece() {
        if (this.pauseJuice) {

            this.dropInterval = 6000;
            this.pauseJuice--;
        }
    }

    showFuturePiece() {
        let localPos = this.pos
        let localY = localPos.y
        while (!this.arena.collide({ matrix: this.matrix, pos: { x: this.pos.x, y: localY } })) {
            localY += 1
        }

        let coloredMatrix = [];
        this.matrix.forEach((row, y) => {
            let newRow = []
            row.forEach((value, x) => {
                if (value !== 0) {
                    newRow.push(8)
                } else {
                    newRow.push(0)
                }
            })
            coloredMatrix.push(newRow)
        })

        this.futurePiece = { matrix: coloredMatrix, pos: { x: this.pos.x, y: localY - 1 } }
    }

    move(dir) {
        this.pos.x += dir;
        if (this.arena.collide(this)) {
            this.pos.x -= dir;
            return;
        }
        this.showFuturePiece()
        this.events.emit('pos', this.pos);
    }

    reset() {
        this.futurePiece = null

        const pieces = 'ILJOTSZ';
        while (this.nextPeices.length <= this.nextPeicesArrayLength) {
            let randomIndex = this.piecesAvailable.length * Math.random()
            let pieceSelected = this.piecesAvailable[randomIndex | 0]

            this.piecesAvailable.splice(randomIndex, 1)

            let piece = this.createPiece(pieceSelected);
            this.nextPeices.push(piece)

            if (this.piecesAvailable.length == 0) {
                this.piecesAvailable = pieces.split("")
            }
        }
        this.matrix = this.nextPeices.shift()
        this.pos.y = 0;
        this.pos.x = (this.arena.matrix[0].length / 2 | 0) -
            (this.matrix[0].length / 2 | 0);
        if (this.arena.collide(this)) {
            this.arena.clear();
            this.score = 0;
            this.pauseJuice = 200;
            this.events.emit('score', this.score);
        }

        this.dropInterval = this.DROP_SLOW

        this.events.emit('pos', this.pos);
        this.events.emit('matrix', this.matrix);
    }

    rotate(dir) {
        const pos = this.pos.x;
        let offset = 1;
        this._rotateMatrix(this.matrix, dir);
        while (this.arena.collide(this)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.matrix[0].length) {
                this._rotateMatrix(this.matrix, -dir);
                this.pos.x = pos;
                return;
            }
        }
        this.showFuturePiece()
        this.events.emit('matrix', this.matrix);
    }

    _rotateMatrix(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                        matrix[y][x],
                        matrix[x][y],
                    ];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    update(deltaTime) {
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
    }
}

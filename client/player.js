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

        this.nextPeices = []
        this.nextPeicesArrayLength = 3;

        this.storedPiece = this.createPiece("ILJOTSZ"["ILJOTSZ".length * Math.random() | 0])

        this.futurePiece = null

        this.piecesAvailable = "ILJOTSZ".split("")

        this.gameOver = false

        this.futureY = 0;

        this.timeOfLastCollide = null;
        this.timeIntervalOfCollision = 700;

        // Order matters
        this.reset();
        this.hasSwapped = false;

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
        if (!this.gameOver) {
            this.pos.y++;
            this.dropCounter = 0;
            if (this.arena.collide(this)) {
                this.pos.y--;

                if (this.timeOfLastCollide == null) {
                    this.timeOfLastCollide = new Date()
                } else {
                    let newTime = new Date()
                    if (Math.abs(newTime - this.timeOfLastCollide) > this.timeIntervalOfCollision) {
                        this.pieceSelected = null
                        this.arena.merge(this);
                        this.reset();
                        this.score += this.arena.sweep(this);
                        this.events.emit('score', this.score);
                        this.timeOfLastCollide = null
                        return;
                    }
                }
            } else {
                this.timeOfLastCollide = null

            }

            this.events.emit('pos', this.pos);
            this.events.emit('nextPeices', this.nextPeices);
            this.calculateFutureY()
            this.showFuturePiece()
        }
    }

    calculateFutureY() {
        let localPos = this.pos
        let localY = localPos.y
        while (!this.arena.collide({ matrix: this.matrix, pos: { x: this.pos.x, y: localY } })) {
            localY += 1
        }
        localY = localY - 1;
        this.futureY = localY
    }

    fastDrop() {
        this.calculateFutureY()
        this.pos = { x: this.pos.x, y: this.futureY }
        this.timeOfLastCollide = new Date() - 2 * this.timeIntervalOfCollision

        this.drop()
        this.showFuturePiece()
    }

    holdPiece() {
        if (!this.hasSwapped) {
            this.hasSwapped = true;
            let tempMatrix = JSON.parse(JSON.stringify(this.matrix));
            this.matrix = JSON.parse(JSON.stringify(this.storedPiece));
            this.storedPiece = JSON.parse(JSON.stringify(tempMatrix));

            this.pos.y = 0;
            this.pos.x = (this.arena.matrix[0].length / 2 | 0) -
                (this.matrix[0].length / 2 | 0);
            this.showFuturePiece()
        }

    }

    showFuturePiece() {
        this.calculateFutureY()

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

        this.futurePiece = { matrix: coloredMatrix, pos: { x: this.pos.x, y: this.futureY } }
    }

    move(dir) {

        if (!this.gameOver) {
            this.pos.x += dir;
            if (this.arena.collide(this)) {
                this.pos.x -= dir;
                this.pieceSelected = null
                return;
            }
            this.showFuturePiece()
            this.events.emit('pos', this.pos);
        }
    }

    newGame() {
        this.DROP_SLOW = 300;
        this.arena.clear();
        this.score = 0;
        this.events.emit('score', this.score);
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
            this.gameOver = true

        }

        this.dropInterval = this.DROP_SLOW

        this.events.emit('pos', this.pos);
        this.events.emit('matrix', this.matrix);
        this.hasSwapped = false;

    }

    rotate(dir) {
        if (!this.gameOver) {
            this.timeOfLastCollide = new Date()

            const pos = this.pos.x;
            let offset = 1;
            this._rotateMatrix(this.matrix, dir);
            while (this.arena.collide(this)) {
                this.pos.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));
                if (offset > this.matrix[0].length) {
                    this._rotateMatrix(this.matrix, -dir);
                    this.pos.x = pos;
                    this.pieceSelected = null;
                    this.pos.y--;
                    this.pos.y--;
                    return;
                }
            }
            this.showFuturePiece()
            this.events.emit('matrix', this.matrix);
        }
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

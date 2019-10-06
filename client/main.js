let tetrisLocal;
let connectionManager;

function setup() {
    const tetrisManager = new TetrisManager(document);
    tetrisLocal = tetrisManager.createPlayer();
    tetrisLocal.element.classList.add('local');
    tetrisLocal.run();

    connectionManager = new ConnectionManager(tetrisManager);
    connectionManager.connect('wss://boiling-coast-74828.herokuapp.com/')
    // connectionManager.connect('ws://localhost:9000');

}
const keyListener = (event) => {
    [
        [90, 88, 38],
    ].forEach((key, index) => {
        const player = tetrisLocal.player;
        if (event.type === 'keydown') {
            if (event.keyCode === key[0]) {
                player.rotate(-1);
            } else if (event.keyCode === key[1]) {
                player.rotate(1);
            } else if (event.keyCode === key[2]) {
                player.fastDrop()
            } else if (event.keyCode == "13") {
                tetrisLocal.gameReady = true
                hideEnterMessage()
                tetrisLocal.run()
                connectionManager.sendStartNotification()
            }
            else if (event.keyCode == "32") {
                let player = tetrisLocal.player;
                player.holdPiece()
            }
        } else {
            player.dropInterval = player.DROP_SLOW;
        }

    })
}
document.addEventListener('keydown', keyListener);
document.addEventListener('keyup', keyListener);

function hideEnterMessage() {
    document.getElementsByClassName('layover')[0].style.display = "none"
}

let lastTimePressed = new Date()
function draw() {
    const player = tetrisLocal.player;
    let newDate = new Date()
    // Gives a playable delay
    if (Math.abs(newDate - lastTimePressed) > 70) {
        if (keyIsDown(LEFT_ARROW)) {
            player.move(-1);
            lastTimePressed = 0
        } else if (keyIsDown(RIGHT_ARROW)) {
            player.move(1);
            lastTimePressed = 0
        } else if (keyIsDown(DOWN_ARROW)) {
            player.dropInterval = player.DROP_FAST;
            lastTimePressed = 0
        }
        // else if (keyIsDown(32)) {
        //     player.holdPiece()

        // }
        lastTimePressed = newDate
    }

}
let tetrisLocal;

function setup() {
    const tetrisManager = new TetrisManager(document);
    tetrisLocal = tetrisManager.createPlayer();
    tetrisLocal.element.classList.add('local');
    tetrisLocal.run();
    const connectionManager = new ConnectionManager(tetrisManager);
    connectionManager.connect('ws://localhost:9000');

}
const keyListener = (event) => {
    [
        [90, 88, 38],
    ].forEach((key, index) => {
        const player = tetrisLocal.player;
        if (event.type === 'keydown') {
            console.log(player.holdingKeyDown)

            if (event.keyCode === key[0]) {
                player.rotate(-1);
            } else if (event.keyCode === key[1]) {
                player.rotate(1);
            } else if (event.keyCode === key[2]) {
                if (!player.holdingKeyDown) {

                    player.dropInterval = 1;
                    player.holdingKeyDown = true;
                }
            }
        } else {
            player.dropInterval = player.DROP_SLOW;
            player.holdingKeyDown = false
        }

    })
}
document.addEventListener('keydown', keyListener);
document.addEventListener('keyup', keyListener);


function draw() {
    const player = tetrisLocal.player;

    if (keyIsDown(LEFT_ARROW)) {
        player.move(-1);
    } else if (keyIsDown(RIGHT_ARROW)) {
        player.move(1);
    } else if (keyIsDown(DOWN_ARROW)) {
        player.dropInterval = player.DROP_FAST;
        // } else if (keyIsDown(UP_ARROW)) {
        // player.dropInterval = 1;
    } else if (keyIsDown(32)) {
        player.holdPiece()
    }
    // else {
    //     player.dropInterval = player.DROP_SLOW;
    // }
}
const tetrisManager = new TetrisManager(document);
// Dont start until someone has connected?
const tetrisLocal = tetrisManager.createPlayer();
tetrisLocal.element.classList.add('local');
tetrisLocal.run();

const connectionManager = new ConnectionManager(tetrisManager);
// connectionManager.connect('ws://' + window.location.hostname + ':9000');
connectionManager.connect('ws://localhost:9000');


const keyListener = (event) => {
    [
        [37, 39, 90, 90, 40, 38],
    ].forEach((key, index) => {
        const player = tetrisLocal.player;
        if (event.type === 'keydown') {
            console.log("KEYDOWN")
            if (event.keyCode === key[0]) {
                player.move(-1);
            } else if (event.keyCode === key[1]) {
                player.move(1);
            } else if (event.keyCode === key[2]) {
                player.rotate(-1);
            } else if (event.keyCode === key[3]) {
                player.rotate(1);
            }
        }

        if (event.keyCode === key[4]) {
            if (event.type === 'keydown') {
                if (player.dropInterval !== player.DROP_FAST) {
                    player.drop();
                    player.dropInterval = player.DROP_FAST;
                }
            } else {
                player.dropInterval = player.DROP_SLOW;
            }
        }

        if (event.keyCode === key[5]) {
            if (event.type === 'keydown') {
                if (player.dropInterval !== player.DROP_FAST) {
                    if (!player.holdingKeyDown) {

                        player.drop();
                        player.dropInterval = 1;
                        player.holdingKeyDown = true
                    }
                }
            } else {
                player.dropInterval = player.DROP_SLOW;
                player.holdingKeyDown = false

            }
        }
    });
};

document.addEventListener('keydown', keyListener);
document.addEventListener('keyup', keyListener);

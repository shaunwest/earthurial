
$(document).ready(function() {
    var config          = EARTH.config,

        // Models
        board           = EARTH.board,
        score           = EARTH.score,
        tileSheets      = EARTH.tileSheets,
        sounds          = EARTH.sounds,
        time            = EARTH.time,

        // Managers
        assetManager    = EARTH.assetManager,
        audioManager    = EARTH.audioManager,
        inputManager    = EARTH.inputManager,
        timeManager     = EARTH.timeManager,
        gameManager     = EARTH.gameManager,

        // Views
        boardView       = EARTH.boardView,
        stonesView      = EARTH.stonesView,
        hudView         = EARTH.hudView,

        // Factories
        tileFactory     = EARTH.tileFactory,

        // Other
        $canvas         = $("#gameDisplay"),
        canvas          = $canvas.get(0),
        $fps            = $("#fps"),
        $debug          = $("#debug");


    // Init config values
    board.boardWidth            = config.boardWidth;
    board.boardHeight           = config.boardHeight;
    board.tileWidth             = config.tileWidth;
    board.tileHeight            = config.tileHeight;

    score.bonusStonesEnabled    = config.bonusStonesEnabled;

    time.targetFps              = config.targetFps,


    // Get our graphics and sfx
    assetManager.load({
        tileSheets: {
            model: tileSheets,
            assets: [
                {id: "gameTiles", path: "img/tiles.png", tileWidth: board.tileWidth, tileHeight: board.tileHeight}
            ]
        },

        sounds: {
            model: sounds,
            assets: [
                {
                    id: "gameSfx",
                    path: "audio/gameSfx.mp3"
                    /*paths: [
                        "audio/chime1.mp3", "audio/chime2.mp3", "audio/chime3.mp3",
                        "audio/chime4.mp3", "audio/chime5.mp3", "audio/chime6.mp3",
                        "audio/chime7.mp3", "audio/chime8.mp3", "audio/chime9.mp3",
                        "audio/chime10.mp3"
                    ]*/
                }
            ]
        }
    });

    // When assets are ready, initialize everything and start the game
    assetManager.onReady(
        function() {
            // Handles sfx
            audioManager.init(sounds, function() {
                // Handles mouse, touch, and keyboard interactions from the user
                inputManager.init($canvas);

                // Controls every aspect of the core game play
                gameManager.init(inputManager, score, tileFactory, config.fallSpeed, audioManager);
                gameManager.createBoard(board, null);

                // The visible board
                boardView.init(canvas, board, tileSheets.tileSheets["gameTiles"]);

                // Shows the stone types that are selected currently
                stonesView.init(score, {
                    greenStone: $(".greenStone"),
                    blackStone: $(".blackStone"),
                    blueStone: $(".blueStone"),
                    purpleStone: $(".purpleStone"),
                    redStone: $(".redStone")
                });

                // Shows the temp score, the player's total score, and the time
                hudView.init(score, time, $(".score"), $(".points"), $(".timer"));

                // Manages the main game loop
                timeManager.init(
                    time,
                    update,
                    function() {
                        boardView.draw();
                        stonesView.draw();
                        hudView.draw();
                    }
                );

                //timeManager.$reportFps = $fps;
                timeManager.start();
            });
        }
    );

    function update(secondsElapsed) {
        //$debug.html(Math.floor(timeManager.timerCount) + "<br>" + score.debug() + board.debug() + inputManager.debug());
        gameManager.update(secondsElapsed);
    }
});





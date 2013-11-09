
$(document).ready(function() {
    var config = EARTH.config,
        board = EARTH.board,
        score = EARTH.score,
        assetManager = EARTH.assetManager,
        inputManager = EARTH.inputManager,
        timeManager = EARTH.timeManager,
        gameManager = EARTH.gameManager,
        boardView = EARTH.boardView,
        tileFactory = EARTH.tileFactory,
        $canvas = $("#gameDisplay"),
        canvas = $canvas.get(0),
        $fps = $("#fps"),
        $debug = $("#debug");

    board.boardWidth = config.boardWidth;
    board.boardHeight = config.boardHeight;
    board.tileWidth = config.tileWidth;
    board.tileHeight = config.tileHeight;

    assetManager.loadTileSheet("gameTiles", "img/tiles.png", board.tileWidth, board.tileHeight,
        function() {
            // Handles mouse, touch, and keyboard interactions from the user
            inputManager.init($canvas);

            // Controls every aspect of the core gameplay
            gameManager.init(inputManager, score, tileFactory);
            gameManager.createBoard(board, null);

            // The visible board
            boardView.init(canvas, board, assetManager.tileSheets["gameTiles"]);

            // Manages the main game loop
            timeManager.init(
                config.targetFps,
                update,
                $.proxy(boardView.draw, boardView)
            );

            timeManager.$reportFps = $fps;
            timeManager.start();
        }
    );

    function update() {
        $debug.html(score.debug() + board.debug());
        gameManager.update();
    }
});





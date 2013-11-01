
$(document).ready(function() {
    var config = EARTH.config,
        board = EARTH.board,
        assetManager = EARTH.assetManager,
        gameManager = EARTH.gameManager,
        boardView = EARTH.boardView,
        tileFactory = EARTH.tileFactory,
        canvas = $("#gameDisplay");

    board.boardWidth = config.boardWidth;
    board.boardHeight = config.boardHeight;
    board.tileWidth = config.tileWidth;
    board.tileHeight = config.tileHeight;

    assetManager.loadTileSheet("gameTiles", "img/tiles.png", board.tileWidth, board.tileHeight,
        function() {
            gameManager.createBoard(board, null, tileFactory);
            boardView.init(canvas, board, assetManager.tileSheets["gameTiles"]);
            boardView.draw();
        }
    );
});





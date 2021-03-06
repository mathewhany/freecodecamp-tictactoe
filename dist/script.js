const app = new Vue({
  el: "#app",

  data: {
    firstPlayer: "",

    activePlayer: "",

    enableAI: "",

    score: {
      X: 0,
      O: 0 },


    board: [],

    gameStatus: "turn",

    frozen: false,

    showGameConfigurator: true,

    winConditions: [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    // Diagonals
    [0, 4, 8],
    [2, 4, 6]],


    highlight: [] },


  watch: {
    board(value) {
      if (this.isWin()) {
        this.gameStatus = "win";
      } else if (this.getPossibleMoves().length == 0) {
        this.gameStatus = "draw";
      } else {
        this.switchPlayers();
      }
    },

    gameStatus(value) {
      if (value == "win") {
        this.score[this.activePlayer]++;
        this.highlight = this.isWin();
      }

      if (value == "win" || value == "draw") {
        this.nextRound();
      }
    } },


  computed: {
    gameStatusMsg() {
      switch (this.gameStatus) {
        case "turn":
          return `${this.activePlayer}'s turn`;
        case "win":
          return `${this.activePlayer} is the winner!`;
        case "draw":
          return "Oh! It's a draw";}

    },

    secondPlayer() {
      return this.oppositePlayer(this.firstPlayer);
    },

    isAiPlayer() {
      return this.enableAI && this.activePlayer == this.secondPlayer;
    } },


  mounted() {
    this.reset();
  },

  methods: {
    nextRound() {
      this.frozen = true;

      setTimeout(() => {
        this.reset();
        this.frozen = false;
      }, 3000);
    },

    startGame() {
      this.showGameConfigurator = false;
      this.activePlayer = this.firstPlayer;
    },

    reset() {
      this.board = Array(9).fill(null);
      this.highlight = [];
      this.gameStatus = "turn";

      if (this.isAiPlayer) {
        this.playBestMove();
      }
    },

    playAt(cell) {
      if (!this.board[cell] && !this.frozen) {
        this.$set(this.board, cell, this.activePlayer);
      }
    },

    isWin(player = this.activePlayer, board = this.board) {
      for (let wc of this.winConditions) {
        if (
        board[wc[0]] == player &&
        board[wc[1]] == player &&
        board[wc[2]] == player)
        {
          return wc;
        }
      }

      return false;
    },

    findBestMove(
    player,
    board = this.board,
    depth = 1,
    alpha = -Infinity,
    beta = Infinity)
    {
      const emptyPositions = this.getPossibleMoves(board);
      if (depth == 1) console.log(emptyPositions);
      if (this.isWin(player, board)) {
        return { score: 1 / depth };
      } else if (this.isWin(this.oppositePlayer(player), board)) {
        return { score: -depth };
      } else if (emptyPositions.length == 0) {
        return { score: 0 };
      }

      let bestMove = { score: -Infinity };

      for (let position of emptyPositions) {
        board[position] = player;

        const res = this.findBestMove(
        this.oppositePlayer(player),
        board,
        depth + 1,
        -beta,
        -alpha);


        const score = -res.score;

        if (score > bestMove.score) {
          bestMove = { position, score };
        }

        alpha = Math.max(score, alpha);

        delete board[position];

        if (alpha >= beta) {
          break;
        }
      }

      return bestMove;
    },

    getPossibleMoves(board = this.board) {
      let res = [];

      for (let [i, cell] of board.entries()) {
        if (cell == null) res.push(i);
      }

      return res;
    },

    switchPlayers() {
      this.activePlayer = this.oppositePlayer(this.activePlayer);

      if (this.isAiPlayer) {
        this.playBestMove();
      }
    },

    oppositePlayer(player) {
      return player == "X" ? "O" : "X";
    },

    playBestMove() {
      const bestMove = this.findBestMove(this.activePlayer);
      this.playAt(bestMove.position);
    } } });
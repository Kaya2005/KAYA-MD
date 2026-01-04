// ==================== tictactoe.js ====================
export default class TicTacToe {
    constructor(playerX = 'x', playerO = 'o') {
        this.playerX = playerX;
        this.playerO = playerO;
        this._currentTurn = false; // false = X, true = O
        this._x = 0; // Bitboard pour X
        this._o = 0; // Bitboard pour O
        this.turns = 0;
    }

    // Retourne le bitboard combiné
    get board() {
        return this._x | this._o;
    }

    // Joueur courant
    get currentTurn() {
        return this._currentTurn ? this.playerO : this.playerX;
    }

    // Vérifie le gagnant
    get winner() {
        const winningPatterns = [
            0b111000000, // Ligne 1
            0b000111000, // Ligne 2
            0b000000111, // Ligne 3
            0b100100100, // Colonne 1
            0b010010010, // Colonne 2
            0b001001001, // Colonne 3
            0b100010001, // Diagonale TL-BR
            0b001010100  // Diagonale TR-BL
        ];

        // Vérifie X
        for (let pattern of winningPatterns) {
            if ((this._x & pattern) === pattern) return this.playerX;
        }

        // Vérifie O
        for (let pattern of winningPatterns) {
            if ((this._o & pattern) === pattern) return this.playerO;
        }

        return null;
    }

    // Jouer un tour
    // player = true si O, false si X
    // pos = 0-8
    turn(player, pos) {
        if (this.winner || pos < 0 || pos > 8) return -1; // Jeu terminé ou position invalide
        if ((this._x | this._o) & (1 << pos)) return 0; // Case occupée

        const value = 1 << pos;
        if (this._currentTurn) {
            this._o |= value;
        } else {
            this._x |= value;
        }

        this._currentTurn = !this._currentTurn;
        this.turns++;
        return 1;
    }

    // Retourne le plateau pour affichage
    render() {
        return [...Array(9)].map((_, i) => {
            const bit = 1 << i;
            return this._x & bit ? 'X' : this._o & bit ? 'O' : i + 1;
        });
    }
}
const games = {};

const getGameBoard = (board) => {
    return `
        ${board[0]} | ${board[1]} | ${board[2]}
        ---------
        ${board[3]} | ${board[4]} | ${board[5]}
        ---------
        ${board[6]} | ${board[7]} | ${board[8]}
    `;
};

const checkWin = (board, player) => {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    return winPatterns.some(pattern => pattern.every(index => board[index] === player));
};

module.exports = {
    name: 'tictactoe',
    description: 'Jouer à Tic-Tac-Toe.',
    execute(message, args) {
        const opponent = message.mentions.users.first();

        if (!opponent || opponent.bot) {
            return message.reply('Veuillez mentionner un utilisateur valide pour jouer.');
        }

        if (games[message.channel.id]) {
            return message.reply('Une partie est déjà en cours dans ce canal.');
        }

        const board = Array(9).fill(' ');
        const currentPlayer = 'X';

        games[message.channel.id] = {
            board,
            currentPlayer,
            players: [message.author.id, opponent.id]
        };

        message.channel.send(`**Tic-Tac-Toe**\n${getGameBoard(board)}`);

        const filter = m => games[message.channel.id] && games[message.channel.id].players.includes(m.author.id);
        const collector = message.channel.createMessageCollector({ filter, time: 60000 });

        collector.on('collect', m => {
            const game = games[message.channel.id];
            const player = m.author.id === game.players[0] ? 'X' : 'O';

            if (player !== game.currentPlayer) {
                return m.reply('Ce n\'est pas votre tour.');
            }

            const index = parseInt(m.content, 10) - 1;
            if (isNaN(index) || index < 0 || index > 8 || game.board[index] !== ' ') {
                return m.reply('Veuillez choisir une case valide.');
            }

            game.board[index] = player;

            if (checkWin(game.board, player)) {
                message.channel.send(`**Tic-Tac-Toe**\n${getGameBoard(game.board)}\n${m.author} a gagné ! 🎉`);
                delete games[message.channel.id];
                collector.stop();
            } else if (game.board.every(cell => cell !== ' ')) {
                message.channel.send(`**Tic-Tac-Toe**\n${getGameBoard(game.board)}\nMatch nul ! 🤝`);
                delete games[message.channel.id];
                collector.stop();
            } else {
                game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
                message.channel.send(`**Tic-Tac-Toe**\n${getGameBoard(game.board)}`);
            }
        });

        collector.on('end', collected => {
            if (games[message.channel.id]) {
                message.channel.send('La partie a pris trop de temps. 🕒');
                delete games[message.channel.id];
            }
        });
    }
};

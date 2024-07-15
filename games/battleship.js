const games = {};

const createBoard = () => Array(5).fill('🌊');
const placeShip = (board) => {
    const shipPosition = Math.floor(Math.random() * board.length);
    board[shipPosition] = '🚢';
    return board;
};

const getBoardString = (board) => board.join(' | ');

module.exports = {
    name: 'battleship',
    description: 'Jouer à la bataille navale simplifiée.',
    execute(message, args) {
        const opponent = message.mentions.users.first();

        if (!opponent || opponent.bot) {
            return message.reply('Veuillez mentionner un utilisateur valide pour jouer.');
        }

        if (games[message.channel.id]) {
            return message.reply('Une partie est déjà en cours dans ce canal.');
        }

        const playerBoard = placeShip(createBoard());
        const opponentBoard = placeShip(createBoard());

        games[message.channel.id] = {
            playerBoard,
            opponentBoard,
            players: [message.author.id, opponent.id],
            turn: message.author.id
        };

        message.channel.send(`**Bataille Navale**\n${message.author} et ${opponent}, préparez-vous !\n${getBoardString(playerBoard)}`);

        const filter = m => games[message.channel.id] && games[message.channel.id].players.includes(m.author.id);
        const collector = message.channel.createMessageCollector({ filter, time: 60000 });

        collector.on('collect', m => {
            const game = games[message.channel.id];

            if (m.author.id !== game.turn) {
                return m.reply('Ce n\'est pas votre tour.');
            }

            const guess = parseInt(m.content, 10) - 1;
            if (isNaN(guess) || guess < 0 || guess >= game.opponentBoard.length) {
                return m.reply('Veuillez choisir une position valide entre 1 et 5.');
            }

            const opponentBoard = m.author.id === game.players[0] ? game.opponentBoard : game.playerBoard;
            if (opponentBoard[guess] === '🚢') {
                m.reply('🎯 Touché ! 🎯');
                collector.stop();
                delete games[message.channel.id];
            } else {
                m.reply('💦 Manqué ! 💦');
                game.turn = game.players.find(id => id !== m.author.id);
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

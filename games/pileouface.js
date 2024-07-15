const { getUserData, addCoins, removeCoins } = require('../utils/currency');

module.exports = {
    name: 'pileouface',
    description: 'Jouer à pile ou face.',
    execute(message, args) {
        const userId = message.author.id;
        const userData = getUserData(userId);

        const bet = parseInt(args[0], 10);
        const choix = args[1];

        if (isNaN(bet) || bet <= 0) {
            return message.reply('Veuillez placer un pari valide.');
        }

        if (userData.coins < bet) {
            return message.reply('Vous n\'avez pas assez de pièces pour ce pari.');
        }

        if (!choix || (choix !== 'pile' && choix !== 'face')) {
            return message.reply('Veuillez choisir "pile" ou "face".');
        }

        const result = Math.random() < 0.5 ? 'pile' : 'face';
        if (choix === result) {
            addCoins(userId, bet);
            message.reply(`C'est ${result} ! Vous avez gagné ${bet} pièces !`);
        } else {
            removeCoins(userId, bet);
            message.reply(`C'est ${result} ! Vous avez perdu ${bet} pièces.`);
        }
    },
};

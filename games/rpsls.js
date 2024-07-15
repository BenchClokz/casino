const { getUserData, addCoins, removeCoins } = require('../utils/currency');

module.exports = {
    name: 'rpsls',
    description: 'Jouer à Pierre-Papier-Ciseau-Lézard-Spock.',
    execute(message, args) {
        const userId = message.author.id;
        const userData = getUserData(userId);

        const bet = parseInt(args[0], 10);
        const choix = args[1]?.toLowerCase();

        if (isNaN(bet) || bet <= 0) {
            return message.reply('❗ Veuillez placer un pari valide. ❗');
        }

        if (userData.coins < bet) {
            return message.reply('🚫 Vous n\'avez pas assez de pièces pour ce pari. 🚫');
        }

        if (!choix || !['pierre', 'papier', 'ciseau', 'lézard', 'spock'].includes(choix)) {
            return message.reply('❗ Veuillez choisir "Pierre", "Papier", "Ciseau", "Lézard" ou "Spock". ❗');
        }

        const choices = ['pierre', 'papier', 'ciseau', 'lézard', 'spock'];
        const result = choices[Math.floor(Math.random() * choices.length)];

        const winConditions = {
            'pierre': ['ciseau', 'lézard'],
            'papier': ['pierre', 'spock'],
            'ciseau': ['papier', 'lézard'],
            'lézard': ['spock', 'papier'],
            'spock': ['ciseau', 'pierre']
        };

        if (choix === result) {
            message.reply(`🟰 Égalité ! Vous avez tous les deux choisi ${result}. 🟰`);
        } else if (winConditions[choix].includes(result)) {
            addCoins(userId, bet);
            message.reply(`🎉 C'est ${result} ! Vous avez gagné ${bet} pièces ! 🎉`);
        } else {
            removeCoins(userId, bet);
            message.reply(`😢 C'est ${result} ! Vous avez perdu ${bet} pièces. 😢`);
        }
    }
};

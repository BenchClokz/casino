const { getUserData, addCoins, removeCoins } = require('../utils/currency');

module.exports = {
    name: 'pierrepapier',
    description: 'Jouer à pierre, feuille, ciseau.',
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

        if (!choix || !['pierre', 'papier', 'ciseau'].includes(choix)) {
            return message.reply('❗ Veuillez choisir "Pierre", "Papier" ou "Ciseau". ❗');
        }

        const choices = ['pierre', 'papier', 'ciseau'];
        const result = choices[Math.floor(Math.random() * choices.length)];

        const winConditions = {
            'pierre': 'ciseau',
            'papier': 'pierre',
            'ciseau': 'papier'
        };

        if (choix === result) {
            message.reply(`🟰 Égalité ! Vous avez tous les deux choisi ${result}. 🟰`);
        } else if (winConditions[choix] === result) {
            addCoins(userId, bet);
            message.reply(`🎉 C'est ${result} ! Vous avez gagné ${bet} pièces ! 🎉`);
        } else {
            removeCoins(userId, bet);
            message.reply(`😢 C'est ${result} ! Vous avez perdu ${bet} pièces. 😢`);
        }
    }
};

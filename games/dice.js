const { getUserData, addCoins, removeCoins } = require('../utils/currency');

module.exports = {
    name: 'dice',
    description: 'Jouer au jeu de dés.',
    execute(message, args) {
        const userId = message.author.id;
        const userData = getUserData(userId);

        const bet = parseInt(args[0], 10);
        const guess = parseInt(args[1], 10);

        if (isNaN(bet) || bet <= 0) {
            return message.reply('❗ Veuillez placer un pari valide. ❗');
        }

        if (userData.coins < bet) {
            return message.reply('🚫 Vous n\'avez pas assez de pièces pour ce pari. 🚫');
        }

        if (isNaN(guess) || guess < 1 || guess > 6) {
            return message.reply('❗ Veuillez deviner un nombre entre 1 et 6. ❗');
        }

        const diceRoll = Math.floor(Math.random() * 6) + 1;
        message.reply(`🎲 Le dé a roulé et montre ${diceRoll}. 🎲`);

        if (diceRoll === guess) {
            const winnings = bet * 6;
            addCoins(userId, winnings);
            message.reply(`🎉 Vous avez deviné correctement ! Vous gagnez ${winnings} pièces ! 🎉`);
        } else {
            removeCoins(userId, bet);
            message.reply(`😢 Mauvaise chance ! Vous perdez ${bet} pièces. 😢`);
        }
    },
};

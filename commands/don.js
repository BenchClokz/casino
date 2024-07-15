const { getUserData, addCoins, removeCoins } = require('../utils/currency');

module.exports = {
    name: 'don',
    description: 'Donner de l\'argent à un utilisateur.',
    execute(message, args) {
        const userId = message.author.id;
        const target = message.mentions.users.first();

        if (!target) {
            return message.reply('Veuillez mentionner un utilisateur valide.');
        }

        const amount = parseInt(args[1], 10);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Veuillez entrer un montant valide.');
        }

        const userData = getUserData(userId);
        if (userData.coins < amount) {
            return message.reply('Vous n\'avez pas assez de pièces.');
        }

        removeCoins(userId, amount);
        addCoins(target.id, amount);

        message.reply(`Vous avez donné ${amount} pièces à ${target.username}.`);
    },
};

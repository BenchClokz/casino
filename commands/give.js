const { getUserData, addCoins, removeCoins } = require('../utils/currency');

module.exports = {
    name: 'give',
    description: 'Ajouter ou enlever de l\'argent à un joueur (commande staff).',
    execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Vous n\'avez pas les permissions pour utiliser cette commande.');
        }

        const targetId = message.mentions.users.first() ? message.mentions.users.first().id : args[0];
        const amount = parseInt(args[1], 10);

        if (!targetId || isNaN(amount)) {
            return message.reply('Veuillez mentionner un utilisateur valide ou entrer un ID et un montant valide.');
        }

        const userData = getUserData(targetId);
        if (!userData) {
            return message.reply('Utilisateur non trouvé.');
        }

        if (amount < 0) {
            removeCoins(targetId, -amount);
            message.reply(`Vous avez retiré ${-amount} pièces à <@${targetId}>.`);
        } else {
            addCoins(targetId, amount);
            message.reply(`Vous avez ajouté ${amount} pièces à <@${targetId}>.`);
        }
    },
};

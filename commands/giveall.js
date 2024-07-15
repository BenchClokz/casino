const fs = require('fs');
const { addCoins } = require('../utils/currency');
const dataPath = './data.json';

module.exports = {
    name: 'giveall',
    description: 'Donner de l\'argent à tous les joueurs (commande staff).',
    execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Vous n\'avez pas les permissions pour utiliser cette commande.');
        }

        const amount = parseInt(args[0], 10);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Veuillez entrer un montant valide.');
        }

        const data = JSON.parse(fs.readFileSync(dataPath));
        Object.keys(data).forEach(userId => {
            addCoins(userId, amount);
        });

        message.reply(`Vous avez donné ${amount} pièces à tous les joueurs.`);
    },
};

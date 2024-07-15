const fs = require('fs');
const dataPath = './data.json';

module.exports = {
    name: 'reseteconomy',
    description: 'Réinitialiser l\'économie (commande staff).',
    execute(message) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Vous n\'avez pas les permissions pour utiliser cette commande.');
        }

        const data = JSON.parse(fs.readFileSync(dataPath));
        Object.keys(data).forEach(userId => {
            data[userId].coins = 500;
        });
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        message.reply('L\'économie a été réinitialisée. Tous les joueurs ont maintenant 500 pièces.');
    },
};

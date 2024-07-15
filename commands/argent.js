const { getUserData } = require('../utils/currency');

module.exports = {
    name: 'argent',
    description: 'Afficher l\'argent que vous possédez.',
    execute(message) {
        const userId = message.author.id;
        const userData = getUserData(userId);
        message.reply(`Vous avez ${userData.coins} pièces.`);
    },
};

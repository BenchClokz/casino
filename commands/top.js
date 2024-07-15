const fs = require('fs');
const path = require('path');
const { ensureDataFile, getUserData } = require('../utils/currency'); // Importe ensureDataFile depuis currency.js

const dataPath = path.join(__dirname, '../userData.json');

module.exports = {
    name: 'top',
    description: 'Afficher le top des joueurs.',
    execute(message) {
        ensureDataFile(); // Assurez-vous que le fichier de données existe
        const userData = JSON.parse(fs.readFileSync(dataPath));
        const topPlayers = Object.entries(userData)
            .sort(([, a], [, b]) => b.coins - a.coins)
            .slice(0, 10)
            .map(([userId, data], index) => `${index + 1}. <@${userId}>: ${data.coins} pièces`)
            .join('\n');
        
        message.channel.send(`Top 10 des joueurs :\n${topPlayers}`);
    },
};

const { getUserData, addCoins, updateUserData } = require('../utils/currency');
const responses = require('../responses.json');

const formatResponse = (template, variables) => {
    return template.replace(/{(\w+)}/g, (_, key) => variables[key] || '');
};

module.exports = {
    name: 'daily',
    description: 'Réclamer votre récompense quotidienne.',
    execute(message) {
        const userId = message.author.id;
        const userData = getUserData(userId);

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (now - userData.lastDaily < oneDay) {
            const remainingTime = userData.lastDaily + oneDay - now;
            const hours = Math.floor(remainingTime / 1000 / 60 / 60);
            const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
            return message.reply(formatResponse(responses.daily.claimed, { hours, minutes }));
        }

        const dailyReward = Math.floor(Math.random() * 100) + 1;
        addCoins(userId, dailyReward);
        userData.lastDaily = now;
        updateUserData(userId, userData);

        message.reply(formatResponse(responses.daily.reward, { amount: dailyReward }));
    },
};

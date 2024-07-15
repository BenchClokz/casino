const { getUserData, addCoins, removeCoins } = require('../utils/currency');
const config = require('../probabilities.json');
const responses = require('../responses.json');
const cooldowns = new Map();

const checkCooldown = (userId, commandName, cooldownTime) => {
    if (!cooldowns.has(userId)) {
        cooldowns.set(userId, {});
    }

    const userCooldowns = cooldowns.get(userId);
    if (!userCooldowns[commandName]) {
        userCooldowns[commandName] = 0;
    }

    const now = Date.now();
    if (now < userCooldowns[commandName]) {
        return false;
    }

    userCooldowns[commandName] = now + cooldownTime * 1000;
    return true;
};

const formatResponse = (template, variables) => {
    return template.replace(/{(\w+)}/g, (_, key) => variables[key] || '');
};

module.exports = {
    name: 'roulette',
    description: 'Jouer à la roulette.',
    async execute(message, args) {
        const userId = message.author.id;
        const rouletteConfig = config.roulette;
        const responseConfig = responses.roulette;
        const cooldownTime = rouletteConfig.cooldown;

        if (!checkCooldown(userId, this.name, cooldownTime)) {
            const remaining = Math.ceil((cooldowns.get(userId)[this.name] - Date.now()) / 1000);
            return message.reply(formatResponse(responseConfig.cooldown, { time: remaining }));
        }

        const userData = getUserData(userId);
        const bet = parseInt(args[0], 10);
        const choice = args[1];

        if (isNaN(bet) || bet <= 0 || !choice) {
            return message.reply(responseConfig.invalidBet);
        }

        if (userData.coins < bet) {
            return message.reply(responseConfig.notEnoughCoins);
        }

        const numbers = rouletteConfig.numbers;
        const colors = rouletteConfig.colors;
        const probabilities = rouletteConfig.probabilities;

        const getRandomOutcome = (type) => {
            const rand = Math.random();
            let cumulative = 0;
            for (const option in probabilities[type]) {
                cumulative += probabilities[type][option];
                if (rand < cumulative) {
                    return option;
                }
            }
        };

        const resultNumber = getRandomOutcome('number');
        const resultColor = getRandomOutcome('color');

        const animateRoulette = async (message, resultNumber, resultColor) => {
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
            const display = `La roulette tourne... 🎡`;
            const rouletteMessage = await message.channel.send(display);

            await delay(3000);
            await rouletteMessage.edit(`La roulette s'arrête sur le numéro ${resultNumber} (${resultColor}).`);
        };

        await animateRoulette(message, resultNumber, resultColor);

        if (choice === resultNumber || choice === resultColor) {
            const winnings = bet * (choice === resultNumber ? 36 : 2); // Gagne 36x pour le bon numéro, 2x pour la bonne couleur
            addCoins(userId, winnings);
            message.channel.send(formatResponse(responseConfig.win, { amount: winnings }));
        } else {
            removeCoins(userId, bet);
            message.channel.send(formatResponse(responseConfig.lose, { amount: bet }));
        }
    },
};

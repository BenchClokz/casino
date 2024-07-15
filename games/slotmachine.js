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
    name: 'slotmachine',
    description: 'Jouer à la machine à sous.',
    async execute(message, args) {
        const userId = message.author.id;
        const slotConfig = config.slotmachine;
        const responseConfig = responses.slotmachine;
        const cooldownTime = slotConfig.cooldown;

        if (!checkCooldown(userId, this.name, cooldownTime)) {
            const remaining = Math.ceil((cooldowns.get(userId)[this.name] - Date.now()) / 1000);
            return message.reply(formatResponse(responseConfig.cooldown, { time: remaining }));
        }

        const userData = getUserData(userId);
        const bet = parseInt(args[0], 10);

        if (isNaN(bet) || bet <= 0) {
            return message.reply(responseConfig.invalidBet);
        }

        if (userData.coins < bet) {
            return message.reply(responseConfig.notEnoughCoins);
        }

        const symbols = slotConfig.symbols;
        const probabilities = slotConfig.probabilities;

        const getRandomSymbol = () => {
            const rand = Math.random();
            let cumulative = 0;
            for (const symbol of symbols) {
                cumulative += probabilities[symbol];
                if (rand < cumulative) {
                    return symbol;
                }
            }
        };

        const animateSlots = async (message, result) => {
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
            let display = `🎰 | ❔ | ❔ | ❔ | 🎰`;
            const slotMessage = await message.channel.send(display);

            for (let i = 0; i < 3; i++) {
                await delay(1000);
                display = display.replace('❔', result[i]);
                await slotMessage.edit(display);
            }

            return slotMessage;
        };

        const result = [
            getRandomSymbol(),
            getRandomSymbol(),
            getRandomSymbol()
        ];

        await animateSlots(message, result);

        if (result[0] === result[1] && result[1] === result[2]) {
            const winnings = bet * slotConfig.payoutMultiplier;
            addCoins(userId, winnings);
            message.channel.send(formatResponse(responseConfig.win, { amount: winnings }));
        } else {
            removeCoins(userId, bet);
            message.channel.send(formatResponse(responseConfig.lose, { amount: bet }));
        }
    },
};

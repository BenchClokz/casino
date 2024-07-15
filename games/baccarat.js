const { getUserData, addCoins, removeCoins } = require('../utils/currency');
const suits = ['♠', '♥', '♣', '♦'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const createDeck = () => {
    let deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    return deck;
};

const drawCard = (deck) => {
    const index = Math.floor(Math.random() * deck.length);
    return deck.splice(index, 1)[0];
};

const handToString = (hand) => hand.map(card => `${card.value}${card.suit}`).join(' ');

const calculateBaccaratScore = (hand) => {
    let score = 0;
    hand.forEach(card => {
        if (['J', 'Q', 'K'].includes(card.value)) {
            score += 0;
        } else if (card.value === 'A') {
            score += 1;
        } else {
            score += parseInt(card.value, 10);
        }
    });
    return score % 10;
};

module.exports = {
    name: 'baccarat',
    description: 'Jouer au baccarat simplifié.',
    execute(message, args) {
        const userId = message.author.id;
        const userData = getUserData(userId);

        const bet = parseInt(args[0], 10);
        const betOn = args[1]?.toLowerCase();

        if (isNaN(bet) || bet <= 0) {
            return message.reply('❗ Veuillez placer un pari valide. ❗');
        }

        if (userData.coins < bet) {
            return message.reply('🚫 Vous n\'avez pas assez de pièces pour ce pari. 🚫');
        }

        if (!['joueur', 'banquier'].includes(betOn)) {
            return message.reply('❗ Veuillez parier sur "joueur" ou "banquier". ❗');
        }

        let deck = createDeck();
        const playerHand = [drawCard(deck), drawCard(deck)];
        const bankerHand = [drawCard(deck), drawCard(deck)];

        const playerScore = calculateBaccaratScore(playerHand);
        const bankerScore = calculateBaccaratScore(bankerHand);

        message.reply(`Main du joueur: ${handToString(playerHand)} (score: ${playerScore})\nMain du banquier: ${handToString(bankerHand)} (score: ${bankerScore})`);

        let winner = '';
        if (playerScore > bankerScore) {
            winner = 'joueur';
        } else if (playerScore < bankerScore) {
            winner = 'banquier';
        } else {
            winner = 'égalité';
        }

        if (winner === betOn) {
            addCoins(userId, bet);
            message.reply(`🎉 Vous avez gagné en pariant sur le ${betOn} ! Vous gagnez ${bet} pièces ! 🎉`);
        } else if (winner === 'égalité') {
            message.reply(`🟰 Égalité ! Vous récupérez votre pari. 🟰`);
        } else {
            removeCoins(userId, bet);
            message.reply(`😢 Vous avez perdu en pariant sur le ${betOn}. Vous perdez ${bet} pièces. 😢`);
        }
    }
};

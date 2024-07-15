const { getUserData, addCoins, removeCoins } = require('../utils/currency');

module.exports = {
    name: 'blackjack',
    description: 'Jouer au blackjack contre le bot.',
    async execute(message, args) {
        const userId = message.author.id;
        const userData = getUserData(userId);

        const bet = parseInt(args[0], 10);
        if (isNaN(bet) || bet <= 0) {
            return message.reply('❗ Veuillez placer un pari valide. ❗');
        }

        if (userData.coins < bet) {
            return message.reply('🚫 Vous n\'avez pas assez de pièces pour ce pari. 🚫');
        }

        // Blackjack game logic
        const deck = createDeck();
        const playerHand = [drawCard(deck), drawCard(deck)];
        const dealerHand = [drawCard(deck), drawCard(deck)];

        let playerScore = calculateHand(playerHand);
        let dealerScore = calculateHand(dealerHand);

        await message.reply(`Votre main: ${handToString(playerHand)} (score: ${playerScore})\nLa main du croupier: ${handToString([dealerHand[0]])}`);

        // Player turn
        while (playerScore < 21) {
            const response = await message.channel.awaitMessages({
                filter: msg => msg.author.id === message.author.id,
                max: 1,
                time: 60000,
                errors: ['time']
            });
            const choice = response.first().content.toLowerCase();

            if (choice === 'hit' || choice === 'draw' || choice === 't') {
                playerHand.push(drawCard(deck));
                playerScore = calculateHand(playerHand);
                await message.reply(`Votre main: ${handToString(playerHand)} (score: ${playerScore})`);
            } else if (choice === 'stand' || choice === 'stop' || choice === 's') {
                break;
            } else {
                await message.reply('❗ Veuillez répondre par "hit" (tirer) ou "stand" (rester). ❗');
            }
        }

        // Dealer turn
        while (dealerScore < 17) {
            dealerHand.push(drawCard(deck));
            dealerScore = calculateHand(dealerHand);
        }

        await message.reply(`La main du croupier: ${handToString(dealerHand)} (score: ${dealerScore})`);

        // Determine the winner
        if (playerScore > 21) {
            removeCoins(userId, bet);
            message.reply(`😢 Vous avez dépassé 21. Vous perdez ${bet} pièces. 😢`);
        } else if (dealerScore > 21 || playerScore > dealerScore) {
            addCoins(userId, bet * 2);
            message.reply(`🎉 Vous gagnez ! Vous avez maintenant ${userData.coins + bet} pièces. 🎉`);
        } else if (playerScore === dealerScore) {
            message.reply('🟰 Égalité ! 🟰');
        } else {
            removeCoins(userId, bet);
            message.reply(`😢 Le croupier gagne avec un score de ${dealerScore}. Vous perdez ${bet} pièces. 😢`);
        }
    },
};

function createDeck() {
    const suits = ['♠', '♥', '♣', '♦'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    return deck;
}

function drawCard(deck) {
    const index = Math.floor(Math.random() * deck.length);
    return deck.splice(index, 1)[0];
}

function calculateHand(hand) {
    let score = 0;
    let aceCount = 0;
    for (const card of hand) {
        if (card.value === 'A') {
            aceCount++;
            score += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value, 10);
        }
    }
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }
    return score;
}

function handToString(hand) {
    return hand.map(card => `${card.value}${card.suit}`).join(' ');
}

const { getUserData, addCoins, removeCoins } = require('../utils/currency');

const questions = [
    {
        question: "Quelle est la capitale de la France ?",
        answers: ["paris"],
        reward: 50
    },
    {
        question: "Combien de planètes y a-t-il dans notre système solaire ?",
        answers: ["8", "huit"],
        reward: 50
    },
    {
        question: "En quel année à était fondé la Nebula",
        answers: ["2023", "deux mille vingt trois"],
        reward: 400
    },
    // Ajoute plus de questions ici
];

module.exports = {
    name: 'nebula-quizz',
    description: 'Jouer à un jeu de questions-réponses.',
    async execute(message) {
        const userId = message.author.id;
        const userData = getUserData(userId);

        const question = questions[Math.floor(Math.random() * questions.length)];
        await message.reply(`❓ ${question.question} ❓`);

        try {
            const response = await message.channel.awaitMessages({
                filter: msg => msg.author.id === message.author.id,
                max: 1,
                time: 30000,
                errors: ['time']
            });

            const answer = response.first().content.toLowerCase();
            if (question.answers.includes(answer)) {
                addCoins(userId, question.reward);
                message.reply(`🎉 Bonne réponse ! Vous gagnez ${question.reward} pièces ! 🎉`);
            } else {
                message.reply(`😢 Mauvaise réponse ! La bonne réponse était "${question.answers[0]}". 😢`);
            }
        } catch {
            message.reply('⏰ Temps écoulé ! Vous avez pris trop de temps pour répondre. ⏰');
        }
    },
};

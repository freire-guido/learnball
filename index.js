import { Football } from './football.js';
import { PolicyNetwork } from './network.js';

function train() {
    const numGames = 5;
    // todo: tune policy and game parameters
    const policyNet = new PolicyNetwork([8, 5, 4], tf.train.adam(0.05));
    const football = new Football(1, 2);
    for (let i = 0; i < numGames; i++) {
        playGame(policyNet, football);
    }
}

async function playGame(policyNet, football) {
    football.setRandomState();
    const gameRewards = [];
    const gameGradients = [];
    const maxStepsPerGame = 1000;
    for (let t = 0; t < maxStepsPerGame; t++) {
        const gradients = policyNet.getGradientsAndSaveActions(football.getStateTensor(0));
        pushGradients(gameGradients, gradients.grad);
        const actions = tf.tensor2d(policyNet.actions, [2, 1]).tile([1, 2]).concat([[[0], [0]]], 1) // todo: add human input
        const isDone = football.update(actions);
        if (isDone) {
            gameRewards.push(0);
            break;
        } else {
            gameRewards.push(-1);
        }
        renderGame(football);
        await tf.nextFrame();
    }
    pushGradients(policyNet.gradients, gameGradients);
    policyNet.rewards.push(gameRewards);
    // todo: epochs
    policyNet.applyGradients();
    return [gameRewards, gameGradients];

    function pushGradients(record, gradients) {
        for (const key in gradients) {
          if (key in record) {
            record[key].push(gradients[key]);
          } else {
            record[key] = [gradients[key]];
          }
        }
    }
}

function renderGame(football) {
    const canvas = document.getElementById('football')
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const players = football.players.dataSync();
    const ball = football.ball.dataSync();
    context.beginPath();
    context.fillStyle = "red";
    for (let i = 0; i < players.length / 2 - 1; i++) {
        context.rect(players[i] - football.playerSize / 2, players[i + players.length / 2] - football.playerSize / 2, football.playerSize, football.playerSize);
        // todo: drawPlayer helper
    }
    context.fill();
    context.beginPath();
    context.fillStyle = "blue";
    context.rect(players[players.length - 2] - football.playerSize / 2, players[players.length - 1] - football.playerSize / 2, football.playerSize, football.playerSize);
    context.fill();
    context.beginPath();
    context.fillStyle = "green";
    context.rect(ball[0] - football.ballSize / 2, ball[1] - football.ballSize / 2, football.ballSize, football.ballSize);
    context.fill();
}

train();
import { Football } from './football.js';
import { PolicyNetwork } from './network.js';

const numIterationsInput = document.getElementById('num-iterations');
const gamesPerIterationInput = document.getElementById('games-per-iteration');
const maxStepsPerGameInput = document.getElementById('max-steps-per-game');
const learningRateInput = document.getElementById('learning-rate');
const renderCheckbox = document.getElementById('render');
const trainButton = document.getElementById('train');
let doRender = true;

async function setup() {
    renderCheckbox.addEventListener('change', () => {
        doRender = renderCheckbox.checked;
    })
    renderCheckbox.checked = doRender;
    trainButton.disabled = false;
    trainButton.addEventListener('click', async () => {
        const numIterations = Number.parseInt(numIterationsInput.value);
        const gamesPerIteration = Number.parseInt(gamesPerIterationInput.value);
        const maxStepsPerGame = Number.parseInt(maxStepsPerGameInput.value);
        const learningRate = Number.parseInt(learningRateInput.value);
        const policyNet = new PolicyNetwork([3, 3], tf.train.adam(learningRate));
        const football = new Football(1.5, 1);

        for (let i = 0; i < numIterations; i++) {
            await train(policyNet, football, gamesPerIteration, maxStepsPerGame);
        }
    })

    tfvis.render.linechart(document.getElementById('plot'), {values: {}}, {
      xLabel: 'Game',
      yLabel: 'Loss',
      width: 400,
      height: 200,
    });
}

async function train(policyNet, football, numGames, maxStepsPerGame) {
    for (let i = 0; i < numGames; i++) {
        await playGame(policyNet, football, maxStepsPerGame);
        renderPlot(policyNet);
        await tf.nextFrame();
    }
    policyNet.applyGradients();
    tf.dispose(policyNet.gradients);
    policyNet.rewards = [];
}

async function playGame(policyNet, football, maxSteps) {
    football.setRandomState();
    const gameRewards = [];
    const gameGradients = [];
    for (let t = 0; t < maxSteps; t++) {
        const gradients = policyNet.getGradientsAndSaveActions(football.getStateTensor(1));
        pushGradients(gameGradients, gradients.grad);
        const actions = tf.tensor2d(policyNet.actions, [2, 1]).concat([[[0], [0]]], 1) // todo: add human input
        const isDone = football.update(actions);
        if (isDone) {
            gameRewards.push(0);
            break;
        } else {
            gameRewards.push(tf.sub(football.ball, football.players.gather([0], 1)).euclideanNorm(0).dataSync()[0]);
        }
        if (doRender) {
            renderGame(football);
            await tf.nextFrame();
        }
    }
    pushGradients(policyNet.gradients, gameGradients);
    policyNet.rewards.push(gameRewards);
    await tf.nextFrame();
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
    context.strokeRect(0, 0, football.pitchWidth, football.pitchHeight);
    context.strokeRect(0, football.pitchHeight / 2 - football.goalWidth / 2, football.playerSize, football.goalWidth);
    context.strokeRect(football.pitchWidth, football.pitchHeight / 2 - football.goalWidth / 2, -football.playerSize, football.goalWidth);

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
    context.rect(players[players.length / 2 - 1] - football.playerSize / 2, players[players.length - 1] - football.playerSize / 2, football.playerSize, football.playerSize);
    context.fill();
    context.beginPath();
    context.fillStyle = "green";
    context.rect(ball[0] - football.ballSize / 2, ball[1] - football.ballSize / 2, football.ballSize, football.ballSize);
    context.fill();
}

function renderPlot(policyNet) {
    const canvas = document.getElementById('plot')
    const rewardsPerGame = [];
    policyNet.rewards.forEach((reward, i) => {
        rewardsPerGame.push({x: i, y: mean(reward)});
    })
    tfvis.render.linechart(canvas, {values: rewardsPerGame}, {
      xLabel: 'Game',
      yLabel: 'Mean Reward',
      width: 400,
      height: 200,
    });
}

function mean(a) {
    let acum = 0
    for (let i = 0; i < a.length; i++) {
        acum += a[i]
    }
    return acum / a.length;
}

setup();
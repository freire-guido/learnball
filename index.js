import { Football } from './football.js';
import { PolicyNetwork } from './network.js';

const gameCanvas = document.getElementById('football');
const plotCanvas = document.getElementById('plot');

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

        const meanRewards = [] 
        for (let i = 0; i < numIterations; i++) {
            const meanReward = await train(policyNet, football, gamesPerIteration, maxStepsPerGame);
            meanRewards.push({x: i + 1, y: meanReward});
            renderPlot(meanRewards);
        }
    })

    tfvis.render.linechart(document.getElementById('plot'), {values: {}}, {
      xLabel: 'Iteration',
      yLabel: 'Mean Reward',
      width: 400,
      height: 200,
    });
}

async function train(policyNet, football, numGames, maxStepsPerGame) {
    let sumReward = 0;
    for (let i = 0; i < numGames; i++) {
        const [ gameRewards, gameGradients ] = await playGame(policyNet, football, maxStepsPerGame);
        pushGradients(policyNet.gradients, gameGradients);
        policyNet.rewards.push(gameRewards);
        sumReward += sum(gameRewards)
        await tf.nextFrame();
    }
    policyNet.applyGradients();
    tf.dispose(policyNet.gradients);
    policyNet.rewards = [];
    return sumReward / numGames;
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
            gameRewards.push(-1);
        }
        if (doRender) {
            renderGame(football);
            await tf.nextFrame();
        }
    }
    await tf.nextFrame();
    return [gameRewards, gameGradients];
}

function renderGame(football) {
    const ctx = gameCanvas.getContext('2d');
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.strokeRect(0, 0, football.pitchWidth, football.pitchHeight);
    ctx.strokeRect(0, football.pitchHeight / 2 - football.goalWidth / 2, football.playerSize, football.goalWidth);
    ctx.strokeRect(football.pitchWidth, football.pitchHeight / 2 - football.goalWidth / 2, -football.playerSize, football.goalWidth);

    const players = football.players.dataSync();
    const ball = football.ball.dataSync();
    ctx.beginPath();
    ctx.fillStyle = "red";
    for (let i = 0; i < players.length / 2 - 1; i++) {
        ctx.rect(players[i] - football.playerSize / 2, players[i + players.length / 2] - football.playerSize / 2, football.playerSize, football.playerSize);
        // todo: drawPlayer helper
    }
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.rect(players[players.length / 2 - 1] - football.playerSize / 2, players[players.length - 1] - football.playerSize / 2, football.playerSize, football.playerSize);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.rect(ball[0] - football.ballSize / 2, ball[1] - football.ballSize / 2, football.ballSize, football.ballSize);
    ctx.fill();
}

function renderPlot(meanRewards) {
    tfvis.render.linechart(plotCanvas, {values: meanRewards}, {
      xLabel: 'Iteration',
      yLabel: 'Mean Reward',
      width: 400,
      height: 200,
    });
}

function pushGradients(record, gradients) {
    for (const key in gradients) {
      if (key in record) {
        record[key].push(gradients[key]);
      } else {
        record[key] = [gradients[key]];
      }
    }
}

function sum(a) {
    let acum = 0
    for (let i = 0; i < a.length; i++) {
        acum += a[i]
    }
    return acum;
}

function mean(a) {
    return sum(a) / a.length;
}

setup();
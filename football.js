export class Football {
    constructor(epsilon, teamSize) {
        this.epsilon = epsilon;
        this.teamSize = teamSize;
        this.playerSize = 20;
        this.ballSize = 5;
        this.pitchWidth = 200;
        this.pitchHeight = this.pitchWidth * 0.5;
        this.goalWidth = this.pitchHeight * 0.8;
        this.setRandomState();
    }
    setRandomState() {
        this.players = tf.concat([
            tf.randomUniform([1, this.teamSize + 1], this.pitchWidth / 2 - this.pitchHeight / 2, this.pitchWidth / 2 + this.pitchHeight / 2),
            tf.randomUniform([1, this.teamSize + 1], 0, this.pitchHeight)
        ]);
        this.ball = tf.concat([
            tf.randomUniform([1, 1], this.pitchWidth / 2 - this.pitchHeight / 4, this.pitchWidth / 2 + this.pitchHeight / 4),
            tf.randomUniform([1, 1], 0, this.pitchHeight /2)
        ]);
    }
    getStateTensor(skip = undefined) {
        if (skip !== undefined) {
            return this.players.slice([0, 0], [2, skip]).concat([this.players.slice([0, skip + 1]), this.ball], 1);
        }
        else {
            return this.players.concat([this.ball], 1);
        }
    }
    update(actions) {
        this.players = this.players.add(actions.mul(this.epsilon));
        return tf.tidy(() => {
            const dplayer = tf.sub(this.players, this.ball);
            const collisions = dplayer.euclideanNorm(0).less(this.playerSize + this.ballSize).reshape([3, 1]);
            this.ball = tf.keep(this.ball.sub(tf.matMul(dplayer, collisions).mul(this.epsilon)));
            return this.isDone();
        })
    }
    isDone() {
        //missing opponent goal and out of field conditions
        return tf.logicalAnd(tf.sub(this.pitchWidth, this.ball.slice([0, 0], [1, 1])).less(this.playerSize), tf.sub(this.pitchHeight * 0.5, this.ball.slice([1, 0])).abs().less(this.goalWidth)).dataSync()[0];
    }
}
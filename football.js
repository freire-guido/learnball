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
        this.players = tf.randomUniform([this.teamSize + 1, 2], this.pitchWidth - this.pitchWidth / 2, this.pitchWidth + this.pitchWidth / 2);
        this.ball = tf.randomUniform([1, 2], this.pitchWidth - this.pitchWidth / 2, this.pitchWidth + this.pitchWidth / 2);
    }
    getStateTensor(skip = this.teamSize) {
        return this.players.slice(0, skip).concat([this.players.slice(skip + 1), this.ball]).expandDims(0);
    }
    async update(actions) {
        return await tf.tidy(() => {
            this.players = this.players.add(actions.mul(epsilon));
            const dplayer = tf.sub(this.players, this.ball);
            const collisions = dplayer.booleanMaskAsync(dplayer.euclideanNorm(1).less(this.playerSize, this.ballSize));
            if (collisions.shape[0] != 0) {
                this.ball = this.ball.sub(collisions.sum(0));
            }
            return this.isDone();
        })
    }
    isDone() {
        //missing opponent goal and out of field conditions
        return tf.sub(this.pitchWidth, this.ball.slice([0, 0], [1, 1])).less(this.playerSize) && tf.sub(this.pitchHeight * 0.5, this.ball.slice([0, 1])).abs().less(goalWidth);
    }
}
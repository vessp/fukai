import React, { Component } from 'react';

(function(global) {
    var console_log = global.console.log
    global.console.log = function() {
        if (!(
            arguments.length == 1 &&
            typeof arguments[0] === 'string' &&
            arguments[0].match(/^\[(HMR|WDS)\]/)
        )) {
            console_log.apply(global.console,arguments)
        }
    }
})(window)

export default class App extends Component {


    constructor() {
        super()
        this.state = this._getInitialState()

        this.canvasWidth = 1000;
        this.canvasHeight = 500;
        this.minX = this.canvasWidth/2 * -1
        this.maxX = this.canvasWidth/2
        this.minY = this.canvasHeight/2 * -1
        this.maxY = this.canvasHeight
    }

    _getInitialState() {
        return {
            
        }
    }

    render() {
        return (
            <div>

                <canvas ref={ref => {this.canvas = ref;this.ctx = this.canvas.getContext("2d")} }
                    width={this.canvasWidth} height={this.canvasHeight} 
                    style={{border:"1px solid #000000"}}>
                </canvas>
                <h4 id='report'></h4>
                
            </div>
        );
    }

    cx(x){
        return x + this.canvasWidth / 2
    }

    cy(y){
        return this.canvasHeight - (y + this.canvasHeight/2)
    }

    drawLine(x0, y0, x1, y1) {
        let ctx = this.ctx
        ctx.moveTo(this.cx(x0),this.cy(y0));
        ctx.lineTo(this.cx(x1),this.cy(y1));
        ctx.stroke();
    }

    drawPoint(x, y, r=1, c="#000000") {
        let ctx = this.ctx
        this.drawRect(x-r/2, y+r/2, r, r, c)
    }

    drawCircle(x, y, r=1, c="#000000") {
        let ctx = this.ctx
        ctx.strokeStyle=c;

        ctx.beginPath();
        ctx.arc(this.cx(x),this.cy(y),r,0,2*Math.PI);
        ctx.stroke();
    }

    drawRect(x, y, w, h, c="#000") {
        let ctx = this.ctx
        // ctx.strokeStyle=c
        ctx.fillStyle=c
        ctx.fillRect(
            this.cx(x),this.cy(y),
            w, h)
    }

    drawClean() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    random(min,max)
    {
        return Math.random() * (max-min) + min
    }

    componentDidMount() {

        let func = (x) => 2*x+50
        let ptron = new Perceptron(2)

        let scoreSum = 0
        let numRounds = 1000
        let curRound = 0

        let doRound = () => {
            this.doTraining(ptron, func)
            let score = this.doTesting(ptron, func)
            scoreSum += score
            // this.setState({score:score})

            if(curRound == numRounds)
                onFinish()
            else
                setTimeout(doRound, 500)
        }

        let onFinish = () => {

            console.log("average score: " + (scoreSum / numRounds * 100).toFixed(2) + "%")
        }

        doRound()
    }

    doTraining(ptron, func) {
        console.log("training.. ", ptron.toString())
        //let trainers = []
        for(let i=0; i<1; i++)
        {
            let x = this.random(this.minX, this.maxX)
            let y = this.random(this.minY, this.maxY)
            let answer = 1
            if(y < func(x))
                answer = -1

            let t = new Trainer(x,y, answer)
            //trainers.push(t)
            ptron.train(t.inputs, t.answer)
        }
        console.log("           ", ptron.toString())
    }

    doTesting(ptron, func) {
        this.drawClean()
        // this.drawPoint(0, 0, 10)
        this.drawLine(this.minX,func(this.minX),this.maxX,func(this.maxX))

        let numCorrect = 0;
        let total = 100
        for(let i=0; i<total; i++)
        {
            let x = this.random(this.minX, this.maxX)
            let y = this.random(this.minY, this.maxY)

            let activated = ptron.feedforward([x,y]); //activates if it thinks its above

            let isAbove = y >= func(x)
            if((activated == 1 && isAbove) || (activated == -1 && !isAbove))
                numCorrect++

            this.drawPoint(x, y, 10, activated==1?"#00f":"#f00")
        }
        let score = numCorrect / total
        console.log("testing..                      score: " + (score * 100) + "%")
        document.getElementById('report').innerHTML = 'Blue should be above line.  Red should be below line.<br/>Iteration Count: ' + ptron.trainingCount + '<br/>Current Score: ' +  (score * 100) + "%"
        return score

        // console.log(p.toString())
        // for(let t of trainers)
        // {
        //     //p.train(t.inputs, t.answer)
        //     //console.log(p.toString())

        //     let guess = p.feedforward(t.inputs);

        //     console.log(t.inputs[0].toFixed(3), t.inputs[1].toFixed(3), guess)

        //     this.drawPoint(t.inputs[0], t.inputs[1], 1, guess==1?"#000":"#f00")
        // }
        
    }

}

class Trainer {
    constructor(x,y,a) {
        this.inputs = [x,y]
        this.answer = a
    }
}

class Perceptron {

    constructor(n) {
        this.learningConstant = 0.0001 //influences how fast the weights are changed

        this.weights = []
        for(let i=0; i<n; i++) //n is 2 for above line example
            this.weights.push(Math.random()*2-1)

        this.trainingCount = 0
    }

    feedforward(inputs) {
        let sum = 0;
        for (let i = 0; i < this.weights.length; i++) {
          sum += inputs[i]*this.weights[i];
        }
        return this.activate(sum);
    }

    activate(sum) {
        if (sum > 0) return 1;
        else return -1;
    }

    train(inputs, desired) {
        let guess = this.feedforward(inputs);
        let error = desired - guess;
        for (let i = 0; i < this.weights.length; i++) {
            this.weights[i] += this.learningConstant * error * inputs[i];
        }

        this.trainingCount++
    }

    toString() {
        let s = "[ "
        for(let w of this.weights)
        {
            if(w >= 0)
                s += " "
            s += w.toFixed(3) + ", "
        }
        s = s.substring(0, s.length-2)
        s += " ]"
        return s
    }
}
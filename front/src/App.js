import React, {createRef, useEffect, useState} from 'react';

import './App.css';

class App extends React.Component {
    canvas = createRef();
    componentDidMount() {
        this.websocket = new WebSocket('ws://localhost:8000/paint');
        this.websocket.onmessage = (message) => {
            try{
                const data = JSON.parse(message.data);
                if(data.type === 'CREATE_CIRCLE'){
                    const newCircle = {
                        x: data.x,
                        y: data.y,
                    };
                    const canvasElement = this.canvas.current;
                    let ctx = canvasElement.getContext("2d");
                    ctx.arc(newCircle.x,newCircle.y,10,0,2*Math.PI);
                    ctx.stroke();
                    ctx.beginPath();
                } else if (data.type === 'LAST_CIRCLES'){
                    data.circles.forEach(circle => {
                        const canvasElement = this.canvas.current;
                        let ctx = canvasElement.getContext("2d");
                        ctx.arc(circle.x,circle.y,10,0,2*Math.PI);
                        ctx.stroke();
                        ctx.beginPath();
                    });
                }
            } catch(e){
                console.error(e);
            }
        }
    }
    canvasClick = e => {
        e.persist();

        const canvasElement = this.canvas.current;
        let ctx = canvasElement.getContext("2d");
        const rect = canvasElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ctx.beginPath();
        const message = {type: 'CREATE_CIRCLE', x, y};
        this.websocket.send(JSON.stringify(message));
        ctx.arc(x,y,10,0,2*Math.PI);
        ctx.stroke();
    };
    render() {
        return (
            <div className="App">
                <div className='workspace'>
                    <canvas width='800' height='800' ref={this.canvas} onClick={this.canvasClick}>

                    </canvas>
                </div>
            </div>
        )
    }
}

export default App;

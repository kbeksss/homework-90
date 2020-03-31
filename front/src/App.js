import React, {createRef} from 'react';
import { SketchPicker } from 'react-color';

import './App.css';

class App extends React.Component {
    canvas = createRef();
    state = {
        color: '#000'
    };
    componentDidMount() {
        this.websocket = new WebSocket('ws://localhost:8000/paint');
        this.websocket.onmessage = (message) => {
            try{
                const data = JSON.parse(message.data);
                if(data.type === 'CREATE_CIRCLE'){
                    const newCircle = {
                        x: data.x,
                        y: data.y,
                        color: data.color,
                    };
                    const canvasElement = this.canvas.current;
                    let ctx = canvasElement.getContext("2d");
                    ctx.arc(newCircle.x,newCircle.y,10,0,2*Math.PI);
                    ctx.strokeStyle = newCircle.color;
                    ctx.stroke();
                    ctx.beginPath();
                } else if (data.type === 'LAST_CIRCLES'){
                    data.circles.forEach(circle => {
                        const canvasElement = this.canvas.current;
                        let ctx = canvasElement.getContext("2d");
                        ctx.arc(circle.x,circle.y,10,0,2*Math.PI);
                        ctx.strokeStyle = circle.color;
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
        const message = {type: 'CREATE_CIRCLE', x, y, color: this.state.color};
        this.websocket.send(JSON.stringify(message));
        ctx.arc(x,y,10,0,2*Math.PI);
        ctx.strokeStyle = this.state.color;
        ctx.stroke();
    };
    colorChange = (color, event) => {
        this.setState({color: color.hex})
    };
    render() {
        return (
            <div className="App">
                <SketchPicker color={this.state.color} onChange={this.colorChange}/>
                <div className='workspace'>
                    <canvas width='800' height='800' ref={this.canvas} onClick={this.canvasClick}>

                    </canvas>
                </div>
            </div>
        )
    }
}

export default App;

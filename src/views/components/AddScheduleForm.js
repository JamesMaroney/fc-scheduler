import React, { Component } from "react";
import {addNewScheduleEntry} from "../../actions";
import store from '../../store';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const convertTime24hr2dec = (time) => {
    const [hr, min] = time.split(':').map(t => parseInt(t, 10));
    return hr + (min / 60);
};

const padLeft = (x,c,w)=> (Array(w).fill(c).join('') + x).slice(-1 * w);
const padRight = (x,c,w)=> (''+ x + Array(w).fill(c).join('')).slice(0, w);

const addMinutes = (time, dmin) => {
    let [hr, min] = time.split(':').map(t=> parseInt(t, 10));

    min = min + dmin;
    hr = hr + Math.trunc(min/60);
    min = min % 60;

    return `${padLeft(hr,0,2)}:${padLeft(min,0,2)}`;
};

const reset = {
            day: days[0],
            startTime: '',
            endTime: ''
        };

export default class AddScheduleForm extends Component {

    constructor(){
        super();
        this.state = reset;
    }

    setDay(ev){
        this.setState({day: ev.target.value});
    }

    setTime(which, ev){
        this.setState({[which]: ev.target.value});
        if(which == 'startTime') this.setState({endTime: addMinutes(ev.target.value, 90)})
    }

    submit(ev){
        ev.preventDefault();
        const startTime = convertTime24hr2dec(this.state.startTime);
        const endTime = convertTime24hr2dec(this.state.endTime);
        store.dispatch(addNewScheduleEntry(
            this.props.participant, this.props.volunteer,
            this.state.day, startTime, endTime));
        this.setState(reset);
    }

    render(){
        return (
            <form className='add-new' onSubmit={this.submit.bind(this)}>
            <select value={this.state.day} onChange={this.setDay.bind(this)}>
                { days.map( (d, i)=>
                    <option value={d} key={i}>{d.slice(0,3)}</option>
                )}
            </select>&nbsp;
            <input type='time' value={this.state.startTime} onChange={this.setTime.bind(this,'startTime')} />
            <span> - </span>
            <input type='time' value={this.state.endTime} onChange={this.setTime.bind(this,'endTime')} />
            <footer>
                <button>Add</button>
            </footer>
        </form>
        );
    }
}

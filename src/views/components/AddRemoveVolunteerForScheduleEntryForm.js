import React, { Component } from "react";
import {removeVolunteerFromScheduleEntry, addVolunteerToScheduleEntry} from "../../actions";
import store from '../../store';
import { num2time } from '../../utils.js';

export default class AddRemoveVolunteerForScheduleEntryForm extends Component {

    submit(ev){
        ev.preventDefault();
        this.shouldAdd()
            ? store.dispatch(addVolunteerToScheduleEntry(this.props.entry, this.props.volunteer))
            : store.dispatch(removeVolunteerFromScheduleEntry(this.props.entry, this.props.volunteer));
    }

    shouldAdd(){
        return !this.props.entry.volunteers.some(v => v.id == this.props.volunteer.id);
    }

    render(){
        const entry = this.props.entry,
              volunteer = this.props.volunteer;

        return (
            <form className='modify-existing' onSubmit={this.submit.bind(this)}>
                {entry.day}
                <span aria-label='Start time'> {num2time(entry.startTime)}</span>
                <span aria-hidden> - </span>
                <span aria-label='End Time'>{num2time(entry.endTime)}</span>
                {entry.volunteers.map( (v)=>
                    <span key={v.initials} className="badge volunteer" title={`${v.firstName} ${v.lastName}`}><span aria-hidden>{v.initials}</span></span>
                )}
                {this.shouldAdd()
                    ? <button className='add'>Add</button>
                    : <button className='remove'>Remove</button>
                }
            </form>
        );
    }
}

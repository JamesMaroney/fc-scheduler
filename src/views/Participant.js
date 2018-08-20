import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';

var colorMap = {
    'participant': '#f05163',
    'volunteer': '#4a82f7'
};

function icon(type, label){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="27" height="27"><circle cx="13" cy="13" r="12" stroke="#333" fill="'+colorMap[type]+'"/><text x="13" y="14" text-anchor="middle" alignment-baseline="middle" style="text-shadow:0 0 5px #333" fill="#fff" font-family="Arial" font-size="12">'+label+'</text></svg>'
}

/*
const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function nums2days(nums){
    return nums.map( n=> dayMap[n] ).join(', ')
}
*/

const num2time = function(num){
    let hr = Math.trunc(num) % 12,
        min = '00' + Math.trunc((num % 1) * 60);
    if(hr==0) hr = 12;
    return `${hr}:${min.slice(-2)}`
}
export {num2time};

function setVoiceOverFocus(element) {
  var focusInterval = 10; // ms, time between function calls
  var focusTotalRepetitions = 1; // number of repetitions

  element.setAttribute('tabindex', '0');
  element.blur();

  var focusRepetitions = 0;
  var interval = window.setInterval(function() {
    element.focus();
    focusRepetitions++;
    if (focusRepetitions >= focusTotalRepetitions) {
      window.clearInterval(interval);
    }
  }, focusInterval);
}

class Participant extends Component {

    constructor(){
        super();
        this.state = {
            activeParticipantTab: 'criteria',
            activeVolunteerTab: 'criteria'
        }
    }

    switchParticipantTab(tab, ev){
        ev.preventDefault();
        this.setState({activeParticipantTab: tab});
    }

    switchVolunteerTab(tab, ev){
        ev.preventDefault();
        this.setState({activeVolunteerTab: tab});
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevState.activeParticipantTab != this.state.activeParticipantTab){
            setVoiceOverFocus(this.participant_details_tabcontent.childNodes[0]);
        }
        else if(prevState.activeVolunteerTab != this.state.activeVolunteerTab){
            setVoiceOverFocus(this.volunteer_details_tabcontent.childNodes[0]);
        }
    }

    componentDidMount(){
        window.MapApiReady.then(()=> {

            const boundingRect = new Microsoft.Maps.LocationRect.fromEdges(...this.props.geobounds);
            const participant = this.props.participant;

            const map = new Microsoft.Maps.Map( this.mapRoot,
                {
                    center: new Microsoft.Maps.Location(participant.lat, participant.lng),
                    zoom: 13,
                    maxBounds: boundingRect,
                    showMapTypeSelector: false,
                    mapTypeId: Microsoft.Maps.MapTypeId.road
                });

            map.entities.push(new Microsoft.Maps.Pushpin(
                { latitude: participant.lat, longitude: participant.lng },
                { icon: icon('participant', participant.initials) }));

            this.props.volunteers.forEach(volunteer =>
                map.entities.push(new Microsoft.Maps.Pushpin(
                    {latitude: volunteer.lat, longitude: volunteer.lng},
                    { icon: icon('volunteer', volunteer.initials)})));
        });
    }

    render() {
        const participant = this.props.participant;
        const volunteer = this.props.volunteer;

        const scheduledVolunteers = this.props.schedule.reduce( (acc, s)=>
            s.participant.id == participant.id
                ? s.volunteers.reduce( (acc,v)=> acc.indexOf(v) == -1 ? acc.concat(v) : acc, acc)
                : acc
            , []);
        const mismatchingVolunteers = [this.props.volunteers[0]];
        const matchingVolunteers = this.props.volunteers.filter( v=> scheduledVolunteers.indexOf(v) == -1 && mismatchingVolunteers.indexOf(v) == -1);
        const participantScheduledTimes = this.props.schedule.filter( s=> s.participant.id == participant.id );
        const volunteerScheduledTimes = volunteer ? this.props.schedule.filter( s=> s.volunteers.some( v=> v.id == volunteer.id) ) : [];

        const calendar = {start: 0, end: 24, range: 24}; // todo: compute narrow range from time slots
        const time2style = (start, end) => {
            const left = 100 * (start - calendar.start)/calendar.range,
                  width = 100 * (end - start)/calendar.range;
            const ret = {left: `${left}%` , width: `${width}%`};
            return ret;
        };

        const timeslots = {'Sunday': {}, 'Monday': {}, 'Tuesday': {}, 'Wednesday': {}, 'Thursday': {}, 'Friday': {}, 'Saturday': {}};
        this.props.participant.availableTimes.forEach(s => s.days.forEach( d=> {
            const p = this.props.participant,
                  id = 'p'+p.id;
            timeslots[d][id] = timeslots[d][id] || {participant: p, entries: []};
            timeslots[d][id].entries.push({available: true, slot: s});
        }));
        this.props.participant.unavailableTimes.forEach(s => s.days.forEach( d=> {
            const p = this.props.participant,
                  id = 'p'+p.id;
            timeslots[d][id] = timeslots[d][id] || {participant: p, entries: []};
            timeslots[d][id].entries.push({unavailable: true, slot: s});
        }));
        this.props.volunteers.forEach( v=> {
            const id = 'v'+v.id;
            v.availableTimes.forEach(s => s.days.forEach( d=> {
                timeslots[d][id] = timeslots[d][id] || {volunteer: v, entries: []};
                timeslots[d][id].entries.push({available: true, slot: s});
            }));
            v.unavailableTimes.forEach(s => s.days.forEach( d=> {
                timeslots[d][id] = timeslots[d][id] || {volunteer: v, entries: []};
                timeslots[d][id].entries.push({unavailable: true, slot: s});
            }));
        });
        this.props.schedule.forEach( s=> {
            if(s.participant.id == participant.id){
                const p = participant,
                      id = 'p'+p.id;
                timeslots[s.day][id] = timeslots[s.day][id] || {participant: p, entries: []};
                timeslots[s.day][id].entries.push({scheduled: true, slot: s});
            }
            s.volunteers.forEach( v=> {
                const id = 'v'+v.id;
                timeslots[s.day][id] = timeslots[s.day][id] || {volunteer: v, entries: []};
                timeslots[s.day][id].entries.push({scheduled: true, slot: s});
            })
        });

        return (
            <React.Fragment>
                <div id="left-rail">
                    <h1 className='offscreen'>Participant Scheduling</h1>
                    <header>
                        <div className="person participant">
                            <span className="badge" aria-hidden>{participant.initials}</span>
                            <span className="name">{participant.firstName} {participant.lastName}</span>
                            <span className="clear"></span>
                        </div>
                        <Link to='/scheduler' className="back" title='Back to Main Page'><span aria-hidden>❮</span></Link>
                    </header>
                    <div className="person-details" role='tabpanel'>
                        <nav role='tablist'>
                            <a href="#" role='tab' onClick={this.switchParticipantTab.bind(this,'criteria')}
                               aria-selected={this.state.activeParticipantTab == 'criteria'}
                               className={classNames({active: this.state.activeParticipantTab == 'criteria'})}>Criteria</a>
                            <a href="#" role='tab' onClick={this.switchParticipantTab.bind(this,'notes')}
                               aria-selected={this.state.activeParticipantTab == 'notes'}
                               className={classNames({active: this.state.activeParticipantTab == 'notes'})}>Notes</a>
                            <a href="#" role='tab' onClick={this.switchParticipantTab.bind(this,'contact')}
                               aria-selected={this.state.activeParticipantTab == 'contact'}
                               className={classNames({active: this.state.activeParticipantTab == 'contact'})}>Contact</a>
                        </nav>
                        <div className='tab-panel-content' ref={(el)=> this.participant_details_tabcontent = el}>
                        { this.state.activeParticipantTab == 'criteria' &&
                            <div aria-label="Criteria" role='tabpanel'>
                                <div className="gender">
                                    <h3>Gender</h3>
                                    <p className='row'>{participant.gender}</p>
                                </div>

                                <div className="gender-preference">
                                    <h3>Preferred Volunteer Gender</h3>
                                    <p className='row'>{participant.preferredVolunteerGender || 'no preference'}</p>
                                </div>

                                <h3 id='available-times-header'>Available Times</h3>
                                { participant.availableTimes.length == 0 && <p className="row"><i>none</i></p> }
                                { participant.availableTimes.length > 0 &&
                                <ul aria-labelledby="available-times-header">
                                    {participant.availableTimes.map((t, i) =>
                                        <li className="row" key={i}>
                                            {t.days.join(', ')}
                                            <span aria-label='Start time'> {num2time(t.startTime)}</span>
                                            <span aria-hidden> - </span>
                                            <span aria-label='End Time'>{num2time(t.endTime)}</span>
                                        </li>
                                    )}
                                </ul>
                                }

                                <h3 id='unavailable-times-header'>Unavailable Times</h3>
                                { participant.unavailableTimes.length == 0 && <p className="row"><i>none</i></p> }
                                { participant.unavailableTimes.length > 0 &&
                                    <ul aria-labelledby="unavailable-times-header">
                                        {participant.unavailableTimes.map((t, i) =>
                                            <li className="row" key={i}>
                                                {t.days.join(', ')}
                                                <span aria-label='Start time'> {num2time(t.startTime)}</span>
                                                <span aria-hidden> - </span>
                                                <span aria-label='End Time'>{num2time(t.endTime)}</span>
                                            </li>
                                        )}
                                    </ul>
                                }

                                <h3 id='scheduled-times-header'>Scheduled Times</h3>
                                { participantScheduledTimes.length == 0 && <p className="row"><i>none</i></p> }
                                { participantScheduledTimes.length > 0 &&
                                <ul aria-labelledby="scheduled-times-header" className="scheduled-times">
                                    {participantScheduledTimes.map((t, i) =>
                                        <li className="row" key={i}>
                                            {t.day}
                                            <span aria-label='Start time'> {num2time(t.startTime)}</span>
                                            <span aria-hidden> - </span>
                                            <span aria-label='End Time'>{num2time(t.endTime)}</span>
                                            {t.volunteers.map( (v)=>
                                                <span key={v.initials} className="badge volunteer" title={`${v.firstName} ${v.lastName}`}><span aria-hidden>{v.initials}</span></span>
                                            )}
                                        </li>
                                    )}
                                </ul>
                                }
                            </div>
                        }
                        { this.state.activeParticipantTab == 'notes' &&
                            <div aria-label="Notes" role='tabpanel'>
                                <p className='row notes'>{participant.notes || 'none'}</p>
                            </div>
                        }
                        { this.state.activeParticipantTab == 'contact' &&
                            <div aria-label="Contact" role='tabpanel'>
                                <h3 aria-hidden>Home</h3>
                                <p className="address select-all row" aria-label='Home Address'>
                                    {participant.addr}<br />
                                    {participant.city}<span aria-hidden>, </span>{participant.state} {participant.zip}
                                </p>
                                { participant.homePhone &&
                                    <p className="row icon-phone select-all" aria-label='Home Phone'>{participant.homePhone}</p>
                                }

                                <h3>Mother <span className="parent-name">{participant.momName}</span></h3>
                                { participant.momCell &&
                                    <p className="row icon-mobile select-all" aria-label="Mother's Mobile Phone">{participant.momCell} </p> }
                                { participant.momEmail &&
                                    <p className="row icon-mail">
                                        <a href={`mailto:${participant.momEmail}`} className='select-all' aria-label="Mother's E-Mail">{participant.momEmail}</a>
                                    </p>
                                }

                                <h3>Father <span className="parent-name">{participant.dadName}</span></h3>
                                { participant.dadCell &&
                                    <p className="row icon-mobile select-all" aria-label="Father's Mobile Phone">{participant.dadCell} </p> }
                                { participant.dadEmail &&
                                    <p className="row icon-mail">
                                        <a href={`mailto:${participant.dadEmail}`} className='select-all' aria-label="Father's E-Mail">{participant.dadEmail}</a>
                                    </p>
                                }
                            </div>
                        }
                        </div>
                    </div>

                    { volunteer &&
                        <React.Fragment>
                            <header>
                                <div className="person volunteer">
                                    <span className="badge" aria-hidden>{volunteer.initials}</span>
                                    <span className="name">{volunteer.firstName} {volunteer.lastName}</span>
                                </div>
                                <Link to={{pathname: '/scheduler/participant', state: {participant}}}
                                      className="back" title='Back to Volunteer List'><span aria-hidden>❮</span></Link>
                            </header>
                            <div className="person-details" role='tabpanel'>
                                <nav role='tablist'>
                                <a href="#" role='tab' onClick={this.switchVolunteerTab.bind(this,'criteria')}
                                    aria-selected={this.state.activeVolunteerTab == 'criteria'}
                                    className={classNames({active: this.state.activeVolunteerTab == 'criteria'})}>Criteria</a>
                                <a href="#" role='tab' onClick={this.switchVolunteerTab.bind(this,'notes')}
                                    aria-selected={this.state.activeVolunteerTab == 'notes'}
                                    className={classNames({active: this.state.activeVolunteerTab == 'notes'})}>Notes</a>
                                <a href="#" role='tab' onClick={this.switchVolunteerTab.bind(this,'contact')}
                                    aria-selected={this.state.activeVolunteerTab == 'contact'}
                                    className={classNames({active: this.state.activeVolunteerTab == 'contact'})}>Contact</a>
                                </nav>
                                <div className='tab-panel-content' ref={(el)=> this.volunteer_details_tabcontent = el}>
                                { this.state.activeVolunteerTab == 'criteria' &&
                                <div aria-label="Criteria" role='tabpanel'>

                                    <div className="criteria row icon-distance is-match">
                                        <span>
                                            <label>Drive Time:</label>
                                            <span className='value'>8min</span>
                                        </span>
                                        <span>
                                            <label>Allowed:</label>
                                            <span className='value'>20min</span>
                                        </span>
                                    </div>

                                    <div className="criteria icon-gender is-match">
                                        <div className="row">
                                            <span>
                                                <label>Volunteer:</label>
                                                <span className='value'>Male</span>
                                            </span>
                                            <span>
                                                <label>Allowed:</label>
                                                <span className='value'>Any</span>
                                            </span>
                                        </div>
                                        <div className="row">
                                            <span>
                                                <label>Participant:</label>
                                                <span className='value'>Female</span>
                                            </span>
                                            <span>
                                                <label>Allowed:</label>
                                                <span className='value'>Any</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="criteria row icon-hash is-match">
                                        <span>
                                            <label>Open Slots:</label>
                                            <span className='value'>1</span>
                                        </span>
                                        <span>
                                            <label>Allowed:</label>
                                            <span className='value'>1</span>
                                        </span>
                                    </div>


                                    <div className="criteria row icon-calendar is-match">
                                        <span>
                                            <label>Scheduling:</label>
                                        </span>
                                    </div>

                                    <h3 id='unavailable-times-header'>Unavailable Times</h3>
                                    { volunteer.unavailableTimes.length == 0 && <p className="row"><i>none</i></p> }
                                    { volunteer.unavailableTimes.length > 0 &&
                                    <ul aria-labelledby="unavailable-times-header">
                                        {volunteer.unavailableTimes.map((t, i) =>
                                            <li className="row" key={i}>
                                                {t.days.join(', ')}
                                                <span aria-label='Start time'> {num2time(t.startTime)}</span>
                                                <span aria-hidden> - </span>
                                                <span aria-label='End Time'>{num2time(t.endTime)}</span>
                                            </li>
                                        )}
                                    </ul>
                                    }

                                    <h3 id='scheduled-times-header'>Scheduled Times</h3>
                                    { volunteerScheduledTimes.length == 0 && <p className="row"><i>none</i></p> }
                                    { volunteerScheduledTimes.length > 0 &&
                                    <ul aria-labelledby="scheduled-times-header">
                                        {volunteerScheduledTimes.map((t, i) =>
                                            <li className="row" key={i}>
                                                {t.day}
                                                <span aria-label='Start time'> {num2time(t.startTime)}</span>
                                                <span aria-hidden> - </span>
                                                <span aria-label='End Time'>{num2time(t.endTime)}</span>
                                            </li>
                                        )}
                                    </ul>
                                    }

                                    <h3 id='available-times-header'>Available Times</h3>
                                    { volunteer.availableTimes.length == 0 && <p className="row"><i>none</i></p> }
                                    { volunteer.availableTimes.length > 0 &&
                                    <ul aria-labelledby="available-times-header">
                                        {volunteer.availableTimes.map((t, i) =>
                                            <li className="row" key={i}>
                                                {t.days.join(', ')}
                                                <span aria-label='Start time'> {num2time(t.startTime)}</span>
                                                <span aria-hidden> - </span>
                                                <span aria-label='End Time'>{num2time(t.endTime)}</span>
                                            </li>
                                        )}
                                    </ul>
                                    }
                                </div>
                                }
                                { this.state.activeVolunteerTab == 'notes' &&
                                <div aria-label="Notes" role='tabpanel'>
                                    <p className='row'>{volunteer.notes || 'none'}</p>
                                </div>
                                }
                                { this.state.activeVolunteerTab == 'contact' &&
                                <div aria-label="Contact" role='tabpanel'>
                                    <h3 aria-hidden>Home</h3>
                                    <p className="address select-all row" aria-label='Home Address'>
                                        {volunteer.addr}<br />
                                        {volunteer.city}<span aria-hidden>, </span>{volunteer.state} {volunteer.zip}
                                    </p>
                                    { volunteer.homePhone &&
                                    <p className="row icon-phone select-all" aria-label='Home Phone'>{volunteer.homePhone}</p>
                                    }
                                    { volunteer.cellPhone &&
                                    <p className="row icon-mobile select-all" aria-label='Mobile Phone'>{volunteer.mobilePhone}</p>
                                    }
                                    { volunteer.email &&
                                    <p className="row icon-mail select-all" aria-label='E-Mail'>{volunteer.email}</p>
                                    }

                                    <h3>Mother <span className="parent-name">{volunteer.momName}</span></h3>
                                    { volunteer.momCell &&
                                    <p className="row icon-mobile select-all" aria-label="Mother's Mobile Phone">{volunteer.momCell} </p> }
                                    { volunteer.momEmail &&
                                    <p className="row icon-mail">
                                        <a href={`mailto:${volunteer.momEmail}`} className='select-all' aria-label="Mother's E-Mail">{volunteer.momEmail}</a>
                                    </p>
                                    }

                                    <h3>Father <span className="parent-name">{volunteer.dadName}</span></h3>
                                    { volunteer.dadCell &&
                                    <p className="row icon-mobile select-all" aria-label="Father's Mobile Phone">{volunteer.dadCell} </p> }
                                    { volunteer.dadEmail &&
                                    <p className="row icon-mail">
                                        <a href={`mailto:${volunteer.dadEmail}`} className='select-all' aria-label="Father's E-Mail">{volunteer.dadEmail}</a>
                                    </p>
                                    }
                                </div>
                                }
                                </div>
                            </div>

                            <h2>Scheduling</h2>

                            {participantScheduledTimes.map((t, i) =>
                                <form className='add-to-existing' key={i}>
                                    {t.day}
                                    <span aria-label='Start time'> {num2time(t.startTime)}</span>
                                    <span aria-hidden> - </span>
                                    <span aria-label='End Time'>{num2time(t.endTime)}</span>
                                    {t.volunteers.map( (v)=>
                                        <span key={v.initials} className="badge volunteer" title={`${v.firstName} ${v.lastName}`}><span aria-hidden>{v.initials}</span></span>
                                    )}
                                    {t.volunteers.some( v=> v.id == volunteer.id)
                                        && <button className='remove'>Remove</button>
                                        || <button className='add'>Add</button>}
                                </form>
                            )}

                            <form className='add-new'>
                                <select>
                                    { Object.keys(timeslots).map( (d, i)=>
                                        <option value={i} key={i}>{d.slice(0,3)}</option>
                                    )}
                                </select>&nbsp;
                                <input type='time' /> - <input type='time' />
                                <footer>
                                <button>Add</button>
                                </footer>

                            </form>
                        </React.Fragment>
                    }

                    {!volunteer &&
                        <div className="person-list">
                        <h2>
                            Volunteers
                            <input type="text" placeholder="filter"/>
                        </h2>
                        <div className="list">
                            {scheduledVolunteers.length > 0 &&
                            <React.Fragment>
                                <h3>Scheduled</h3>
                                <ul>
                                    {scheduledVolunteers.map((volunteer) =>
                                        <li key={volunteer.id}>
                                            <Link to={{pathname: '/scheduler/participant/schedule',
                                                       state: {participant, volunteer}}}
                                                  className="person volunteer">
                                                <span className="badge">{volunteer.initials}</span>
                                                <span className="name">{volunteer.firstName} {volunteer.lastName}</span>
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </React.Fragment>
                            }
                            {matchingVolunteers.length > 0 &&
                            <div className="matches">
                                <h3>Matches</h3>
                                <ul>
                                    {matchingVolunteers.map((volunteer) =>
                                        <li key={volunteer.id}>
                                            <Link to={{pathname: '/scheduler/participant/schedule',
                                                       state: {participant, volunteer}}}
                                                className="person volunteer">
                                                <span className="badge">{volunteer.initials}</span>
                                                <span className="name">{volunteer.firstName} {volunteer.lastName}</span>
                                                <span className="details">
                                                    <span className="criteria icon-distance is-match" title='Drive Time'><span className="offscreen">Match</span></span>
                                                    <span className="criteria icon-calendar is-match" title='Schedules'><span className="offscreen">Match</span></span>
                                                    <span className="criteria icon-gender is-match" title='Gender Preferences'><span className="offscreen">Match</span></span>
                                                    <span className="criteria icon-hash is-match" title='Open Slots'><span className="offscreen">Match</span></span>
                                                </span>
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </div>
                            }
                            {mismatchingVolunteers.length > 0 &&
                            <React.Fragment>
                                <h3>Mismatches</h3>
                                <ul>
                                    {mismatchingVolunteers.map((volunteer) =>
                                        <li key={volunteer.id}>
                                            <Link to={{pathname: '/scheduler/participant/schedule',
                                                       state: {participant, volunteer}}}
                                                className="person volunteer">
                                                <span className="badge">{volunteer.initials}</span>
                                                <span className="name">{volunteer.firstName} {volunteer.lastName}</span>
                                                <span className="details">
                                                    <span className="criteria icon-distance is-mismatch" title='Drive Time'><span className="offscreen">Match</span></span>
                                                    <span className="criteria icon-calendar is-match" title='Schedules'><span className="offscreen">Match</span></span>
                                                    <span className="criteria icon-gender is-match" title='Gender Preferences'><span className="offscreen">Match</span></span>
                                                    <span className="criteria icon-hash is-mismatch" title='Open Slots'><span className="offscreen">Match</span></span>
                                                </span>
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </React.Fragment>
                            }
                        </div>
                    </div>
                    }
                </div>

                <div id="map-cal" className="inset">
                    <div id='map' ref={(el)=> this.mapRoot=el} aria-hidden />
                    <div id="cal">
                        <div className="day key header">
                            <label> </label>
                            <div className="schedule">
                                <div>
                                    <h3>Participant</h3>
                                    <ul>
                                        <li><div className="participant available" />Available</li>
                                        <li><div className="participant unavailable" />Unavailable</li>
                                        <li><div className="participant scheduled" />Scheduled</li>
                                    </ul>
                                </div>

                               <div>
                                   <h3>Volunteer</h3>
                                    <ul>
                                        <li><div className="volunteer available" />Available</li>
                                        <li><div className="volunteer unavailable" />Unavailable</li>
                                        <li><div className="volunteer scheduled" />Scheduled</li>
                                    </ul>
                               </div>
                            </div>
                        </div>
                        <div className="day header">
                            <label></label>
                            <div className="schedule">
                            </div>
                        </div>

                        {Object.keys(timeslots).map( day =>
                            <div className="day" key={day}>
                                <label>{day[0]}</label>
                                <div className="schedule">
                                    { Object.entries(timeslots[day]).map( ([id, {participant, volunteer, entries}]) =>
                                        participant &&
                                        entries.map((entry, i) =>
                                            <div className={classNames('time-slot', 'participant', {
                                                available: entry.available,
                                                unavailable: entry.unavailable,
                                                scheduled: entry.scheduled
                                            })} key={participant.id + i}
                                                 style={time2style(entry.slot.startTime, entry.slot.endTime)} />
                                        )

                                        || volunteer &&
                                        <div
                                            className={classNames('person',
                                                                  {expanded: this.props.volunteer && volunteer.id == this.props.volunteer.id,
                                                                  'has-available-slots': entries.some(e => e.available)}
                                                       )}
                                            key={id} title={`${volunteer.firstName} ${volunteer.lastName}`}>
                                            {entries.map((entry, i) =>
                                                <div className={classNames('time-slot', 'volunteer', {
                                                    available: entry.available,
                                                    unavailable: entry.unavailable,
                                                    scheduled: entry.scheduled
                                                })} key={i}
                                                     style={time2style(entry.slot.startTime, entry.slot.endTime)}>
                                                    <span className="badge">{volunteer.initials}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state, props) => ({
    participant: props.location.state.participant,
    volunteer: props.location.state.volunteer,
    volunteers: state.volunteers,
    geobounds: state.geobounds,
    schedule: state.schedule,
});

export default connect(
    mapStateToProps
)(Participant)

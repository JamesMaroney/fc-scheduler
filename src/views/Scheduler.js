import React, { Component } from "react";
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';

var colorMap = {
    'participant': '#f05163',
    'volunteer': '#4a82f7'
};

function icon(type, label){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="27" height="27"><circle cx="13" cy="13" r="12" stroke="#333" fill="'+colorMap[type]+'"/><text x="13" y="14" text-anchor="middle" alignment-baseline="middle" style="text-shadow:0 0 5px #333" fill="#fff" font-family="Arial" font-size="12">'+label+'</text></svg>'
}


class Scheduler extends Component {

    constructor(){
        super();
        this.state = {
            participants_filter: '',
            volunteers_filter: ''
        }
    }

    componentDidMount(){
        window.MapApiReady.then(()=> {

            const boundingRect = new Microsoft.Maps.LocationRect.fromEdges(...this.props.geobounds);

            const map = new Microsoft.Maps.Map( this.mapRoot,
                {
                    bounds: boundingRect,
                    maxBounds: boundingRect,
                    showMapTypeSelector: false,
                    mapTypeId: Microsoft.Maps.MapTypeId.road
                });

            this.props.participants.forEach(participant =>
                map.entities.push(new Microsoft.Maps.Pushpin(
                    {latitude: participant.lat, longitude: participant.lng},
                    { icon: icon('participant', participant.initials)})));

            this.props.volunteers.forEach(volunteer =>
                map.entities.push(new Microsoft.Maps.Pushpin(
                    {latitude: volunteer.lat, longitude: volunteer.lng},
                    { icon: icon('volunteer', volunteer.initials)})));
        });
    }

    filter(type, ev){
        this.setState({[`${type}_filter`]: ev.target.value});
    }

    render() {
        const isScheduled = {'p': {}, 'v': {}},
              scheduledParticipants = [],
              unscheduledParticipants= [],
              scheduledVolunteers = [],
              unscheduledVolunteers = [];

        this.props.schedule.forEach( s => {
            isScheduled.p[s.participant.id] = true;
            s.volunteers.forEach( v => isScheduled.v[v.id] = true );
        });

        let filter = this.state.participants_filter.toLowerCase();
        this.props.participants.forEach( p => {
            if(filter && (p.searchIndex).indexOf(filter) == -1) return;
            let list = isScheduled.p[p.id] ? scheduledParticipants : unscheduledParticipants;
            list.push(p);
        });

        filter = this.state.volunteers_filter.toLowerCase();
        this.props.volunteers.forEach( v => {
            if(filter && (v.searchIndex).indexOf(filter) == -1) return;
            let list = isScheduled.v[v.id] ? scheduledVolunteers : unscheduledVolunteers;
            list.push(v);
        });



        return (
            <React.Fragment>
                <div id="left-rail">
                    <h1 className='offscreen'>People List</h1>
                    <div className="person-list">
                        <h2>
                            Participants
                            <input type="search" placeholder="filter participants by name"
                                   id='people-filter' value={this.state.participants_filter} onChange={this.filter.bind(this, 'participants')} />
                        </h2>
                        {
                            unscheduledParticipants.length > 0 &&
                                <React.Fragment>
                                    <h3 id='unscheduled-participants-list-header'>Unscheduled <span className="offscreen">Participants</span></h3>
                                    <ul aria-labelledby="unscheduled-participants-list-header">
                                        { unscheduledParticipants.map( participant => (
                                            <li key={participant.id}>
                                                <Link to={{pathname: '/scheduler/participant', state: {participant}}}
                                                      className="person participant">
                                                    <span className="badge" aria-hidden>{participant.initials}</span>
                                                    <span className="name">{participant.firstName} {participant.lastName}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </React.Fragment>
                        }
                        {
                            scheduledParticipants.length > 0 &&
                                <React.Fragment>
                                    <h3>Scheduled <span className="offscreen">Participants</span></h3>
                                    <ul aria-labelledby="unscheduled-participants-list-header">
                                        { scheduledParticipants.map( participant => (
                                            <li key={participant.id}>
                                                <Link to={{pathname: '/scheduler/participant', state: {participant}}}
                                                      className="person participant">
                                                    <span className="badge" aria-hidden>{participant.initials}</span>
                                                    <span className="name">{participant.firstName} {participant.lastName}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </React.Fragment>
                        }
                    </div>
                    <div className="person-list">
                        <h2 id='volunteers-list-header'>
                            Volunteers
                            <input type="search" placeholder="filter volunteers by name"
                                   id='people-filter' value={this.state.volunteers_filter} onChange={this.filter.bind(this, 'volunteers')} />
                        </h2>
                        {
                            unscheduledVolunteers.length > 0 &&
                                <React.Fragment>
                                    <h3 id='unscheduled-volunteers-list-header'>Unscheduled <span className='offscreen'>Volunteers</span></h3>
                                    <ul aria-labelledby="unscheduled-volunteers-list-header">
                                        { unscheduledVolunteers.map( volunteer => (
                                            <li key={volunteer.id}>
                                                <Link to={{pathname: '/scheduler/volunteer', state: {volunteer}}}
                                                      className="person volunteer">
                                                    <span className="badge" aria-hidden>{volunteer.initials}</span>
                                                    <span className="name">{volunteer.firstName} {volunteer.lastName}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </React.Fragment>
                        }
                        {
                            scheduledVolunteers.length > 0 &&
                                <React.Fragment>
                                    <h3 id='scheduled-volunteers-list-header'>Scheduled <span className="offscreen">Volunteers</span></h3>
                                    <ul aria-labelledby="unscheduled-volunteers-list-header">
                                        { scheduledVolunteers.map( volunteer => (
                                            <li key={volunteer.id}>
                                                <Link to={{pathname: '/scheduler/volunteer', state: {volunteer}}}
                                                      className="person volunteer">
                                                    <span className="badge" aria-hidden>{volunteer.initials}</span>
                                                    <span className="name">{volunteer.firstName} {volunteer.lastName}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </React.Fragment>
                        }
                    </div>
                </div>
                <div id="map-cal" className="inset">
                    <div id='map' ref={(el)=> this.mapRoot=el} aria-hidden />
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => ({
    participants: state.participants,
    volunteers: state.volunteers,
    schedule: state.schedule,
    geobounds: state.geobounds
});

export default connect(
    mapStateToProps
)(Scheduler)

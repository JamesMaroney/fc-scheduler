import React, { Component } from "react";
import { connect } from 'react-redux';
import { num2time } from '../utils.js';

class Participants extends Component {

    render() {
        return (
            <React.Fragment>
                <h1 className='offscreen' id='participant-data-header'>Participant Data</h1>
                <table aria-labelledby="participant-data-header">
                    <thead>
                        <tr aria-hidden>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th colSpan="4"><span>Mother</span></th>
                            <th colSpan="4"><span>Father</span></th>
                            <th colSpan="2"><span>Times</span></th>
                            <th></th>
                            <th></th>
                            <th className="notes"></th>
                        </tr>
                        <tr>
                            <th scope="col" title="Participant Name">Name</th>
                            <th scope="col" title="Address">Address</th>

                            <th scope="col" title="Home Phone">Phone</th>

                            <th scope="col" title="Mother's Name">Name</th>
                            <th scope="col" title="Mother's Phone">Phone</th>
                            <th scope="col" title="Mother's Cell">Cell</th>
                            <th scope="col" title="Mother's E-Mail">E-Mail</th>

                            <th scope="col" title="Father's Name">Name</th>
                            <th scope="col" title="Father's Phone">Phone</th>
                            <th scope="col" title="Father's Cell">Cell</th>
                            <th scope="col" title="Father's E-Mail">E-Mail</th>

                            <th scope="col" title="Preferred Times">Preferred</th>
                            <th scope="col" title="Unavailable Times">Unavailable</th>

                            <th scope="col" title="Participant Gender">Gender</th>
                            <th scope="col" title="Preferred Volunteer Gender">Preferred Volunteer Gender</th>

                            <th scope="col" title="Participant Notes" className="notes">Notes</th>
                        </tr>
                    </thead>
                    <tbody>

                    { this.props.participants.map( p =>
                        <tr key={p.id}>
                            <th scope='row'>{p.firstName} {p.lastName}</th>
                            <td>{p.address} {p.city}, {p.state} {p.zip}</td>

                            <td>{p.homePhone}</td>

                            <td>{p.momName}</td>
                            <td>{p.momPhone}</td>
                            <td>{p.momCell}</td>
                            <td>{p.momEmail}</td>

                            <td>{p.dadName}</td>
                            <td>{p.dadPhone}</td>
                            <td>{p.dadCell}</td>
                            <td>{p.dadEmail}</td>

                            <td>
                                { p.availableTimes.length == 0 && <i>none</i>}
                                { p.availableTimes.map( (t, i)=>
                                    <div key={i}>
                                        {t.days.join(', ')}
                                        <span aria-label='Start time'> {num2time(t.startTime)}</span>
                                        <span aria-hidden> - </span>
                                        <span aria-label='End Time'>{num2time(t.endTime)}</span>
                                    </div>
                                )}
                            </td>
                            <td>
                                { p.unavailableTimes.length == 0 && <i>none</i>}
                                { p.unavailableTimes.map( (t, i)=>
                                    <div key={i}>
                                        {t.days.join(', ')}
                                        <span aria-label='Start time'> {num2time(t.startTime)}</span>
                                        <span aria-hidden> - </span>
                                        <span aria-label='End Time'>{num2time(t.endTime)}</span>
                                    </div>
                                )}
                            </td>

                            <td>{p.gender}</td>
                            <td>{p.preferredVolunteerGender || <i>none</i>}</td>

                            <td className="notes">{p.notes ? <p>{p.notes}</p> : <i>none</i>}</td>
                        </tr>
                     )}
                    </tbody>
                </table>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state, props) => ({
    participants: state.participants
});

export default connect(
    mapStateToProps
)(Participants)

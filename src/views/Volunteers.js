import React, { Component } from "react";
import { connect } from 'react-redux';
import { num2time } from './Participant.js'

class Volunteers extends Component {

    render() {
        return (

            <table>
                <thead>
                <tr>
                    <th></th>
                    <th></th>
                    <th colSpan="3"><span>Home</span></th>
                    <th colSpan="4"><span>Mother</span></th>
                    <th colSpan="4"><span>Father</span></th>
                    <th colSpan="2"><span>Times</span></th>
                    <th></th>
                    <th></th>
                    <th className="notes"></th>
                </tr>
                <tr>
                    <th>Name</th>
                    <th>Address</th>

                    <th>Phone</th>
                    <th>Cell</th>
                    <th>E-Mail</th>

                    <th>Name</th>
                    <th>Phone</th>
                    <th>Cell</th>
                    <th>E-Mail</th>

                    <th>Name</th>
                    <th>Phone</th>
                    <th>Cell</th>
                    <th>E-Mail</th>

                    <th>Preferred</th>
                    <th>Unavailable</th>

                    <th>Gender</th>
                    <th>Preferred Participant Gender</th>

                    <th className="notes">Notes</th>
                </tr>
                </thead>
                <tbody>
                { this.props.volunteers.map( v=>
                    <tr key={v.id}>
                        <td>{v.firstName} {v.lastName}</td>
                        <td>{v.addr} {v.city}, {v.state} {v.zip}</td>

                        <td>{v.phone}</td>
                        <td>{v.cell}</td>
                        <td>{v.email}</td>

                        <td>{v.momName}</td>
                        <td>{v.momPhone}</td>
                        <td>{v.momCell}</td>
                        <td>{v.momEmail}</td>

                        <td>{v.dadName}</td>
                        <td>{v.dadPhone}</td>
                        <td>{v.dadCell}</td>
                        <td>{v.dadEmail}</td>

                        <td>
                            { v.availableTimes.length == 0 && <i>none</i>}
                            { v.availableTimes.map( (t, i)=>
                                <div key={i}>
                                    {t.days.join(', ')}
                                    <span aria-label='Start time'> {num2time(t.startTime)}</span>
                                    <span aria-hidden> - </span>
                                    <span aria-label='End Time'>{num2time(t.endTime)}</span>
                                </div>
                            )}
                        </td>
                        <td>
                            { v.unavailableTimes.length == 0 && <i>none</i>}
                            { v.unavailableTimes.map( (t, i)=>
                                <div key={i}>
                                    {t.days.join(', ')}
                                    <span aria-label='Start time'> {num2time(t.startTime)}</span>
                                    <span aria-hidden> - </span>
                                    <span aria-label='End Time'>{num2time(t.endTime)}</span>
                                </div>
                            )}
                        </td>

                        <td>{v.gender}</td>
                        <td>{v.preferredParticipantGender}</td>

                        <td className="notes">{v.notes ? <p>{v.notes}</p> : <i>none</i>}</td>
                    </tr>
                )}
                </tbody>
            </table>
        )
    }
}

const mapStateToProps = (state, props) => ({
    volunteers: state.volunteers
});

export default connect(
    mapStateToProps
)(Volunteers)

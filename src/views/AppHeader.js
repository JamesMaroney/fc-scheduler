import React, { Component } from "react";
import { NavLink, Link } from 'react-router-dom';

export default class AppHeader extends Component {

    render(){
        return (
            <header role="banner">
                <Link to="/" id="logo">
                    <img src="https://www.friendshipcircle.org/wp-content/uploads/newhome/med-fc.png" alt="" aria-hidden />
                    Friends@Home Scheduler
                </Link>
                <nav>
                    <NavLink to='/scheduler'>Scheduler</NavLink>
                    <NavLink to='/participants'>Participants</NavLink>
                    <NavLink to='/volunteers'>Volunteers</NavLink>
                </nav>
            </header>
        )
    }
}

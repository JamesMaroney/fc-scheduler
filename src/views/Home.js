import React, { Component } from "react";
import { Link } from 'react-router-dom';

export default class Home extends Component {

    onClickOpen(ev){
        ev.preventDefault();
        this.file_input.click();
    }

    render(){
        return (
            <div id='home'>

                <Link to='/scheduler' tabIndex={-1} className='new icon-star-empty' disabled><span>New Schedule</span></Link>

                <Link to='/scheduler' tabIndex={-1} className='open icon-folder-open-empty' onClick={this.onClickOpen.bind(this)} disabled>
                    <span>Open Schedule</span>
                    <input disabled className='offscreen' aria-hidden type='file' accept={['.website', '.jcs']} ref={(el)=> this.file_input = el} />
                </Link>

                <Link to='/scheduler' className='open icon-folder-open-empty'>
                    <span>Demo Schedule</span>
                </Link>

                {/*
                <h2>Recent Scedules</h2>
                <ul>
                    <li><Link to='/scheduler'>file_name_of_schedule</Link></li>
                </ul>
                */}

            </div>
        )
    }
}

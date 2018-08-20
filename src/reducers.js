import { actions } from './actions.js';

const add_new_schedule_entry = (state, payload) => {
    const {participant, volunteer, day, startTime, endTime} = payload;
    const newState = {...state, schedule: state.schedule.concat({day, startTime, endTime, participant, volunteers: [volunteer]})};
    return newState;
};

const remove_volunteer_from_schedule_entry = (state, payload) => {
    const {volunteer, entry} = payload;
    const newState = {...state, schedule: state.schedule.filter( s=> s!= entry)},
          newEntry = {...entry, volunteers: entry.volunteers.filter(v => v.id != volunteer.id)};

    if(newEntry.volunteers.length > 0) newState.schedule = newState.schedule.concat(newEntry);
    return newState
};

const add_volunteer_to_schedule_entry = (state, payload) => {
    const {volunteer, entry} = payload;
    const newState = {...state, schedule: state.schedule.filter( s=> s!= entry)},
        newEntry = {...entry, volunteers: entry.volunteers.filter(v => v.id != volunteer.id).concat(volunteer)};

    newState.schedule = newState.schedule.concat(newEntry);
    return newState
};

const rootReducer = (state = {}, action) => {
    switch (action.type){
        case actions.ADD_NEW_SCHEDULE_ENTRY:
            return add_new_schedule_entry(state, action.payload);
            break;
        case actions.REMOVE_VOLUNTEER_FROM_SCHEDULE_ENTRY:
            return remove_volunteer_from_schedule_entry(state, action.payload);
            break;
        case actions.ADD_VOLUNTEER_TO_SCHEDULE_ENTRY:
            return add_volunteer_to_schedule_entry(state, action.payload);
            break;
    }
    return state;
};


export default rootReducer;

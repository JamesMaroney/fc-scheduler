export const actions = {
    ADD_NEW_SCHEDULE_ENTRY: "ADD_NEW_SCHEDULE_ENTRY",
    REMOVE_VOLUNTEER_FROM_SCHEDULE_ENTRY: 'REMOVE_VOLUNTEER_FROM_SCHEDULE_ENTRY',
    ADD_VOLUNTEER_TO_SCHEDULE_ENTRY: 'ADD_VOLUNTEER_TO_SCHEDULE_ENTRY',
}

export const addNewScheduleEntry = (participant, volunteer, day, startTime, endTime) =>
    ({type: actions.ADD_NEW_SCHEDULE_ENTRY, payload: {participant, volunteer, day, startTime, endTime}});

export const removeVolunteerFromScheduleEntry = (entry, volunteer) =>
    ({type: actions.REMOVE_VOLUNTEER_FROM_SCHEDULE_ENTRY, payload: {volunteer, entry}});

export const addVolunteerToScheduleEntry = (entry, volunteer) =>
    ({type: actions.ADD_VOLUNTEER_TO_SCHEDULE_ENTRY, payload: {volunteer, entry}});

import rootReducer from "./reducers";
import { createBrowserHistory, createHashHistory } from 'history'
import { applyMiddleware, compose, createStore } from 'redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'

const wholeWorld = [-90, 180, 90, -180]; // [n,w,s,e]
const georgia = [30.3556, -85.6052, 35.0007, -80.7514];

const initialState = {
    participants: [],
    volunteers: [],
    schedule: [],
    geobounds: georgia
};

const generateSearchString = (p)=> { return (p.firstName + p.lastName).toLowerCase()};

const genderMap = [undefined, 'Male', 'Female'];
const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const hydrateTimeSlot= (s) => ({days: s[0].map(d=>dayMap[d]), startTime: s[1], endTime: s[2]});
const hydrateSchedule = (participants, volunteers, s)=>
    ({day: dayMap[s[0]], startTime: s[1], endTime: s[2],
            participant: participants.find( p => p.id == s[3]),
            volunteers: s[4].map( v_id => volunteers.find( v => v.id == v_id))});

const hydrateParticipant = (p)=> {
   const person = {id: p[0], firstName: p[1], lastName: p[2], initials: p[3],
       addr: p[4], city: p[5], state: p[6], zip: p[7], homePhone: p[8],
       momName: p[9], momCell: p[10], momEmail: p[11],
       dadName: p[12], dadCell: p[13], dadEmail: p[14],
       availableTimes: p[15].map(hydrateTimeSlot), unavailableTimes: p[16].map(hydrateTimeSlot),
       gender: genderMap[p[17]], preferredVolunteerGender: genderMap[p[18]], notes: p[19],
       lat: p[20], lng: p[21] };
   person.searchIndex = generateSearchString(person);
   return person
};
const hydrateVolunteer= (p)=> {
    const person = {id: p[0], firstName: p[1], lastName: p[2], initials: p[3],
        addr: p[4], city: p[5], state: p[6], zip: p[7],
        phone: p[8], cell: p[9], email: p[10],
        momName: p[11], momCell: p[12], momEmail: p[13],
        dadName: p[14], dadCell: p[15], dadEmail: p[16],
        availableTimes: p[17].map(hydrateTimeSlot), unavailableTimes: p[18].map(hydrateTimeSlot),
        gender: genderMap[p[19]], preferredParticipantGender: genderMap[p[20]], notes: p[21],
        lat: p[22], lng: p[23] };
    person.searchIndex = generateSearchString(person);
    return person;
};


const calculateGeoBounds = (people) => {
    const pad = .05;
    const bounds = people.reduce(
        (b, p) => ([Math.max(b[0], p.lat), Math.min(b[1], p.lng),
            Math.min(b[2], p.lat), Math.max(b[3], p.lng)]), wholeWorld);
    return [bounds[0] + pad, bounds[1] - pad, bounds[2] - pad, bounds[3] + pad];
};

const hydrateSavedState = (savedState) => {
    const state = {};
    state.participants = savedState[0].map(hydrateParticipant);
    state.volunteers = savedState[1].map(hydrateVolunteer);
    state.schedule = savedState[2].map(hydrateSchedule.bind(undefined, state.participants, state.volunteers));
    state.geobounds = calculateGeoBounds([...state.participants, ...state.volunteers]);
    return state;
};

const loadSavedState = ()=> {
    //TODO: pull savedState from localStorage
    const savedState = [
        [
            [0,'Adam','Balter','AB',
                '948 Hickory Ave. Apt C2', 'Sandy Springs', 'GA', '30328', '(404) 555-1234',
                'Elizabeth Balter', '(404) 555-3456', 'mom@email.com',
                'David Balter', '(404) 555-8765', 'dad@email.com',
                [ [[1],14,16], [[3], 10,13] ], [], // [ [days(0-6)], start_time(24-hr.min-pct), end_time(24-hr.min-pct) ]
                1, 0, '',
                33.9321942, -84.3627975],
            [1,'Elizabeth','Carlin','EC',
                '948 Hickory Ave. Apt C2', 'Sandy Springs', 'GA', '30328', '(404) 555-1234',
                'Sadie Carlin', '(404) 555-3456', 'mom@email.com',
                'Daniel Carlin', '(404) 555-8765', 'dad@email.com',
                [ [[2],14,18.5], ], [ [[2,4],12,14], ],
                2, 0, '',
                33.9341942, -84.3593375],
            [2,'Sadie','Klar','SK',
                '948 Hickory Ave. Apt C2', 'Sandy Springs', 'GA', '30328', '(404) 555-1234',
                'Ellie Klar', '(404) 555-3456', 'mom@email.com',
                'Adam Klar', '(404) 555-8765', 'dad@email.com',
                [ [[1,3],9,10.5], ], [ [[2,4],12,14], ],
                2, 2, 'Some notes about special scheduling needs for Sadie.',
                33.9211942, -84.3637975],
            [3,'Daniel','Aarons','DA',
                '948 Hickory Ave. Apt C2', 'Sandy Springs', 'GA', '30328', '(404) 555-1234',
                'Abigail Aarons', '(404) 555-3456', 'mom@email.com',
                'Daniel Aarons', '(404) 555-8765', 'dad@email.com',
                [ [[2],12,18.5], [[0],10,13] ], [ [[2,4],12,14], ],
                1, 2, '',
                33.9315942, -84.3282975],
            [4,'David','Begin','DB',
                '948 Hickory Ave. Apt C2', 'Sandy Springs', 'GA', '30328', '(404) 555-1234',
                'Ellie Begin', '(404) 555-3456', 'mom@email.com',
                'Daniel Begin', '(404) 555-8765', 'dad@email.com',
                [ [[1],10,16.5], ], [ [[2,4],12,14], ],
                1, 0, '',
                33.9323942, -84.3482275],
        ],
        [
            [0,'Hannah','Gutt','HG',
                '948 Hickory Ave. Apt C2', 'Sandy Springs', 'GA', '30328',
                '(404) 555-1324', '(404) 555-4231', 'nick.jong@email.com',
                'Abigail Gutt', '(404) 555-3456', 'mom@email.com',
                'Michael Gutt', '(404) 555-8765', 'dad@email.com',
                [ [[2],14,18.5], [[2],8,10], [[2],11.5,13] ], [ [[2],10,11.5], ],
                2, 2, '',
                33.8311942, -84.9687975],
            [1,'Jonathan','First','JF',
                '948 Hickory Ave. Apt C2', 'Sandy Springs', 'GA', '30328',
                '(404) 555-1324', '(404) 555-4231', 'kimber.jong@email.com',
                'Ellie First', '(404) 555-3456', 'mom@email.com',
                'Noah First', '(404) 555-8765', 'dad@email.com',
                [ [[1],14,18.5], ], [ [[2,4],12,14], ],
                1, 2, '',
                33.2311942, -84.2687975],
            [2,'Ellie','Kirsner','EK',
                '948 Hickory Ave. Apt C2', 'Sandy Springs', 'GA', '30328',
                '(404) 555-1324', '(404) 555-4231', 'jack.jong@email.com',
                'Hannah Kirsner', '(404) 555-3456', 'mom@email.com',
                'Jonathan Kirsner', '(404) 555-8765', 'dad@email.com',
                [ [[3,4,5],14,18.5], ], [ [[2,4],12,14], ],
                2, 2, '',
                33.1311942, -84.3487975],
            [3,'Abigail','Brownfield','AB',
                '948 Hickory Ave. Apt C2', 'Sandy Springs', 'GA', '30328',
                '(404) 555-1324', '(404) 555-4231', 'mal.jong@email.com',
                'Hannah Brownfield', '(404) 555-3456', 'mom@email.com',
                'David Brownfield', '(404) 555-8765', 'dad@email.com',
                [ [[1],14,18.5], ], [ [[2,4],12,14], ],
                2, 2, '',
                33.4311942, -84.1687975],
            [4,'Noah','Hart','NH',
                '948 Hickory Ave. Apt C2', 'Sandy Springs', 'GA', '30328',
                '(404) 555-1324', '(404) 555-4231', 'tom.jong@email.com',
                'Ellie Hart', '(404) 555-3456', 'mom@email.com',
                'Michael Hart', '(404) 555-8765', 'dad@email.com',
                [ [[2],14,18.5], ], [ [[2,4],12,14], ],
                1, 2, '',
                33.6311942, -84.7687975],
            [5,'Michael','Bynes','MB',
                '948 Hickory Ave. Apt C2', 'Sandy Springs', 'GA', '30328',
                '(404) 555-1324', '(404) 555-4231', 'sal.jong@email.com',
                'Abigail Bynes', '(404) 555-3456', 'mom@email.com',
                'Michael Bynes', '(404) 555-8765', 'dad@email.com',
                [ [[1],14,18.5], ], [ [[2,4],12,14], ],
                1, 2, '',
                33.9311942, -84.3787975]
        ],
        [
            [1,14,15.5,3,[5,1]] // [ day(0-6), start_time(24-hr.min-pct), end_time(24-hr.min-pct), participant_id, [volunteer_ids] ]
        ]
    ];

    return hydrateSavedState(savedState);
};


export const history = createBrowserHistory({basename: `${window.location.pathname}#`});

const store = createStore(
  connectRouter(history)(rootReducer),
  //initialState,
  loadSavedState(),
  compose(
    applyMiddleware(
      routerMiddleware(history), // for dispatching history actions
      // ... other middlewares ...
    ),
  ),
);

export default store;

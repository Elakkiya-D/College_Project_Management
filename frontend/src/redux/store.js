import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './userRelated/userSlice';
import { studentReducer } from './studentRelated/studentSlice';
import { noticeReducer } from './noticeRelated/noticeSlice';
import { sclassReducer } from './sclassRelated/sclassSlice';
import { facultyReducer } from './facultyRelated/facultySlice';
import { complainReducer } from './complainRelated/complainSlice';
import { feeReducer } from './feeRelated/feeSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        student: studentReducer,
        faculty: facultyReducer,
        notice: noticeReducer,
        complain: complainReducer,
        sclass: sclassReducer,
        fee: feeReducer
    },
});

export default store;

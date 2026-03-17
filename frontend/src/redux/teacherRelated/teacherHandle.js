import axios from 'axios';
import { getApiErrorMessage, getApiUrl } from '../../utils/api';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    postDone,
    doneSuccess
} from './teacherSlice';

export const getAllTeachers = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(getApiUrl(`/Teachers/${id}`));
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to load faculty members')));
    }
}

export const getTeacherDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(getApiUrl(`/Teacher/${id}`));
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to load faculty details')));
    }
}

export const updateTeachSubject = (teacherId, teachSubject) => async (dispatch) => {
    dispatch(getRequest());

    try {
        await axios.put(getApiUrl('/TeacherSubject'), { teacherId, teachSubject }, {
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to assign course to faculty')));
    }
}
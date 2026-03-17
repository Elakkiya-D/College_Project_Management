import axios from 'axios';
import { getApiErrorMessage, getApiUrl } from '../../utils/api';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    stuffDone
} from './studentSlice';

export const getAllStudents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(getApiUrl(`/Students/${id}`));
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to load students')));
    }
}

export const updateStudentFields = (id, fields, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(getApiUrl(`/${address}/${id}`), fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to update student')));
    }
}

export const removeStuff = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(getApiUrl(`/${address}/${id}`));
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to update student attendance')));
    }
}
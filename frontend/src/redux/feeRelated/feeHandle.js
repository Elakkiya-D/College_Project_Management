import axios from 'axios';
import { getApiErrorMessage, getApiUrl } from '../../utils/api';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    doneSuccess
} from './feeSlice';

export const createFee = (fields) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.post(getApiUrl('/api/admin/fees/create'), fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(doneSuccess());
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to create fee record')));
    }
};

export const getStudentFees = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(getApiUrl(`/api/student/fees/${id}`));
        if (result.data.empty) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to load fee records')));
    }
};

export const getAllFeesForAdmin = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(getApiUrl('/api/admin/fees/list'));
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to load fee registry')));
    }
};

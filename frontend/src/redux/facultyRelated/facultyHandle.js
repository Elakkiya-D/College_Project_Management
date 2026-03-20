import axios from 'axios';
import { getApiErrorMessage, getApiUrl } from '../../utils/api';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    postDone,
    doneSuccess
} from './facultySlice';

export const getAllFaculty = (id, department = "") => async (dispatch) => {
    dispatch(getRequest());

    try {
        let url = getApiUrl(`/Faculties/${id}`);
        if (department) {
            url += `?department=${department}`;
        }
        const result = await axios.get(url);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to load faculty members')));
    }
};

export const getFacultyDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(getApiUrl(`/Faculty/${id}`));
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to load faculty details')));
    }
};

export const updateFacultySubject = (facultyId, teachSubject) => async (dispatch) => {
    dispatch(getRequest());

    try {
        await axios.put(getApiUrl('/FacultySubject'), { facultyId, teachSubject }, {
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to assign course to faculty')));
    }
};

import axios from 'axios';
import { getApiErrorMessage, getApiUrl, getAuthHeaders } from '../../utils/api';
import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
} from './userSlice';

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(getApiUrl(`/${role}Login`), fields, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        });

        if (result.data?.role || result.data?.user?.role) {
            dispatch(authSuccess(result.data));
        } else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        dispatch(authError(getApiErrorMessage(error, 'Unable to sign in')));
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(getApiUrl(`/${role}Reg`), fields, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        });

        if (result.data?.schoolName || result.data?.role || result.data?.user?.role) {
            dispatch(authSuccess(result.data));
        }
        else if (result.data?.school) {
            dispatch(stuffAdded());
        }
        else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        dispatch(authError(getApiErrorMessage(error, 'Unable to complete registration')));
    }
};

export const logoutUser = () => (dispatch) => {
    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(getApiUrl(`/${address}/${id}`), {
            headers: { ...getAuthHeaders() },
        });
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to load profile details')));
    }
}

export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.delete(getApiUrl(`/${address}/${id}`), {
            headers: { ...getAuthHeaders() },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
            throw new Error(result.data.message);
        } else {
            dispatch(getDeleteSuccess());
            return result.data;
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to delete record')));
        throw error;
    }
}

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(getApiUrl(`/${address}/${id}`), fields, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        });
        if (result.data?.schoolName || result.data?.role || result.data?.user?.role) {
            dispatch(authSuccess(result.data));
        }
        else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to update record')));
    }
}

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(getApiUrl(`/${address}Create`), fields, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        });

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        dispatch(authError(getApiErrorMessage(error, 'Unable to create record')));
    }
};
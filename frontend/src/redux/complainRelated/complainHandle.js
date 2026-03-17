import axios from 'axios';
import { getApiErrorMessage, getApiUrl } from '../../utils/api';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError
} from './complainSlice';

export const getAllComplains = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(getApiUrl(`/${address}List/${id}`));
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(getApiErrorMessage(error, 'Unable to load complaints')));
    }
}
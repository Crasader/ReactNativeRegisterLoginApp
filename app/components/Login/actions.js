/**
 * Action creator
 * https://github.com/reactjs/redux/issues/291
 */
import Immutable from 'immutable';
import * as actionTypes from '../../AppActionTypes';
import { getIsLogging } from '../../reducers/loginReducers';
import Http from '../../AppHttp';
import { NavigationActions } from 'react-navigation';
import thunk from 'redux-thunk';
import {
  AsyncStorage,
  XMLHttpRequest
} from 'react-native';

//Actions creator for Success Login
export const loginSuccess = (reponse) => {
  return dispatch => {
    dispatch({error, type: actionTypes.LOGIN_SUCCESS});
    NavigationActions.navigate({ routeName: 'Dashboard' });
  };
}

//Actions creator for Login Request -
//not part of dispatch for synchronous calls
export const loginRequest = (email, password) => {
  const user = {email: email, password: password};
  return {
      user,
      type: actionTypes.LOGIN_ATTEMPT
  }
}

//Action creator for Login Error -
//not part of dispatch for synchronous calls
export const loginError = (error) => {
  return {error, type: actionTypes.LOGIN_ERROR};
}

/**
 * The main login action
 * call this on the component as :
 * this.props.login(); or this.props.dispatch(login());
 */
export const login = (email, password) => {
  return (dispatch, getState) => {
    const { login } = getState();
    if(!login.get('onLogging'))
    {
      //tell app that is logging in
      dispatch(loginRequest(email, password));

      //call server for auth
      Http.post('/m/login', {
        'email' : email,
        'password' : password,
        'type' : 0
      })
      .then(response => {
        if(reponse.status == 200 && response.status < 300)
        {
          try {
            //Refresh token for this request
            AsyncStorage.setItem('access_token', JSON.stringify(response.data.access_token));
            AsyncStorage.setItem('expires_in', JSON.stringify(response.data.expires_in));
            AsyncStorage.setItem('refresh_token', JSON.stringify(response.data.refresh_token));
            AsyncStorage.setItem('token_type', JSON.stringify(response.data.token_type));
            loginSuccess(response);
            dispatch(NavigationActions.navigate({ routeName: 'Dashboard' }));
          } catch (error) {
            dispatch(loginError(error));
          }
        }
      })
      .catch(function (error) {
        dispatch(loginError(error));
      });
    }
  };
}

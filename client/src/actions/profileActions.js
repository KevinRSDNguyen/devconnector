import axios from "axios";
import {
  GET_PROFILE,
  GET_PROFILES,
  PROFILE_LOADING,
  CLEAR_CURRENT_PROFILE,
  GET_ERRORS,
  SET_CURRENT_USER
} from "./types";

//Get current profile
export const getCurrentProfile = () => dispatch => {
  dispatch(setProfileLoading());
  axios
    .get("/api/profile")
    .then(({ data }) => {
      dispatch({
        type: GET_PROFILE,
        payload: data
      });
    })
    .catch(err => {
      dispatch({
        type: GET_PROFILE,
        payload: {}
      });
    });
};

//Get profile by handle
export const getProfileByHandle = handle => dispatch => {
  dispatch(setProfileLoading());
  axios
    .get(`/api/profile/handle/${handle}`)
    .then(({ data }) => {
      dispatch({
        type: GET_PROFILE,
        payload: data
      });
    })
    .catch(err => {
      dispatch({
        type: GET_PROFILE,
        payload: null
      });
    });
};

//Create Profile
export const createProfile = (profileData, history) => dispatch => {
  axios
    .post("/api/profile", profileData)
    .then(response => {
      history.push("/dashboard");
    })
    .catch(({ response }) => {
      dispatch({
        type: GET_ERRORS,
        payload: response.data
      });
    });
};

//Add Experience
export const addExperience = (expData, history) => dispatch => {
  axios
    .post("/api/profile/experience", expData)
    .then(response => {
      history.push("/dashboard");
    })
    .catch(({ response }) => {
      dispatch({
        type: GET_ERRORS,
        payload: response.data
      });
    });
};

//Add Education
export const addEducation = (eduData, history) => dispatch => {
  axios
    .post("/api/profile/education", eduData)
    .then(response => {
      history.push("/dashboard");
    })
    .catch(({ response }) => {
      dispatch({
        type: GET_ERRORS,
        payload: response.data
      });
    });
};

//Delete Experience
export const deleteExperience = id => dispatch => {
  axios
    .delete(`/api/profile/experience/${id}`)
    .then(({ data }) => {
      dispatch({
        type: GET_PROFILE,
        payload: data
      });
    })
    .catch(({ response }) => {
      dispatch({
        type: GET_ERRORS,
        payload: response.data
      });
    });
};

//Delete Education
export const deleteEducation = id => dispatch => {
  axios
    .delete(`/api/profile/education/${id}`)
    .then(({ data }) => {
      dispatch({
        type: GET_PROFILE,
        payload: data
      });
    })
    .catch(({ response }) => {
      dispatch({
        type: GET_ERRORS,
        payload: response.data
      });
    });
};

//Get all profiles
export const getProfiles = (limit, start = 0, list = "") => dispatch => {
  dispatch(setProfileLoading());
  axios
    .get(`/api/profile/all?limit=${limit}&skip=${start}`)
    .then(({ data }) => {
      let payload;
      if (list) {
        payload = [...list, ...data];
      } else {
        payload = data;
      }
      dispatch({
        type: GET_PROFILES,
        payload
      });
    })
    .catch(({ response }) => {
      dispatch({
        type: GET_PROFILES,
        payload: []
      });
    });
};

//Delete account and profile
export const deleteAccount = () => dispatch => {
  if (window.confirm("Are you sure? This cannot be undone!")) {
    axios
      .delete("/api/profile")
      .then(res => {
        dispatch({
          type: SET_CURRENT_USER,
          payload: {}
        });
      })
      .catch(({ response }) => {
        dispatch({
          type: GET_ERRORS,
          payload: response.data
        });
      });
  }
};

//Profile Loading
export const setProfileLoading = () => {
  return { type: PROFILE_LOADING };
};

//Clear current Profile
export const clearCurrentProfile = () => {
  return { type: CLEAR_CURRENT_PROFILE };
};

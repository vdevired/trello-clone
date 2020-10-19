export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";

export const globalReducer = (state, action) => {
    switch (action.type) {
        case LOGIN:
            return { ...state, authUser: action.user, checkedAuth: true };
        case LOGOUT:
            return { ...state, authUser: null, checkedAuth: true };
        default:
            return state;
    }
};

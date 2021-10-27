export const exportReducer = (reducerMap, defaultState) => (state, {type, data}) => {
    const currentState = state || defaultState;

    if (reducerMap[type]) {
        return reducerMap[type](currentState, data);
    }

    return currentState;
};

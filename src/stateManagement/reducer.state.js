export const initialState = {
    address: "",
    chain: "",
};

const reducer = (state, action) => {

    switch (action.type) {
        case "METAMASK_ADDRESS":
            return {
                ...state,
                address: action.payload,
            };

        case "CHAIN":
            return {
                ...state,
                chain: action.payload,
            };

        case "DISCONNECT":
            return {
                ...state,
                address: "",
                chain: "",
            };

        default:
            return state;
    }
};

export default reducer;
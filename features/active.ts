import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    activeReport : null
}

const active = createSlice({
    name: 'active',
    initialState,
    reducers: {
        setActiveReport: (state, action) => {
            state.activeReport = action.payload;
        },
    }
})

export const {setActiveReport} = active.actions;
export default active.reducer;
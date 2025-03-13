import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    frontCamera: null,
    backCamera: null
}

const reportSlice = createSlice({
    name: 'report',
    initialState,
    reducers: {
        setFrontCamera: (state, action) => {
            state.frontCamera = action.payload;
        },
        setBackCamera: (state, action) => {
            state.backCamera = action.payload;
        },
        clearCamera: (state) => {
            state.frontCamera = null;
            state.backCamera = null;
        }
    }
})

export const {setFrontCamera, setBackCamera, clearCamera} = reportSlice.actions;
export default reportSlice.reducer;

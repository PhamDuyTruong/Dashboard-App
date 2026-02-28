import { createSlice } from '@reduxjs/toolkit';

const stored = typeof window !== 'undefined' && localStorage.getItem('darkMode');
const initialState = { dark: stored !== 'false' };

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState,
  reducers: {
    toggle: (state) => {
      state.dark = !state.dark;
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', state.dark);
      }
    },
  },
});

export const { toggle } = darkModeSlice.actions;
export default darkModeSlice.reducer;

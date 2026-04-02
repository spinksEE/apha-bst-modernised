import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'govuk-blue',
  colors: {
    'govuk-blue': [
      '#e8f0f8',
      '#c4d8ed',
      '#9fbfe1',
      '#7ba7d6',
      '#568eca',
      '#1d70b8',
      '#185a93',
      '#12436e',
      '#0c2d49',
      '#061624',
    ],
  },
  fontFamily: '"GDS Transport", Arial, sans-serif',
  defaultRadius: 0,
  black: '#0b0c0c',
  white: '#ffffff',
  other: {
    focusColour: '#ffdd00',
    errorColour: '#d4351c',
  },
});

import { token } from '../token';

// Branchly brand indigo. Hue-matched to the primary accent (#4F46FF);
// indigo9 is the exact converted brand hex. Kept out of MAIN_COLOR_NAMES
// since this scale backs the UI accent only, not the user-selectable
// workspace/tag color palette.
export const INDIGO_COLOR_TOKENS = {
  scale: {
    indigo1: token({
      light: 'color(display-p3 0.992 0.992 0.999)',
      dark: 'color(display-p3 0.077 0.075 0.114)',
    }),
    indigo2: token({
      light: 'color(display-p3 0.973 0.972 0.998)',
      dark: 'color(display-p3 0.089 0.086 0.14)',
    }),
    indigo3: token({
      light: 'color(display-p3 0.945 0.943 0.992)',
      dark: 'color(display-p3 0.135 0.128 0.272)',
    }),
    indigo4: token({
      light: 'color(display-p3 0.907 0.902 1)',
      dark: 'color(display-p3 0.164 0.153 0.382)',
    }),
    indigo5: token({
      light: 'color(display-p3 0.864 0.857 1)',
      dark: 'color(display-p3 0.204 0.192 0.44)',
    }),
    indigo6: token({
      light: 'color(display-p3 0.808 0.799 0.987)',
      dark: 'color(display-p3 0.251 0.239 0.491)',
    }),
    indigo7: token({
      light: 'color(display-p3 0.732 0.721 0.955)',
      dark: 'color(display-p3 0.302 0.289 0.565)',
    }),
    indigo8: token({
      light: 'color(display-p3 0.625 0.61 0.918)',
      dark: 'color(display-p3 0.361 0.345 0.673)',
    }),
    indigo9: token('color(display-p3 0.304 0.276 0.962)'),
    indigo10: token({
      light: 'color(display-p3 0.34 0.318 0.774)',
      dark: 'color(display-p3 0.437 0.416 0.843)',
    }),
    indigo11: token({
      light: 'color(display-p3 0.347 0.326 0.748)',
      dark: 'color(display-p3 0.678 0.662 1)',
    }),
    indigo12: token({
      light: 'color(display-p3 0.165 0.154 0.371)',
      dark: 'color(display-p3 0.88 0.875 0.986)',
    }),
  },
  transparent: {
    indigo1: token({ light: '#0c00ff02', dark: '#4036fe0e' }),
    indigo2: token({ light: '#0c00ff07', dark: '#534bf916' }),
    indigo3: token({ light: '#0c00ee0f', dark: '#5a52ff3b' }),
    indigo4: token({ light: '#0c00ff19', dark: '#564dff5a' }),
    indigo5: token({ light: '#0c00ff25', dark: '#635bfd6b' }),
    indigo6: token({ light: '#0c00ff34', dark: '#746dfd7a' }),
    indigo7: token({ light: '#0b00e647', dark: '#7e77fe8e' }),
    indigo8: token({ light: '#0b00d964', dark: '#807afeac' }),
    indigo9: token({ light: '#0900c0a4', dark: '#716afed4' }),
    indigo10: token({ light: '#0900b6ae', dark: '#8079ffdc' }),
    indigo11: token({ light: '#0800abac', dark: '#ada9ff' }),
    indigo12: token({ light: '#030046d8', dark: '#e2e0fffe' }),
  },
};

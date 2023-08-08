module.exports = {
  root: true,
  extends: ['@react-native-community', 'prettier'],
  rules: {
    'object-curly-spacing': 'off',
    'comma-dangle': 'off',
    'react-native/no-inline-styles': 'off',
    'react/self-closing-com': 'off',
    'no-unused-vars': 'off',
    "@typescript-eslint/no-unused-vars": [
      "warn", // or "error"
      { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
  },
};

# How to theme

Current theme based on design system can be found here: GoodCollective/packages/app/src/theme
example of implementation can be found at:

1. import components from 'native-base' instead of 'react-native'
   1a. they are mostly the same, but have extended styling options and are connected to the above mentioned theme
2. by using the withTheme hook you can apply styles similiar to how you would do with react-native's StyleSheet
   ie.

```
import { withTheme } from '@gooddollar/good-design'
import { Text } from 'native-base'

export const theme = {
  baseStyle: {
    fontStyles: {
      title: {
        fontWeight: 700,
        color: 'black',
        fontFamily: 'heading',
        fontSize: 'md',
      }
    },
      ...// define additional styles
    }
}

const TestComponent = withTheme({ name: <Name of component, should match exported name> })(({ fontStyles }: any) => (
  <Text {...fontStyles}>TestText </Text> // add as props so that it can apply the definitions from theme
))
```

3. todo: add example for breakpoint values
4. todo: add example for variants

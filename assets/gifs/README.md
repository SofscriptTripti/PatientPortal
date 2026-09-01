# GIFs Directory

Place all your `.gif` files in this folder.

To use these GIFs in your React Native code, you can import and render them like this:

```tsx
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const MyComponent = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/gifs/your-gif-file.gif')}
        style={styles.gif}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: 200,
    height: 200,
  },
});

export default MyComponent;
```

> [!NOTE]
> On Android, you may need to ensure that your build configuration supports GIFs. If GIFs do not animate, make sure you have the required Fresco gif dependencies in your `android/app/build.gradle` (usually included by default in recent React Native versions, but worth checking if you run into rendering issues).

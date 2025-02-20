/* eslint-disable prettier/prettier */
import { useRoute } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';
import WebView from 'react-native-webview';

const FileViewer = () => {
  const route = useRoute();
  const { uri, type } = route.params as { uri: string; type: string };

  const renderContent = () => {
    if (type === 'pdf') {
      return (
        <Pdf
          source={{uri, cache: true}} // Specify the PDF file URI
          style={styles.pdf}
          onError={(error) => {
            console.log("error android", error);
          }}
          trustAllCerts={false}
        />
      );
    } else if (type === 'image') {
      return (
        <WebView
          source={{ uri: `${uri}` }}
          style={styles.webview}
          startInLoadingState={true}
          onError={(error) => {
            console.log(error);
          }}
        />
      );
    } else {
      return <Text>Unsupported file type</Text>;
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default FileViewer;

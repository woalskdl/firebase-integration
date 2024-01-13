import { ActivityIndicator, Button, Platform, StyleSheet, View } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useCallback, useEffect, useState } from 'react';
import firebaseAuth from '@react-native-firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import storage from '@react-native-firebase/storage';
import * as FileSystem from 'expo-file-system';

GoogleSignin.configure();

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [lastUploadImage, setLastUploadImage] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const onPressGoogleSignin = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog:true
      })

      const userInfo = await GoogleSignin.signIn();

      const credential = firebaseAuth.GoogleAuthProvider.credential(userInfo.idToken);
      const result = await firebaseAuth().signInWithCredential(credential);

      setUserInfo({
        name: result.additionalUserInfo.profile.name,
        profileImage:result.additionalUserInfo.profile.picture
      })

    } catch(ex) {

    }
  }, []);

  const getCurrentUserInfo = useCallback(async() => {
    try{
      setLoading(true);
      const userInfo = await GoogleSignin.signInSilently();

      const credential = firebaseAuth.GoogleAuthProvider.credential(userInfo.idToken);

      const result = await firebaseAuth().signInAnonymously(credential);

      setUserInfo({
        name: result.additionalUserInfo.profile.name,
        profileImage:result.additionalUserInfo.profile.picture
      })

      setLoading(false);
    } catch(ex) {

    }
  }, [])

  useEffect(() => {
    getCurrentUserInfo();
  }, [])

  const onPressPickFeil = useCallback(async () => {
    const pickResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality:1,
    })
    
    if(pickResult.canceled) {
      return;
    }

    const image = pickResult.assets[0];

    setSelectedImage(image);

    const uri = image.uri;
    const fileNameArray = uri.split('/');
    const fileName = fileNameArray[fileNameArray.length - 1];

    const putResult = await storage().ref(fileName).putFile(Platform.OS === 'ios' ? uri.replace('file://', '') : uri);

    setLastUploadImage(putResult);

  }, []);

  const onPressDownloadImage = useCallback(async () => {
    const downloadUrl = await storage().ref(lastUploadImage.metadata.fullPath).getDownloadURL();

    const {uri} = await FileSystem.createDownloadResumable(
      downloadUrl,
      FileSystem.documentDirectory + lastUploadImage.metadata.name,
      {}
    ).downloadAsync();

    
    
  }, [lastUploadImage]);

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', }}>
      {
        loading ? (
          <ActivityIndicator/>
        ) : (
          userInfo !== null ?
          (
            <View style={{}}>
              <Image source={{uri:userInfo.profileImage}} style={{width:100, height:100, borderRadius:50}}/>
              <Text style={{ fontSize:24, marginTopL:20 }}>{userInfo.name}</Text>
            </View>
          ) : (
            <GoogleSigninButton onPress={onPressGoogleSignin}/>
          )
        )
      }
      {
        selectedImage !== null && (
          <Image source={{uri:selectedImage.uri}} style={{width:200, height:200}} />
        )
      }

      <Button title='PICK FILE' onPress={onPressPickFeil}></Button>
      <Button title='DOWNLOAD FILE' onPress={onPressDownloadImage}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

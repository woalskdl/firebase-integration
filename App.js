import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useCallback, useEffect, useState } from 'react';
import firebaseAuth from '@react-native-firebase/auth';

GoogleSignin.configure();

export default function App() {
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

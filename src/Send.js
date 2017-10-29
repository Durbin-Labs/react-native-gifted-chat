import PropTypes from 'prop-types';
import React from 'react';
import {
  Modal,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  ViewPropTypes,
  Platform,
  PermissionsAndroid,
  PixelRatio,
  Image
} from 'react-native';
var ImagePicker = require('react-native-image-picker');
import Sound from 'react-native-sound';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import {
  DocumentPicker,
  DocumentPickerUtil
} from 'react-native-document-picker';
import { Button, Item, Input } from 'native-base';
import Icon1 from 'react-native-vector-icons/Entypo';
import IconF from 'react-native-vector-icons/FontAwesome';
// More info on all the options is below in the README...just some common use cases shown here
var options = {
  title: 'Select Avatar',
  customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};
export default class Send extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      avatarSource: null,
      videoSource: null,
      currentTime: 0.0,
      recording: false,
      playing: false,
      stoppedRecording: false,
      finished: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
      hasPermission: undefined,
      modalVisible: false,
      modalVisible2: false
    };
  }
  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }
  setModalVisible2(visible) {
    this.setState({ modalVisible2: visible });
  }
  handleMicButton() {
    this._record();
    this.setModalVisible(!this.state.modalVisible);
  }
  handleAttachmentButton() {
    console.log('Kichui hoynai bhai ohono! Wait koren..');
    DocumentPicker.show(
      {
        filetype: [DocumentPickerUtil.allFiles()]
      },
      (error, res) => {
        if (res == null) console.log('Kichui Select Korinai!');
        // Android
        if (res.uri != null) {
          console.log(res.uri, res.type, res.fileName, res.fileSize);
          // handle send
          // console.log(res);
          // this.props.onSend(
          //   {
          //     text: this.props.text.trim(),
          //     url: res.uri,
          //     filetype: 'doc',
          //     fileName: res.fileName
          //   },
          //   true
          // );
          Alert.alert(
            'Confirm upload',
            'Please press OK to confirm',
            [
              {
                text: 'Cancel',
                onPress: () => {
                  console.log('cancelled upload');
                }
              },
              {
                text: 'OK',
                onPress: () =>
                  this.props.onSend(
                    {
                      text: this.props.text.trim(),
                      url: res.uri,
                      filetype: 'doc',
                      fileName: res.fileName
                    },
                    true
                  )
              }
            ],
            { cancelable: false }
          );
        }
      }
    );
  }
  handlePhotoButton() {
    this.setModalVisible2(!this.state.modalVisible2);
  }
  selectPhotoTapped() {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true
      }
    };
    ImagePicker.showImagePicker(options, response => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        let source = { uri: response.uri };
        // this.props.onSend({text: this.props.text.trim(), url: response.uri, filetype: 'image'}, true)
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        // this.setState({
        //   avatarSource: source
        // }, ()=>{
        //   console.log("from setstate callback........")
        //   this.props.onSend({text: this.props.text.trim(), url: this.state.avatarSource}, true)
        Alert.alert(
          'Confirm upload',
          'Please press Ok to confirm',
          [
            {
              text: 'Cancel',
              onPress: () => {
                console.log('cancelled upload');
              }
            },
            {
              text: 'OK',
              onPress: () =>
                this.props.onSend(
                  {
                    text: this.props.text.trim(),
                    url: response.uri,
                    filetype: 'image'
                  },
                  true
                )
            }
          ],
          { cancelable: false }
        );
        // console.log(this.state.avatarSource)
        // });
      }
    });
  }
  selectVideoTapped() {
    const options = {
      title: 'Video Picker',
      takePhotoButtonTitle: 'Take Video',
      mediaType: 'mixed',
      videoQuality: 'high'
    };
    ImagePicker.showImagePicker(options, response => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled video picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        this.setState({
          videoSource: response.uri
        });
      }
    });
  }
  prepareRecordingPath(audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: 'High',
      AudioEncoding: 'aac',
      AudioEncodingBitRate: 32000
    });
  }
  componentDidMount() {
    this._checkPermission().then(hasPermission => {
      this.setState({ hasPermission });
      if (!hasPermission) return;
      this.prepareRecordingPath(this.state.audioPath);
      AudioRecorder.onProgress = data => {
        this.setState({ currentTime: Math.floor(data.currentTime) });
      };
      AudioRecorder.onFinished = data => {
        // Android callback comes in the form of a promise instead.
        if (Platform.OS === 'ios') {
          this._finishRecording(data.status === 'OK', data.audioFileURL);
        }
      };
    });
  }
  _checkPermission() {
    if (Platform.OS !== 'android') {
      return Promise.resolve(true);
    }
    const rationale = {
      title: 'Microphone Permission',
      message:
        'AudioExample needs access to your microphone so you can record audio.'
    };
    return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      rationale
    ).then(result => {
      console.log('Permission result:', result);
      return result === true || result === PermissionsAndroid.RESULTS.GRANTED;
    });
  }
  _renderButton(title, onPress, active) {
    var style = active ? styles.activeButtonText : styles.buttonText;
    return (
      <TouchableHighlight style={styles.button} onPress={onPress}>
        <Text style={style}>{title}</Text>
      </TouchableHighlight>
    );
  }
  async _stop() {
    // if (!this.state.recording) {
    //   console.warn('Can\'t stop, not recording!');
    //   return;
    // }
    this.setState({
      stoppedRecording: true,
      recording: false,
      currentTime: 0.0
    });
    try {
      const filePath = await AudioRecorder.stopRecording();
      console.log(filePath);
      if (Platform.OS === 'android') {
        this._finishRecording(true, filePath);
      }
      return filePath;
    } catch (error) {
      console.error(error);
    }
  }
  async _play() {
    // if (this.state.recording) {
    //   await this._stop();
    // }
    this.setState({ playing: true });
    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    setTimeout(() => {
      var sound = new Sound(this.state.audioPath, '', error => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });
      setTimeout(() => {
        sound.play(success => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }, 100);
    }, 100);
  }
  sendAudioFile() {
    // send audio file
    console.log(
      'sending file to our function........',
      this.state.modalVisible
    );
    this.props.onSend(
      {
        text: this.props.text.trim(),
        url: 'file://' + this.state.audioPath,
        filetype: 'audio'
      },
      true
    );
    this.setModalVisible(!this.state.modalVisible);
  }
  async _record() {
    if (this.state.recording) {
      console.warn('Already recording!');
      return;
    }
    if (!this.state.hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }
    if (this.state.stoppedRecording) {
      this.prepareRecordingPath(this.state.audioPath);
    }
    this.setState({ recording: true });
    try {
      const filePath = await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  }
  _finishRecording(didSucceed, filePath) {
    this.setState({ finished: didSucceed });
    console.log(
      `Finished recording of duration ${this.state
        .currentTime} seconds at path: ${filePath}`
    );
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.props.text.trim().length === 0 && nextProps.text.trim().length > 0 || this.props.text.trim().length > 0 && nextProps.text.trim().length === 0) {
  //     return true;
  //   }
  //   return false;
  // }
  render() {
    if (this.props.text.trim().length > 0) {
      return (
        <TouchableOpacity
          style={[styles.container, this.props.containerStyle]}
          onPress={() => {
            this.props.onSend({ text: this.props.text.trim() }, true);
          }}
          accessibilityTraits="button"
        >
          <View>
            {this.props.children || (
              <Text style={[styles.text, this.props.textStyle]}>
                {this.props.label}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <View>
        {/*-------------------------------------- uraniumreza ----------------------------------------------*/}

        <View>
          <Modal
            animationType={'slide'}
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setModalVisible(!this.state.modalVisible);
            }}
          >
            <View style={styles.controls}>
              <Text style={styles.progressText}>{this.state.currentTime}s</Text>

              {this.state.recording ? (
                <View>
                  {this._renderButton('STOP', () => {
                    this._stop();
                  })}
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {this._renderButton('PLAY', () => {
                    this._play();
                  })}
                  {this._renderButton('SEND', () => {
                    this.sendAudioFile(this);
                  })}
                  {this._renderButton(' CANCEL', () =>
                    this.setModalVisible(!this.state.modalVisible)
                  )}
                </View>
              )}
            </View>
          </Modal>
        </View>

        {/*-------------------------------------- uraniumreza ----------------------------------------------*/}

        <TouchableOpacity
          style={styles.micButton}
          onPress={() => this.handleMicButton()}
        >
          <IconF name={'microphone'} size={18} color="gray" align="right" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={() => this.handleAttachmentButton()}
        >
          <Icon1 name={'attachment'} size={18} color="gray" align="right" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.photoButton}
          onPress={this.selectPhotoTapped.bind(this)}
        >
          <Icon1 name={'camera'} size={20} color="gray" align="right" />
        </TouchableOpacity>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 3 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    borderRadius: 75,
    width: 150,
    height: 150
  },
  controls: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  progressText: {
    paddingBottom: 50,
    fontSize: 100,
    color: 'gray'
  },
  button: {
    padding: 20
  },
  disabledButtonText: {
    color: '#eee'
  },
  buttonText: {
    fontSize: 20,
    color: 'gray'
  },
  activeButtonText: {
    fontSize: 20,
    color: '#B81F00'
  },
  micButton: {
    height: 30,
    width: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 8,
    right: 10
  },
  attachmentButton: {
    marginRight: 30,
    height: 30,
    width: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 8,
    right: 10
  },
  photoButton: {
    marginRight: 65,
    height: 30,
    width: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 8,
    right: 10
  },
  container: {
    height: 44,
    justifyContent: 'flex-end'
  },
  text: {
    color: '#0084ff',
    fontWeight: '600',
    fontSize: 17,
    backgroundColor: 'transparent',
    marginBottom: 12,
    marginLeft: 10,
    marginRight: 10
  }
});
Send.defaultProps = {
  text: '',
  onSend: () => {},
  label: 'SEND',
  containerStyle: {},
  textStyle: {}
};
Send.propTypes = {
  text: PropTypes.string,
  onSend: PropTypes.func,
  label: PropTypes.string,
  containerStyle: ViewPropTypes.style,
  textStyle: Text.propTypes.style
};

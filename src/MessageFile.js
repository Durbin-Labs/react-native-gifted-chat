import PropTypes from 'prop-types';
import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  ViewPropTypes,
  Linking,
  ToastAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import Sound from 'react-native-sound';

export default class MessageFile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      audioPath: null,
      playing: false
    };
  }

  async _play() {
    console.log('Play Button Pressed...');
    this.setState({ playing: true });
    console.log(this.state.audioPath);
    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    setTimeout(() => {
      ToastAndroid.show('Voice Message is Loading...', ToastAndroid.SHORT);
      var sound = new Sound(this.state.audioPath, '', error => {
        if (error) {
          console.log('failed to load the sound', error);
        } else {
          setTimeout(() => {
            sound.play(success => {
              if (success) {
                this.setState({ playing: false });
                console.log('successfully finished playing');
              } else {
                console.log('playback failed due to audio decoding errors');
              }
            });
          }, 100);
        }
      });
    }, 100);
  }

  componentWillMount() {
    // console.log(this.props.currentMessage);
    if (this.props.currentMessage.audio) {
      this.setState({ audioPath: this.props.currentMessage.file });
      //alert(this.props.currentMessage.file);
    }
  }

  render() {
    return (
      <View style={[styles.container, this.props.containerStyle]}>
        {!this.props.currentMessage.audio && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 10,
              marginLeft: 10,
              marginTop: 10
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: 25,
                width: 25,
                borderWidth: 1,
                borderColor: iconColor[this.props.position],
                borderRadius: 13
              }}
            >
              <Icon
                name={'attachment'}
                size={15}
                color={iconColor[this.props.position]}
                align="right"
              />
            </View>

            <Text
              style={styles[this.props.position].text}
              onPress={() => Linking.openURL(this.props.currentMessage.file)}
            >
              Attached File
            </Text>
          </View>
        )}

        {this.props.currentMessage.audio && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 10,
              marginLeft: 10,
              marginTop: 10
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: 25,
                width: 25,
                borderWidth: 1,
                borderColor: iconColor[this.props.position],
                borderRadius: 13
              }}
            >
              {this.state.playing ? (
                <Icon
                  name={'controller-paus'}
                  size={15}
                  color={iconColor[this.props.position]}
                  align="center"
                />
              ) : (
                <Icon
                  onPress={this._play.bind(this)}
                  name={'controller-play'}
                  size={15}
                  color={iconColor[this.props.position]}
                  align="center"
                />
              )}
            </View>

            <Text style={styles[this.props.position].text}>Voice Message</Text>
          </View>
        )}
      </View>
    );
  }
}

const iconColor = {
  right: 'white',
  left: '#004212'
};

const textStyle = {
  fontSize: 18,
  fontStyle: 'italic',
  lineHeight: 20,
  marginLeft: 5,
  marginRight: 5
};

const styles = {
  left: StyleSheet.create({
    container: {},
    text: {
      color: '#004212',
      ...textStyle
    },
    link: {
      color: '#004212',
      textDecorationLine: 'underline'
    },
    icon: {
      color: '#004212'
    }
  }),
  right: StyleSheet.create({
    container: {},
    text: {
      color: 'white',
      ...textStyle
    },
    link: {
      color: 'white',
      textDecorationLine: 'underline'
    },
    icon: {
      color: 'white'
    }
  })
};

MessageFile.defaultProps = {
  position: 'left',
  currentMessage: {
    image: null
  },
  containerStyle: {},
  imageStyle: {}
};

MessageFile.propTypes = {
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  containerStyle: ViewPropTypes.style,
  imageStyle: Image.propTypes.style,
  imageProps: PropTypes.object,
  lightboxProps: PropTypes.object
};

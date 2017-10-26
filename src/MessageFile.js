import PropTypes from 'prop-types';
import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  ViewPropTypes,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import Sound from 'react-native-sound';

export default class MessageImage extends React.Component {
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
            this.setState({ playing: false });
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }, 100);
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
                height: 20,
                width: 20,
                borderWidth: 1,
                borderColor: '#004212',
                borderRadius: 10
              }}
            >
              <Icon
                name={'attachment'}
                size={12}
                color="#004212"
                align="right"
              />
            </View>

            <Text
              style={{
                color: '#004212',
                fontSize: 16,
                fontStyle: 'italic',
                marginLeft: 5
              }}
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
                height: 20,
                width: 20,
                borderWidth: 1,
                borderColor: '#004212',
                borderRadius: 10
              }}
            >
              {this.state.playing ? (
                <Icon
                  name={'controller-paus'}
                  size={12}
                  color="#004212"
                  align="right"
                />
              ) : (
                <Icon
                  onPress={this._play.bind(this)}
                  name={'controller-play'}
                  size={12}
                  color="#004212"
                  align="right"
                />
              )}
            </View>

            <Text
              style={{
                color: '#004212',
                fontSize: 16,
                fontStyle: 'italic',
                marginLeft: 5
              }}
            >
              Voice Message
            </Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
  image: {
    width: 150,
    height: 100,
    borderRadius: 13,
    margin: 3,
    resizeMode: 'cover'
  },
  imageActive: {
    flex: 1,
    resizeMode: 'contain'
  }
});

MessageImage.defaultProps = {
  currentMessage: {
    image: null
  },
  containerStyle: {},
  imageStyle: {}
};

MessageImage.propTypes = {
  currentMessage: PropTypes.object,
  containerStyle: ViewPropTypes.style,
  imageStyle: Image.propTypes.style,
  imageProps: PropTypes.object,
  lightboxProps: PropTypes.object
};


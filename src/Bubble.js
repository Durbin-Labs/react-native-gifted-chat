import PropTypes from 'prop-types';
import React from 'react';
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewPropTypes,
  Modal,
  ScrollView,
  Image,
  TouchableHighlight,
  ToastAndroid,
  
} from 'react-native';

import {Button, Item, Input} from 'native-base';
import Meteor from 'react-native-meteor';

import Icon2 from 'react-native-vector-icons/Ionicons';
export const RANKS = ['NULL', 'Second Lieutenant', 'Lieutenant', 'Captain', 'Major', 'Lieutenant Colonel', 'Colonel', 'Brigadier General', 'Warrant Officer', 'Senior Warrant Officer', 'Master Warrant Officer', 'Honorary Lieutenant', 'Honorary Captain' ];

import MessageText from './MessageText';
import MessageImage from './MessageImage';
import Time from './Time';

import { isSameUser, isSameDay, warnDeprecated } from './utils';

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);
    this.onLongPress = this.onLongPress.bind(this);

    this.state= {
      contacts: null,
      resultFound: null,
      modalVisible: false,
      searchString: '',
      messageString: '',
    }
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  handleBubbleToNext() {
    if (isSameUser(this.props.currentMessage, this.props.nextMessage) && isSameDay(this.props.currentMessage, this.props.nextMessage)) {
      return StyleSheet.flatten([styles[this.props.position].containerToNext, this.props.containerToNextStyle[this.props.position]]);
    }
    return null;
  }

  handleBubbleToPrevious() {
    if (isSameUser(this.props.currentMessage, this.props.previousMessage) && isSameDay(this.props.currentMessage, this.props.previousMessage)) {
      return StyleSheet.flatten([styles[this.props.position].containerToPrevious, this.props.containerToPreviousStyle[this.props.position]]);
    }
    return null;
  }

  renderMessageText() {
    if (this.props.currentMessage.text) {
      const {containerStyle, wrapperStyle, ...messageTextProps} = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps}/>;
    }
    return null;
  }

  renderMessageImage() {
    if (this.props.currentMessage.image) {
      const {containerStyle, wrapperStyle, ...messageImageProps} = this.props;
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps);
      }
      return <MessageImage {...messageImageProps}/>;
    }
    return null;
  }

  renderTicks() {
    const {currentMessage} = this.props;
    if (this.props.renderTicks) {
        return this.props.renderTicks(currentMessage);
    }
    if (currentMessage.user._id !== this.props.user._id) {
        return;
    }
    if (currentMessage.sent || currentMessage.received) {
      return (
        <View style={styles.tickView}>
          {currentMessage.sent && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
          {currentMessage.received && <Text style={[styles.tick, this.props.tickStyle]}>✓</Text>}
        </View>
      )
    }
  }

  renderTime() {
    if (this.props.currentMessage.createdAt) {
      const {containerStyle, wrapperStyle, ...timeProps} = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return <Time {...timeProps}/>;
    }
    return null;
  }

  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props);
    }
    return null;
  }

  onLongPress() {
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context, this.props.currentMessage);
    } else {
      if (this.props.currentMessage.text) {
        const options = [
          'Forward',
          'Copy',
          'Cancel',
        ];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions({
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              this.setModalVisible(!this.state.modalVisible);
              this.setState({messageString: this.props.currentMessage.text});
              break;
            case 1:
              Clipboard.setString(this.props.currentMessage.text);
              break;
          }
        });
      }
    }
  }


  // -------------------------------------- uraniumreza ----------------------------------------------

  fetchContactsList() {
    let context = this;
    Meteor.call("get.friendList", function(error, result){
      if(error){
        //console.log("Mara Khaiche: ", error);
        context.setState({failed: true});
      }
      if(result){
        //console.log("Message er vitore: ", result);
        var id = Meteor.user()._id;

        for(i=0; i<result.length; i++){
          //console.log(result[i]);
          if(id == result[i]._id){
            result.splice(i, 1);
          }
        }

        let newResult = [];

        let key = context.state.searchString;
        let j = 0;
        for(i=0; i<result.length; i++){
          console.log(key, result[i].profile.name.indexOf(key), result[i].profile.name);
          if(result[i].profile.name.toLowerCase().indexOf(key) !== -1){
            newResult[j] = result[i];
            j++;
          }
        }        

        newResult.sort(function(a, b){
          var nameA = a.profile.name.toLowerCase(), nameB = b.profile.name.toLowerCase()
          if (nameA < nameB) //sort string ascending
              return -1 
          if (nameA > nameB)
              return 1
          return 0 //default return value (no sorting)
        })

        //console.log(result);
        context.setState({contacts: newResult});
      }
    });
  }

  sendMessage(id){
    let context = this;
    console.log("sendMessage Functionality er jonno button pressed: ", context.state.messageString),
    
    Meteor.call("get.chatId", id, function(error, result){
      if(error){
        console.log("Mara Khaiche Message button e chapar pore: ", error);
      }
      if(result){
        console.log("Chat ID paichi vai dekhen: ", result);
        data = {
          chatId: result, 
          senderId: Meteor.user()._id, 
          message: context.state.messageString,
        }

        Meteor.call('add.chatMessage', data, (err,res)=>{
          if(err){
              alert("Sorry! Message was not sent");
          }
          if(res){
            console.log("Okay Bhai Message Forward Korte parchi.. Check koren giya! ", res);
          }
        })
      }
    })
    ToastAndroid.showWithGravity('Message has been forwarded!', ToastAndroid.SHORT, ToastAndroid.CENTER);
    this.setModalVisible(!this.state.modalVisible);
  }

  // -------------------------------------- uraniumreza ----------------------------------------------

  render() {
    // -------------------------------------- uraniumreza ----------------------------------------------

    let collection2 = [];
    let data;
    let context = this;
    if(this.state.contacts){
      this.state.contacts.map(function (obj, index) {
        collection2[index] =
        <TouchableHighlight
          underlayColor = {'transparent'}
          key={index}
          onPress={() => context.sendMessage(obj._id)}
        >
          <View key={index} style={{backgroundColor: 'transparent',}}>
            <View style={styles.containerStyle}>
              <View style={styles.imageViewStyle}>
                <Image
                  style={styles.imageStyle}
                  source={{uri: 'http://durbintest.pro/images/pp.jpg'}}
                />
              </View>
              <View style={styles.textStyle}>
                <Text style={styles.nameStyle}>{obj.profile.name}</Text>
                <Text style={styles.titleStyle}>{RANKS[obj.profile.rank]}</Text>
              </View>
            </View>

            <View
              style={{
                opacity: .7,
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'space-around',
                borderBottomWidth: 1,
                borderBottomColor: 'grey',
                alignSelf: 'stretch',
                marginRight: 35,
                marginLeft: 107,
              }}
            />
          </View>
        </TouchableHighlight>
      });
    }

    // -------------------------------------- uraniumreza ----------------------------------------------

    return (
      <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
        
        {/*-------------------------------------- uraniumreza ----------------------------------------------*/}
        
        <View>
          <Modal
            animationType={"slide"}
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setModalVisible(!this.state.modalVisible)}}
          >

            <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
              <View style={{marginTop: 10, marginLeft: 20, flexDirection: 'row', justifyContent: 'center'}}>
                <View>
                  <Item rounded style={{marginTop: 20, height: 50, width: 250}}>
                      <Input
                        placeholder='Contact Name'
                        style={{opacity: 0.7, fontSize:16, color: 'gray'}}
                        value={this.state.searchString}
                        onChangeText={searchString => this.setState({searchString})}
                      />
                  </Item>
                </View>

                <View>
                  <Button rounded style={styles.buttonStyle} onPress={this.fetchContactsList.bind(this)}>
                    <Icon2 name='ios-search' size={30} color="white" align='center'/>
                  </Button>
                </View>
              </View>

              <ScrollView style={{paddingTop: 5, paddingBottom: 10,}}>
                {collection2}
              </ScrollView>
            </View>
          </Modal>
        </View>
        
        {/*-------------------------------------- uraniumreza ----------------------------------------------*/}

        <View style={[styles[this.props.position].wrapper, this.props.wrapperStyle[this.props.position], this.handleBubbleToNext(), this.handleBubbleToPrevious()]}>
          <TouchableWithoutFeedback
            onLongPress={this.onLongPress}
            accessibilityTraits="text"
            {...this.props.touchableProps}
          >
            <View>
              {this.renderCustomView()}
              {this.renderMessageImage()}
              {this.renderMessageText()}
              <View style={[styles.bottom, this.props.bottomContainerStyle[this.props.position]]}>
                {this.renderTime()}
                {this.renderTicks()}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

const styles = {
  containerStyle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  titleStyle: {
    fontFamily: 'Roboto',
    fontSize: 13,
    color: "grey",
    paddingTop: 8,
  },
  imageStyle: {
    flex: 1,
    resizeMode: 'contain',
    height: 70,
    width: 70,
    borderRadius: 75,
    borderWidth: 0,
    borderColor: '#FFFFFF',
  },
  imageViewStyle: {
    height: 72,
    width: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'grey',
    backgroundColor: '#FFFFFF',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  textStyle: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  nameStyle: {
    fontFamily: 'Roboto_medium',
    fontSize: 18,
    color: "grey",
  },
  buttonStyle: {
    opacity: 1,
    marginBottom: 15,
    marginTop: 20,
    marginLeft: 10,
    marginRight: 25,
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5F9EA0',
    borderColor: '#5F9EA0',
    shadowColor: 'gray',
    shadowOpacity: 0.2,
    shadowOffset: {height: .5, width: 1},
    elevation: 1.5
  },

  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#f0f0f0',
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#0084ff',
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
  }),
  bottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tick: {
    fontSize: 10,
    backgroundColor: 'transparent',
    color: 'white',
  },
  tickView: {
    flexDirection: 'row',
    marginRight: 10,
  }
};

Bubble.contextTypes = {
  actionSheet: PropTypes.func,
};

Bubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTime: null,
  position: 'left',
  currentMessage: {
    text: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  tickStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
  //TODO: remove in next major release
  isSameDay: warnDeprecated(isSameDay),
  isSameUser: warnDeprecated(isSameUser),
};

Bubble.propTypes = {
  touchableProps: PropTypes.object,
  onLongPress: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderTime: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  wrapperStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  bottomContainerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  tickStyle: Text.propTypes.style,
  containerToNextStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  //TODO: remove in next major release
  isSameDay: PropTypes.func,
  isSameUser: PropTypes.func,
};

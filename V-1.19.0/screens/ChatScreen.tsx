/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import moment from 'moment'; // Import moment
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  FlatList,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Modal,
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import FooterUser from '../components/Footer/FooterUser';
import { TouchableWithoutFeedback } from 'react-native';
import EmojiSelector from 'react-native-emoji-selector';

type RootStackParamList = {
  GroupDetailsScreen: { group: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const fakeUsersData = [
  {
    id: '1',
    name: 'John Doe',
    image: 'https://randomuser.me/api/portraits/lego/1.jpg',
    status: 'active',
    jobTitle: 'Frontend Developer',
    email: 'johndoe@gmail.com',
    mobile: '9562314587',
    region: 'Adajan, Kutch, Vapi',
    unreadCount: 4,
  },
  {
    id: '2',
    name: 'Jane Smith',
    image: 'https://randomuser.me/api/portraits/lego/5.jpg',
    status: 'busy',
    jobTitle: 'Frontend Developer',
    email: 'janesmith@gmail.com',
    mobile: '9562314587',
    region: 'Adajan',
  },
  {
    id: '3',
    name: 'Alice Cooper',
    image: 'https://randomuser.me/api/portraits/lego/3.jpg',
    status: 'offline',
    jobTitle: 'Frontend Developer',
    email: 'alice@gmail.com',
    mobile: '9562314587',
    region: 'Adajan, Vapi',
    unreadCount: 2,
  },
  {
    id: '4',
    name: 'Bob Marley',
    image: 'https://randomuser.me/api/portraits/lego/4.jpg',
    status: 'active',
    jobTitle: 'Frontend Developer',
    email: 'bobmarley@gmail.com',
    mobile: '9562314587',
    region: 'Kutch, Vapi'
  },
];

const fakeGroupsData = [
  {
    id: '1',
    groupName: 'Default Group',
    groupImage: 'https://randomuser.me/api/portraits/lego/2.jpg',
    lastMessage: 'Hey, anyone available for the meeting?',
    unreadCount: 2,
    members: [fakeUsersData[0], fakeUsersData[1], fakeUsersData[2], fakeUsersData[3]],
    createdAt: 'Sat Dec 14 2024 10:30:00 GMT+0000 (GMT)'
  },
  {
    id: '2',
    groupName: 'Team B',
    groupImage: 'https://randomuser.me/api/portraits/men/2.jpg',
    lastMessage: 'Let\'s plan the next project.',
    unreadCount: 0,
    members: [fakeUsersData[2], fakeUsersData[3]],
  },
  {
    id: '3',
    groupName: 'Default Group',
    groupImage: 'https://randomuser.me/api/portraits/lego/2.jpg',
    lastMessage: 'Hey, anyone available for the meeting?',
    unreadCount: 2,
    members: [fakeUsersData[0], fakeUsersData[1], fakeUsersData[2], fakeUsersData[3]],
    createdAt: 'Sat Dec 14 2024 10:30:00 GMT+0000 (GMT)'
  },
  {
    id: '4',
    groupName: 'Team B',
    groupImage: 'https://randomuser.me/api/portraits/men/2.jpg',
    lastMessage: 'Let\'s plan the next project.',
    unreadCount: 0,
    members: [fakeUsersData[2], fakeUsersData[3]],
  },
];

const fakeMessages = [
  { id: '1', sender: 'John', message: 'Hello! How have you been?', timestamp: 'Tue Dec 17 2024 10:30:00 GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[0].image },
  { id: '2', sender: 'You', message: 'Hey, I\'ve been good! How about you?', timestamp: 'Tue Dec 17 2024 10:32:00 GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '3', sender: 'John', message: 'I\'m doing great! Any plans for the weekend?', timestamp: 'Tue Dec 17 2024 10:35:00 GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[0].image },
  { id: '4', sender: 'You', message: 'Not sure yet, maybe catch up with some friends.', timestamp: 'Tue Dec 17 2024 10:36:00 GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '5', sender: 'John', message: 'Sounds fun! Let me know if you\'re free.', timestamp: 'Tue Dec 17 2024 10:40:00 GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[0].image },
  { id: '6', sender: 'You', message: 'Will do! Talk to you later.', timestamp: 'Tue Dec 17 2024 10:45:00 GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '7', sender: 'Alice', message: 'Are you coming to the party tonight?', timestamp: 'Tue Dec 17 2024 7:30:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[2].image },
  { id: '8', sender: 'You', message: 'I\'ll be there! What time does it start?', timestamp: 'Tue Dec 17 2024 7:32:00 PM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '9', sender: 'Alice', message: 'It starts at 8 PM. See you there!', timestamp: 'Tue Dec 17 2024 7:35:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[2].image },
  { id: '10', sender: 'You', message: 'Great! I\'m excited!', timestamp: 'Tue Dec 17 2024 7:36:00 PM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '11', sender: 'Bob', message: 'Do you want to grab lunch tomorrow?', timestamp: 'Wed Dec 18 2024 12:00:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[3].image },
  { id: '12', sender: 'You', message: 'Sure! What time are you thinking?', timestamp: 'Wed Dec 18 2024 12:05:00 PM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '13', sender: 'Bob', message: 'How about 1 PM?', timestamp: 'Wed Dec 18 2024 12:10:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[3].image },
  { id: '14', sender: 'You', message: 'Perfect, I\'ll see you then.', timestamp: 'Wed Dec 18 2024 12:15:00 PM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '15', sender: 'John', message: 'Hey, did you finish that task? Need help?', timestamp: 'Wed Dec 18 2024 2:00:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[0].image },
  { id: '16', sender: 'You', message: 'Almost there, just a few things left.', timestamp: 'Wed Dec 18 2024 2:05:00 PM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '17', sender: 'John', message: 'Let me know if you need anything.', timestamp: 'Wed Dec 18 2024 2:10:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[0].image },
  { id: '18', sender: 'You', message: 'Will do, thanks!', timestamp: 'Wed Dec 18 2024 2:15:00 PM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '19', sender: 'Alice', message: 'What time are you arriving at the party?', timestamp: 'Wed Dec 18 2024 7:45:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[2].image },
  { id: '20', sender: 'You', message: 'I\'ll be there around 8 PM.', timestamp: 'Wed Dec 18 2024 7:50:00 PM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image }
];

const fakeUserMessages = [
  // Messages between You and John Doe
  { id: '1', sender: 'You', receiver: 'John Doe', message: 'Hey John, how are you?', timestamp: 'Wed Dec 18 2024 9:00:00 AM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '2', sender: 'John Doe', receiver: 'You', message: 'I am good, thanks! How about you?', timestamp: 'Wed Dec 18 2024 9:02:00 AM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[0].image },

  // Messages between You and Jane Smith
  { id: '3', sender: 'You', receiver: 'Jane Smith', message: 'Hi Jane, are you available for a quick call?', timestamp: 'Wed Dec 18 2024 10:00:00 AM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '4', sender: 'Jane Smith', receiver: 'You', message: 'Not right now, I am a bit busy. Can we talk later?', timestamp: 'Wed Dec 18 2024 10:05:00 AM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[1].image },

  // Messages between You and Alice Cooper
  { id: '5', sender: 'You', receiver: 'Alice Cooper', message: 'Alice, do you have the report ready?', timestamp: 'Wed Dec 18 2024 11:00:00 AM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '6', sender: 'Alice Cooper', receiver: 'You', message: 'Yes, I will send it over shortly.', timestamp: 'Wed Dec 18 2024 11:10:00 AM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[2].image },

  // Messages between You and Bob Marley
  { id: '7', sender: 'You', receiver: 'Bob Marley', message: 'Bob, are you free for lunch tomorrow?', timestamp: 'Wed Dec 18 2024 12:00:00 PM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '8', sender: 'Bob Marley', receiver: 'You', message: 'Sure, what time works for you?', timestamp: 'Wed Dec 18 2024 12:05:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[3].image },

  // Additional messages to populate the dataset
  { id: '9', sender: 'You', receiver: 'John Doe', message: 'Let me know if you need help with the project.', timestamp: 'Wed Dec 18 2024 1:00:00 PM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '10', sender: 'John Doe', receiver: 'You', message: 'Thanks! I will.', timestamp: 'Wed Dec 18 2024 1:05:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[0].image },
  { id: '11', sender: 'You', receiver: 'Jane Smith', message: 'Did you get the update from the team?', timestamp: 'Wed Dec 18 2024 2:00:00 PM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '12', sender: 'Jane Smith', receiver: 'You', message: 'Yes, I did. Everything looks good.', timestamp: 'Wed Dec 18 2024 2:10:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[1].image },
  { id: '13', sender: 'You', receiver: 'Alice Cooper', message: 'Thanks for the report, it looks great!', timestamp: 'Wed Dec 18 2024 3:00:00 PM GMT+0000 (GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '14', sender: 'Alice Cooper', receiver: 'You', message: 'Glad you liked it.', timestamp: 'Wed Dec 18 2024 3:15:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[2].image },
  { id: '15', sender: 'You', receiver: 'Bob Marley', message: 'Lets finalize the lunch plan for tomorrow.', timestamp: 'Wed Dec 18 2024 4:00:00 PM GMT+0000(GMT)', type: 'sent', senderImage: fakeUsersData[1].image },
  { id: '16', sender: 'Bob Marley', receiver: 'You', message: 'Sounds good, see you tomorrow!', timestamp: 'Wed Dec 18 2024 4:10:00 PM GMT+0000 (GMT)', type: 'received', senderImage: fakeUsersData[3].image },
];



const ChatScreen = () => {
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeContact, setActiveContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(fakeMessages);
  const [contactMessages, setContactMessages] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [groups, setGroups] = useState(fakeGroupsData);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(3);

  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0 || contactMessages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, contactMessages]);

  const handleMenuClick = () => {
    setMenuVisible(!menuVisible);
  };

  const handleGroupHeaderClick = () => {
    setMenuVisible(false);
    if (activeGroup) {
      navigation.navigate('GroupDetailsScreen', { group: activeGroup });
    }
  };

  const handleContactHeaderClick = () => {
    setMenuVisible(false);
    if (activeContact) {
      navigation.navigate('UserDetailsScreen', { contact: activeContact });
    }
  };

  const handleGroupClick = (group) => {
    const updatedGroups = groups.map((g) =>
      g.id === group.id ? { ...g, unreadCount: 0 } : g
    );
    setGroups(updatedGroups);
    setActiveGroup(group);
    setActiveContact(null);
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prevMessage) => prevMessage + emoji);
    setEmojiPickerVisible(false);
  };


  const renderGroupItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleGroupClick(item)} style={styles.groupContainer}>
      <Image source={{ uri: item.groupImage }} style={styles.groupImage} />
      <View style={styles.groupDetails}>
        <Text style={styles.groupName}>{item.groupName}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );


  const handleContactClick = (contact) => {
    setActiveContact(contact);
    setActiveGroup(null);

    // Filter messages for the selected contact from fakeUserMessages
    const contactChatMessages = fakeUserMessages.filter(
      (msg) =>
        (msg.sender === contact.name && msg.receiver === 'You') ||
        (msg.receiver === contact.name && msg.sender === 'You')
    );
    setContactMessages(contactChatMessages); // Set messages only for the selected contact
  };



  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMessageObj = {
        id: (messages.length + contactMessages.length + 1).toString(),
        sender: 'You',
        message: newMessage,
        timestamp: moment().format('hh:mm A'),
        type: 'sent',
        senderImage: fakeUsersData[1].image,
      };

      // For the active contact, append the message only to contactMessages
      if (activeGroup) {
        setMessages([...messages, newMessageObj]);
      } else if (activeContact) {
        setContactMessages([...contactMessages, newMessageObj]);
      }

      // Save the message to main messages (in case you want to show all messages in the general list too)
      setMessages((prevMessages) => [...prevMessages, newMessageObj]);
      setNewMessage('');
    }
  };

  const renderMessageItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === 'sent' ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Image source={{ uri: item.senderImage }} style={styles.messageAvatar} />
      <View style={styles.messageTextContainer}>
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.lastMessageTime}>
          {moment(item.timestamp, 'hh:mm A').format('hh:mm A')}
        </Text>
      </View>
    </View>
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleContactClick(item)} style={styles.userContainer}>
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: item.image }} style={styles.userImage} />
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.status === 'active'
                ? '#28C76F'
                : item.status === 'busy'
                  ? '#FF9F43'
                  : item.status === 'offline'
                    ? '#808390'
                    : '#FF4C51',
            },
          ]}
        />
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.memberStatus}>{item.jobTitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!activeGroup && !activeContact ? (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.searchContainer}>
            <Icon
              name="magnify"
              size={20}
              color="#3C4764"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Checkpoints"
              placeholderTextColor="#A0A0A0"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />
          </View>

          <Text style={styles.sectionTitle}>Groups</Text>
          <View style={styles.userListContainer}>
            <FlatList
              data={groups}
              renderItem={renderGroupItem}
              keyExtractor={(item) => item.id}
            />
          </View>

          <Text style={styles.sectionTitle}>Contacts</Text>
          <View style={styles.userListContainer}>
            <FlatList
              data={fakeUsersData}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
            />
          </View>
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            onPress={() => {
              if (activeGroup) {
                handleGroupHeaderClick();
              } else if (activeContact) {
                handleContactHeaderClick();
              } else {
                setActiveGroup(null);
                setActiveContact(null);
              }
            }}
            style={styles.chatHeader}
          >
            <TouchableOpacity
              onPress={() => {
                if (activeGroup) {
                  setActiveGroup(null);
                } else {
                  setActiveContact(null);
                }
              }} style={styles.backIcon}>
              <Icon name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            {activeGroup && activeGroup.unreadCount > 0 && (
              <View>
                <Text style={styles.unseenBadgeText}>{activeGroup.unreadCount}</Text>
              </View>
            )}
            {activeGroup && activeContact.unreadCount > 0 && (
              <View>
                <Text style={styles.unseenBadgeText}>{activeGroup.unreadCount}</Text>
              </View>
            )}
            {/* {activeContact && activeContact.filter((msg) => !msg.unreadCount).length > 0 && (
              <View>
                <Text style={styles.unseenBadgeText}>
                  {contactMessages.filter((msg) => !msg.unreadCount).length}
                </Text>
              </View>
            )} */}
            <Image
              source={{ uri: activeGroup ? activeGroup.groupImage : activeContact.image }}
              style={styles.groupImage}
            />
            <Text style={styles.groupNameHeader}>
              {activeGroup?.groupName || activeContact?.name}
            </Text>
            {(activeGroup || activeContact) && (
              <TouchableOpacity style={styles.moreIcon} onPress={handleMenuClick}>
                <Icon name="dots-vertical" size={24} color="#000" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {menuVisible && (
            <View style={styles.menuContainer}>
              {/* Conditional rendering for Group Info or Contact Info */}
              {activeGroup ? (
                <TouchableOpacity
                  onPress={() => handleGroupHeaderClick()}
                  style={styles.menuOptionContainer}
                >
                  <Text style={styles.menuOption}>Group Info</Text>
                </TouchableOpacity>
              ) : activeContact ? (
                <TouchableOpacity
                  onPress={() => handleContactHeaderClick()}
                  style={styles.menuOptionContainer}
                >
                  <Text style={styles.menuOption}>Contact Info</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}



          <ImageBackground
            source={require('../assets/images/Wallpaper.jpg')}
            style={styles.chatContainer}>
            <ScrollView style={styles.messagesContainer}>
              <FlatList
                ref={flatListRef}
                data={activeGroup ? messages : contactMessages}
                renderItem={renderMessageItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.messageListContainer}
              />
            </ScrollView>

            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={() => setEmojiPickerVisible(true)} style={styles.icon}>
                <Icon name="emoticon" size={24} color="#555" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message"
              />

              {/* <TextInput
                style={styles.input}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message"
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              /> */}

              <TouchableOpacity onPress={handleSendMessage}>
                <Icon name="send-outline" size={24} color="#555" />

                {/* <Text style={styles.sendButton}>Send</Text> */}
              </TouchableOpacity>
            </View>

            <Modal
              visible={emojiPickerVisible}
              transparent={false}
              animationType="slide"
              onRequestClose={() => setEmojiPickerVisible(false)}
            >
              <TouchableWithoutFeedback onPress={() => setEmojiPickerVisible(false)}>
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback>
                    <View style={styles.emojiPickerContainer}>
                      <EmojiSelector onEmojiSelected={handleEmojiSelect} />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </ImageBackground>
        </KeyboardAvoidingView>
      )}

      <FooterUser activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEFF4',
    paddingBottom: 40,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#D3D3D3",
    paddingHorizontal: 10,
    paddingVertical: 10,
    height: 40,
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  mainContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#333",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  sectionTitles: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: '#f1f1f1',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: '100%',
    maxWidth: 400,
    marginBottom: 10,
    marginTop: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 35,
    fontSize: 13,
    color: '#333',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  groupContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    margin: 5,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupImageContainer: {
    position: 'relative',
  },
  groupImage: {
    width: 35,
    height: 35,
    borderRadius: 25,
  },
  unreadBadge: {
    backgroundColor: '#D01E12',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  groupDetails: {
    marginLeft: 15,
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    color: '#000',
  },
  lastMessage: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  userAvatarContainer: {
    marginLeft: -10,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 20,

  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  groupNameHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginLeft: 10,
  },
  userListContainer: {
    paddingBottom: 30,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 5,
    elevation: 2,
  },
  userImage: {
    width: 35,
    height: 35,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    color: '#000',
  },
  moreIcon: {
    padding: 5,
  },
  backIcon: {
    marginRight: 20,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
    // marginBottom: 50,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    padding: 8,
    borderRadius: 10,
    maxWidth: '80%',
    // backgroundColor:'#6BAEE4',
    // marginBottom:100,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#D1F7D6',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F0F0',
  },
  messageAvatar: {
    width: 22,
    height: 22,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 2,
  },
  messageTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#000',
    marginTop: 2,
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#888',
    // marginTop: 1,
    textAlign: 'right'
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginRight: 50,
    // marginTop: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    // marginTop: 1,
  },
  sendButton: {
    color: '#D01E12',
    fontSize: 16,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiPickerContainer: {
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
  },
  closeModalButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 1000,
  },
  menuOptionContainer: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  menuOption: {
    fontSize: 18,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -3,
    left: '70%',
    transform: [{ translateX: -7.5 }],
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberStatus: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  messageListContainer: {
    paddingVertical: 10,
  },
  unseenBadgeText: {
    fontSize: 16,
    color: '#000',
    marginRight: 20,
  }
});
export default ChatScreen;
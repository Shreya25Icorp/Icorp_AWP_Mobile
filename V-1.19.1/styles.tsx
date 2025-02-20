import {Dimensions, Platform, StyleSheet} from 'react-native';

export const colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  white: '#ffffff',
  black: '#000000',
  grey: '#95a5a6',
};

export const fonts = {
  regular: 'Quicksand-Regular',
  bold: 'Quicksand-Bold',
  sizeSmall: 12,
  sizeMedium: 16,
  sizeLarge: 20,
};

export const layout = {
  paddingSmall: 8,
  paddingMedium: 16,
  paddingLarge: 24,
  marginSmall: 8,
  marginMedium: 16,
  marginLarge: 24,
  borderRadius: 8,
};



const windowWidth = Dimensions.get('window').width;

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: layout.paddingMedium,
    backgroundColor: colors.white,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizeMedium,
    color: colors.black,
  },
  button: {
    backgroundColor: colors.primary,
    padding: layout.paddingMedium,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: fonts.sizeMedium,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: colors.grey,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: 'grey',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    fontFamily: fonts.bold,
  },
  loaderCircle: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    // marginTop: 20,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: to create a dimmed background effect
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
    color: '#3C4764',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    elevation: 5, // Adds shadow on Android
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalButton: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#D01E12',
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    // height: '100%',
    width: windowWidth, // Adjust the sidebar width as needed
    backgroundColor: '#fff', // Set your desired sidebar background color
    zIndex: 1, // Ensure the sidebar appears above other content
    marginBottom: 120,
  },
  menuIconContainer: {
    position: 'absolute',
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    top: 15,
  },
  backArrow: {
    position: 'absolute',
    left: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    top: 10,
  },
  backArrowSitePin: {
    // position: 'absolute',
    // left: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    top: 10,
  },

  menuIcon: {
    width: 24,
    height: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 30,
    // backgroundColor: '#fff',
    borderRadius: 25,
    padding: 5,
    marginHorizontal: 15,
    maxWidth: '100%'
  },
  paginationButton: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 50,
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#3C4764',
  },
  paginationNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationNumber: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d9d9d9',
  },
  paginationNumberText: {
    fontSize: 16,
    color: '#3C4764',
  },
  activePaginationNumber: {
    backgroundColor: '#3C4764', // Red background for the active page
    borderRadius: 50, // Fully rounded active page
  },
  activePaginationNumberText: {
    color: '#FFFFFF', // White text color for the active page
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 2,
    marginVertical: 13
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    color: '#262D3F',
  },
  headerContainer: {
    backgroundColor: '#3C4764', // Blue color for header background
    paddingVertical: 8, // Padding inside the header
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    width: '100%',
    // marginBottom: 10,
    // No margin or extra space to avoid affecting the card's layout
  },
  headerText: {
    color: '#fff', // White color for header text
    fontSize: 14,
    fontWeight: 'bold',
    paddingLeft: 15, // Center text horizontally
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    paddingBottom: 6,
  },
  text1: {
    width: 90,
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    flexShrink: 0,
    // flex: 1
  },
  subText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'normal',
    flex: 1, // Take up remaining space
    flexWrap: 'wrap',
  },

  table: {
    // Optional: you can add some styles to the table if needed
  },
  tablerow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // Optional: add borders for each row
  },
  labelColumn: {
    flex: 1.5,
    // backgroundColor: '#f5f5f5', // Background color for label column
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontWeight: 'bold',
    color: '#000',
  },
  labelColumnIncident: {
    left: 10,
    fontSize: 13,
    color: '#3C4764',
  },
  valueColumn: {
    flex: 1.5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    color: '#333', // Value text color
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContentReport: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    elevation: 5, // Adds a subtle shadow on Android
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#262D3F',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
    color: '#262D3F',
  },
  cancelButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#D01E12',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    top: 22,
    alignSelf: 'flex-end',
    paddingRight: 22,
  },
  closeButtonContact: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FF4D4D',
    borderRadius: 25,
    padding: 4,
  },
  closeButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  closeButtonIcon: {
    width: 24,
    height: 24,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainerContact: {
    backgroundColor: 'white',
    // padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
    padding: 20,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#3C4764',
    marginLeft: 10,
  },
  modalIcon: {
    marginRight: 10,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonIcon: {
    marginRight: 10,
  },
  profileImageText1: {
    marginTop: 5,
    fontSize: 14,
    color: '#3C4764',
    // textAlign: 'center',
  },
  profileBlock: {
    backgroundColor: '#FFF',
    // padding: 15,
    // margin: 15,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    width: windowWidth - 30,
    marginHorizontal: 15,
    marginVertical: 5,
  },
  profileImageContainer: {
    // position: 'absolute',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 75,
  },
  profileTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 4,
    justifyContent: 'center',
  },
  profileImageText: {
    fontSize: 16,
    color: '#262D3F',
    textAlign: 'center',
    fontWeight: '800',
  },
  profilegmailtext: {
    fontSize: 16,
    color: '#262D3F',
    textAlign: 'center',
    // fontWeight: '800',
  },
  initialsCircle: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#262D3F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initialsText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  overlayImageGlobal: {
    ...StyleSheet.absoluteFillObject,
    // height: 300,
    width: '100%',
    backgroundColor: '#39445F',
  },
  whiteBox: {
    marginBottom: 200,
    top: 75,
    backgroundColor: '#EDEFF4',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#EDEFF4',
    elevation: 2,
    // flex: 1
    height: '100%',
  },
  whiteBoxProfile: {
    marginBottom: 200,
    top: 65,
    backgroundColor: '#EDEFF4',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#EDEFF4',
    elevation: 2,
    // flex: 1
    height: '100%',
  },
  countericon: {
    marginBottom: 10,
    height: 65,
    width: 65,
  },
  leftContainer: {
    flexDirection: 'row', // Ensure the counter and arrow are in a row
    alignItems: 'center', // Align them vertically
  },
  rightContainer: {
    flexDirection: 'row', // Same for the right side
    alignItems: 'center', // Align vertically
  },
  loaderContainer1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    zIndex: 10, // Ensure it overlays everything
  },
  overlayImageContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  overlayProfileImage: {
    width: "100%",
    height: "100%",
  },
  bottomOverlayImageContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
  },
  bottomImage: {
    height: 363,
  },
  overlayTextContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    marginVertical: 40,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  overlayText: {
    fontSize: 20,
    marginHorizontal: 30,
    fontWeight: "bold",
    color: "#262D3F",
  },
  overlayTextFilter: {
    marginTop: 20,
    fontSize: 16,
    marginHorizontal: 30,
    fontWeight: "400",
    color: "#3C4764",
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderColor: "#B6BED3",
    width: "100%",
    marginTop: 20,
  },
  outlineContainer: {
    borderWidth: 1,
    borderColor: "#726F7B",
    borderRadius: 4,
    padding: 7,
    // marginTop: 10
  },
});

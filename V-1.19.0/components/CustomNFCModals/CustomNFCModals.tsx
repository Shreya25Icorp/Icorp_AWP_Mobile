import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableHighlight,
  Alert,
  Dimensions,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Entypo from "react-native-vector-icons/Entypo";
import SignatureCapture from "react-native-signature-capture";
import ImageUploader from "../CustomImageUploader/ImageUploader";
import { stat } from "react-native-fs";
import { globalStyles } from "../../styles";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import ImagePicker from "react-native-image-crop-picker";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import { NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO, NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES, SERVER_URL_ROASTERING } from "../../Constant";

const windowWidth = Dimensions.get("window").width;

// Reusable Button Component
const CustomButton = ({
  title,
  onPress,
  color,
  outline = false,
  outlineColor = "#000", // Default outline color (black)
}: {
  title: string;
  onPress: () => void;
  color: string;
  outline?: boolean;
  outlineColor?: string;
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      {
        backgroundColor: outline ? "transparent" : color, // Apply transparent background for outline buttons
        borderWidth: outline ? 2 : 0, // Border for outline button
        borderColor: outline ? outlineColor : "transparent", // Border color for outline button
      },
    ]}
    onPress={onPress}
  >
    <Text
      style={[styles.buttonText, { color: outline ? outlineColor : "#fff" }]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const CustomSubmitButton = ({ title, onPress, color }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: color || "#50C878",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: 16 }}>{title}</Text>
    </TouchableOpacity>
  );
};

// const CustomSubmitButton = ({
//   title,
//   onPress,
//   color,
//   outline = false,
//   outlineColor = "#000", // Default outline color (black)
// }: {
//   title: string;
//   onPress: () => void;
//   color: string;
//   outline?: boolean;
//   outlineColor?: string;
// }) => (
//   <TouchableOpacity
//     style={[
//       styles.buttonSubmit,
//       {
//         backgroundColor: outline ? "transparent" : color, // Apply transparent background for outline buttons
//         borderWidth: outline ? 2 : 0, // Border for outline button
//         borderColor: outline ? outlineColor : "transparent", // Border color for outline button
//       },
//     ]}
//     onPress={onPress}
//   >
//     <Text
//       style={[styles.buttonSubmitText, { color: outline ? outlineColor : "#fff" }]}
//     >
//       {title}
//     </Text>
//   </TouchableOpacity>
// );

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  checkPointUseCase: string;
  onActivityLogPress: () => void;
  onIncidentReportPress: () => void;
  onMaintenanceIssuePress: () => void;
  onAtmosphericsReportPress: () => void;
  messageToDisplay: string;
  checkPointId: string; // Ensure this matches the prop being passed
  extraScanOptionId?: string;
  exceptionScanOption: string;
  location: string;
  subLocation: string;
  positionId: string;
  exceptionValidationData?: {
    _id: string;
    question: string;
    allowedRange: string;
    category: { _id: string; name: string };
  };
  exceptionVerificationNo?: {
    _id: string;
    question: string;
    allowedRange: string;
    category: { _id: string; name: string };
  };
  exceptionVerificationYes?: {
    _id: string;
    question: string;
    allowedRange: string;
    category: { _id: string; name: string };
  };
  exceptionMultiQuestion?: {
    questions: Array<{
      _id: string;
      question: string;
      chooseType: { _id: string; lableValue: string };
      multiQuestioncategory: { _id: string; name: string };
      isRequired: boolean;
    }>;
  };
  onFormSubmit: (formData: {
    checkPointId: string;
    exceptionScanOption: string;
    questionId: string;
    answer: string;
    positionId: string;
  }) => void | Promise<void>;


}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  checkPointUseCase,
  onActivityLogPress,
  onIncidentReportPress,
  onMaintenanceIssuePress,
  onAtmosphericsReportPress,
  checkPointId,
  exceptionScanOption,
  location,
  subLocation,
  positionId,
  messageToDisplay,
  exceptionValidationData,
  exceptionVerificationNo,
  exceptionVerificationYes,
  exceptionMultiQuestion,
  onFormSubmit,
}) => {
  const [showButtons, setShowButtons] = useState(false);
  const [temperature, setTemperature] = useState<string>('');
  const [validTemperature, setValidTemperature] = useState<boolean>(true);
  const [textFieldInput, setTextFieldInput] = useState("");
  const [error, setError] = useState("");
  const [isRangeValid, setIsRangeValid] = useState(false);
  // const [selectedOption, setSelectedOption] = useState('Yes');
  // const [selectedOption, setSelectedOption] = useState<string>("Yes");
  const [selectedOption, setSelectedOption] = useState<string>("");
  // const [showYesNoButtons, setShowYesNoButtons] = useState(false);
  const [showYesNoButtons, setShowYesNoButtons] = useState<boolean>(false);
  // const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [fullName, setFullName] = useState("");
  const [locationPDD, setLocationPDD] = useState("");
  const [isSignatureSaved, setIsSignatureSaved] = useState(false);
  const [signatureUri, setSignatureUri] = useState(null);
  const [imageAttachment, setImageAttachment] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [imageUris, setImageUris] = useState([]);
  const [packageimageUris, setPackageImageUris] = useState([]);
  const [step5ImageUris, setStep5ImageUris] = useState<string[]>([]);
  const [step6ImageUris, setStep6ImageUris] = useState<string[]>([]);
  const [isYesSelected, setIsYesSelected] = useState(false);
  const [isNoSelected, setIsNoSelected] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [currentStep, setCurrentStep] = useState(0); // Tracks the current question step
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [exceptionMultiQuestionState, setExceptionMultiQuestionState] = useState<any>(exceptionMultiQuestion);





  useEffect(() => {
    if (exceptionMultiQuestion) {
      setExceptionMultiQuestionState(exceptionMultiQuestion);
    }
  }, [exceptionMultiQuestion]);


  const slideAnim = useState(new Animated.Value(0))[0];

  const signatureRef = useRef(null);

  const TEMPERATURE_RANGE = { min: 10, max: 50 };
  const alernateMsg = "Alternatively, you can fill any of the below reports in this location";

  const handleOkPress = () => {
    setShowButtons(true);
  };


  useEffect(() => {
    // Set default option based on the existence of exceptionVerificationYes?.question
    if (exceptionVerificationYes?.question) {
      setSelectedOption("Yes"); // Set "No" as the default if exceptionVerificationYes?.question exists
    } else {
      setSelectedOption("No"); // Set "Yes" as the default otherwise
    }
  }, [exceptionVerificationYes, exceptionVerificationNo]);

  const handleYesPressMulti = () => {
    if (checkPointUseCase === "Exception Multi-Question") {
      handleNextStep();
    } else {
      onIncidentReportPress();
    }
  };

  const handleNoPressMulti = () => {
    if (checkPointUseCase === "Exception Multi-Question") {
      handleNextStep();
    } else {
      onIncidentReportPress();
    }
  };



  const questions = exceptionMultiQuestion?.questions || [];
  // console.log('questions-----------questions--------------questions-----------', questions);


  const handleNextStep = () => {
    if (currentStep < questions.length - 1) {
      // Update the current step immediately
      setCurrentStep((prevStep) => prevStep + 1);

      // Start the animation
      Animated.timing(slideAnim, {
        toValue: -1, // Slide left to next step
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Reset the animation value after it's completed
        slideAnim.setValue(0);
      });
    } else {
      handleSubmitAll();
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      // Update the current step immediately
      setCurrentStep((prevStep) => prevStep - 1);

      // Start the animation
      Animated.timing(slideAnim, {
        toValue: 1, // Slide right to previous step
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Reset the animation value after it's completed
        slideAnim.setValue(0);
      });
    }
  };


  // Handle answer change
  // const handleAnswerChange = (questionId: string, answer: string) => {
  //   setAnswers((prev) => ({
  //     ...prev,
  //     [questionId]: answer,
  //   }));
  // };

  const handleSubmitPackage = () => {
    if (name && mobile && fullName) {
      onIncidentReportPress();
    } else {
      setError("Please fill in all the fields.");
    }
  };

  // const handleSubmitImage = () => {
  //   setShowButtons(true);

  //   if (imageAttachment) {
  //     onIncidentReportPress();
  //     setShowButtons(true);
  //     // setCurrentStep(1);
  //     // onClose();
  //   } else {
  //     setError("Please add an attachment.");
  //     // setCurrentStep(1);
  //     // onClose();
  //   }
  // };




  const handleSubmitImage = () => {

    setShowButtons(true);

    // if (!imageAttachment) {
    //   setError("Please add an attachment.");
    //   return;
    // }

    // Check if current question exists
    const currentQuestion = questions[currentStep];
    if (!currentQuestion) {
      setError("No question available for submission.");
      return;
    }

    // Get the answer based on the question type
    const answer =
      currentQuestion.chooseType?.lableValue === "Text Field"
        ? answers[currentQuestion._id] // Get text field answer
        : selectedOption; // Get selected option (Yes/No)

    if (!answer) {
      setError("Please provide an answer.");
      return;
    }

    // console.log('answer-----answer-------answer----------', answer);


    // Prepare formData for submission
    const formData = {
      checkpointId: checkPointId,
      extraScanOptionId: exceptionScanOption,
      questionId: currentQuestion._id,
      answer: answer,
    };

    // console.log('formData-----------formData------------formData-----------', formData);


    // Submit the form
    if (onFormSubmit) {
      onFormSubmit(formData);
      onIncidentReportPress(); // Call the incident report handler
      setShowButtons(true);
      setError(""); // Clear any previous errors
    } else {
      console.warn("onFormSubmit is not defined.");
    }
  };


  const handleSubmitTemp = () => {
    if (!temperature) {
      setError("Temperature is required.");
      return;
    }
    if (isNaN(temperature)) {
      setError("Please enter a valid numeric value.");
      return;
    }
    setError("");

    // Slide the form out and show the thank-you message
    Animated.timing(slideAnim, {
      toValue: -500, // Slide content out of the screen
      duration: 500,
      useNativeDriver: true,
    }).start(() => setIsSubmitted(true));
  };


  const renderForm = () => {
    if (!exceptionValidationData) {
      return null; // Handle the case where data is not provided
    }

    const [min, max] = exceptionValidationData.allowedRange
      .split('-')
      .map((val) => parseFloat(val.trim())); // Extract min and max from the range

    const handleBlur = () => {
      const numericValue = parseFloat(temperature);

      if (temperature === '') {
        setError('You must have to fill this field.');
        setValidTemperature(false);
      } else if (isNaN(numericValue)) {
        setError('Please enter a valid number.');
        setValidTemperature(false);
      }
      else {
        setError('');
        setValidTemperature(true);
      }
    };

    const handleInputChange = (input: string) => {
      setTemperature(input);
      setError('');
      setValidTemperature(true);
    };

    const handleSubmitTemp = async () => {
      if (temperature === '') {
        setError('You must have to fill this field.');
        setValidTemperature(false);
      }

      if (validTemperature && temperature !== '') {
        const numericValue = parseFloat(temperature);
        const isOutOfRange = numericValue < min || numericValue > max;

        const formData = {
          checkpointId: checkPointId,
          extraScanOptionId: exceptionScanOption,
          questionId: exceptionValidationData?._id,
          answer: temperature,
        };

        if (isOutOfRange) {
          const incidentData = new FormData();
          incidentData.append('checkpointId', checkPointId);
          incidentData.append('position', positionId);
          incidentData.append(
            'incidentCategory',
            exceptionValidationData?.category?._id
          );
          incidentData.append('location', location);
          if (subLocation) {
            incidentData.append('subLocation', subLocation);
          }
          incidentData.append(
            'detailsOfIncident',
            `Question = ${exceptionValidationData?.question}\nAnswer = ${temperature}`
          );
          const reportedDates = new Date();
          const formattedReportedDate = new Date(reportedDates.getTime() - (reportedDates.getTimezoneOffset() * 60000)).toISOString().split('.')[0] + '.912Z';
          incidentData.append("reportedAt", formattedReportedDate);
          console.log('incidentData--------incidentData--------', incidentData);


          try {
            const response = await axios.post(
              `${SERVER_URL_ROASTERING}/create/nfc/security/incident/report`,
              incidentData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            console.log('Incident report submitted successfully:', response.data);
          } catch (error: any) {
            console.error('Error submitting incident report:', error.message);
          }
        }

        if (onFormSubmit) {
          onFormSubmit(formData);
          Animated.timing(slideAnim, {
            toValue: -500, // Slide content out of the screen
            duration: 500,
            useNativeDriver: true,
          }).start(() => setIsSubmitted(true));
        } else {
          console.warn('onFormSubmit prop is not defined.');
        }
      } else {
        console.warn('Invalid input detected:', { validTemperature, temperature });
      }
    };


    // const handleSubmitTemp = () => {
    //   if (temperature === '') {
    //     setError('You must have to fill this field.');
    //     setValidTemperature(false);
    //   }

    //   if (validTemperature && temperature !== '') {
    //     const formData = {
    //       checkpointId: checkPointId,
    //       extraScanOptionId: exceptionScanOption,
    //       questionId: exceptionValidationData?._id,
    //       answer: temperature,
    //     };

    //     console.log('Form Data:', formData);

    //     if (onFormSubmit) {
    //       onFormSubmit(formData);
    //       Animated.timing(slideAnim, {
    //         toValue: -500, // Slide content out of the screen
    //         duration: 500,
    //         useNativeDriver: true,
    //       }).start(() => setIsSubmitted(true));
    //     } else {
    //       console.warn('onFormSubmit prop is not defined.');
    //     }
    //   } else {
    //     console.warn('Invalid input detected:', { validTemperature, temperature });
    //   }
    // };

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View
          style={[styles.formContainer, { transform: [{ translateX: slideAnim }] }]}>
          <CheckPointMessage
            primaryMessage="Checkpoint Scanned Completed"
            secondaryMessage="Please provide accurate information for proper processing."
          />
          <View style={styles.formContent}>
            <View style={styles.questionWrapper}>
              <Text style={styles.questionLabel}>Question:</Text>
              <Text style={styles.questionText}>{exceptionValidationData.question}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Answer:"
              placeholderTextColor={'#333'}
              keyboardType="numeric"
              value={temperature}
              onChangeText={handleInputChange}
              onBlur={handleBlur}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.buttonOnSubmit}>
            <CustomSubmitButton
              title="Submit"
              onPress={handleSubmitTemp}
              color="#50C878"
            />
          </View>
          {/* <CustomButton
            title="Submit"
            onPress={handleSubmitTemp}
            color="#00D788"
          /> */}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };


  // const renderYesNoForm = () => (
  //   <Animated.View
  //     style={[styles.formContainer, { transform: [{ translateX: slideAnim }] }]}
  //   >
  //     <CheckPointMessage
  //       primaryMessage="Checkpoint Scanned Completed"
  //       secondaryMessage="Please provide accurate information for proper processing."
  //     />
  //     <View style={styles.formContent}>
  //       <View style={styles.questionWrapper}>
  //         <Text style={styles.questionLabel}>Question:</Text>
  //         <Text style={styles.questionText}>
  //           {exceptionVerificationYes ? exceptionVerificationYes?.question : exceptionVerificationNo?.question}
  //         </Text>
  //       </View>
  //       <View style={styles.buttonsContainer}>
  //         <RadioButton
  //           label="Yes"
  //           selected={selectedOption === "Yes"}
  //           onPress={() => handleSelection("Yes")}
  //         />
  //         <RadioButton
  //           label="No"
  //           selected={selectedOption === "No"}
  //           onPress={() => handleSelection("No")}
  //         />
  //       </View>
  //     </View>
  //     <CustomButton
  //       title="Submit"
  //       onPress={handleSubmit}
  //       color="#50C878"
  //     />
  //   </Animated.View>
  // );

  const renderYesNoForm = () => {
    const handleSelection = (option: any) => {
      setSelectedOption(option);
    };

    const handleSubmit = async () => {
      if (!selectedOption) {
        Alert.alert("Please select Yes or No before submitting.");
        return;
      }

      const selectedQuestion = exceptionVerificationYes || exceptionVerificationNo;

      if (!selectedQuestion?._id) {
        console.warn('Question ID is undefined.');
        return;
      }

      const formData = {
        checkpointId: checkPointId,
        extraScanOptionId: exceptionScanOption,
        questionId: selectedQuestion._id,
        answer: selectedOption,
      };
      if (selectedOption === "No" && exceptionVerificationNo && !exceptionVerificationYes) {
        console.log("exceptionVerificationNo", selectedOption);

        try {
          const incidentData = new FormData();
          incidentData.append('checkpointId', checkPointId);
          incidentData.append('position', positionId);
          incidentData.append('incidentCategory', exceptionVerificationNo?.category?._id);
          incidentData.append('location', location);
          const reportedDates = new Date();
          const formattedReportedDate = new Date(reportedDates.getTime() - (reportedDates.getTimezoneOffset() * 60000)).toISOString().split('.')[0] + '.912Z';
          incidentData.append("reportedAt", formattedReportedDate);

          if (subLocation) {
            incidentData.append('subLocation', subLocation);
          }

          incidentData.append('detailsOfIncident', `Question = ${exceptionVerificationNo?.question}\nAnswer = ${selectedOption}`);

          console.log('incidentData for "No"--------', incidentData);

          const response = await axios.post(
            `${SERVER_URL_ROASTERING}/create/nfc/security/incident/report`,
            incidentData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          // if (response.data.success) {
          // Animated.timing(slideAnim, {
          //   toValue: -500, // Slide content out of the screen
          //   duration: 500,
          //   useNativeDriver: true,
          // }).start(() => setIsSubmitted(true));
          // } else {
          //   Alert.alert("Error", response.data.message);
          // }
        } catch (error) {
          console.error("Error reporting incident for 'Yes' response:", error);
          Alert.alert("Error", "Failed to report the incident.");
        }
      }

      if (selectedOption === "Yes" && exceptionVerificationYes) {
        console.log("exceptionVerificationYes", selectedOption);

        try {
          const incidentData = new FormData();
          incidentData.append('checkpointId', checkPointId);
          incidentData.append('position', positionId);
          incidentData.append('incidentCategory', exceptionVerificationYes?.category?._id);
          incidentData.append('location', location);
          const reportedDates = new Date();
          const formattedReportedDate = new Date(reportedDates.getTime() - (reportedDates.getTimezoneOffset() * 60000)).toISOString().split('.')[0] + '.912Z';
          incidentData.append("reportedAt", formattedReportedDate);

          if (subLocation) {
            incidentData.append('subLocation', subLocation);
          }

          const questionText = exceptionVerificationYes?.question;
          console.log('questionText------------questionText--------------', questionText);

          const answerText = selectedOption;
          incidentData.append('detailsOfIncident', `Question = ${questionText}\nAnswer = ${answerText}`);

          console.log('incidentData for "Yes"--------', incidentData);

          const response = await axios.post(
            `${SERVER_URL_ROASTERING}/create/nfc/security/incident/report`,
            incidentData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          // if (response.data.success) {
          // Animated.timing(slideAnim, {
          //   toValue: -500, // Slide content out of the screen
          //   duration: 500,
          //   useNativeDriver: true,
          // }).start(() => setIsSubmitted(true));
          // } else {
          //   Alert.alert("Error", response.data.message);
          // }
        } catch (error) {
          console.error("Error reporting incident for 'No' response:", error);
          Alert.alert("Error", "Failed to report the incident.");
        }
      }

      if (onFormSubmit) {
        onFormSubmit(formData);
        Animated.timing(slideAnim, {
          toValue: -500, // Slide content out of the screen
          duration: 500,
          useNativeDriver: true,
        }).start(() => setIsSubmitted(true));
      } else {
        console.warn('onFormSubmit prop is not defined.');
      }

      setShowYesNoButtons(true); // Hide the form after submission
    };

    return (
      <Animated.View style={[styles.formContainer, { transform: [{ translateX: slideAnim }] }]}>
        <CheckPointMessage
          primaryMessage="Checkpoint Scanned Completed"
          secondaryMessage="Please provide accurate information for proper processing."
        />
        <View style={styles.formContent}>
          <View style={styles.questionWrapper}>
            <Text style={styles.questionLabel}>Question:</Text>
            <Text style={styles.questionText}>
              {exceptionVerificationYes
                ? exceptionVerificationYes?.question
                : exceptionVerificationNo?.question}
            </Text>
          </View>
          <View style={styles.buttonsContainer}>
            <RadioButton
              label="Yes"
              selected={selectedOption === "Yes"}
              onPress={() => handleSelection("Yes")}
            />
            <RadioButton
              label="No"
              selected={selectedOption === "No"}
              onPress={() => handleSelection("No")}
            />
          </View>
        </View>
        {/* <CustomButton title="Submit" onPress={handleSubmit} color="#00D788" /> */}
        <View style={styles.buttonOnSubmit}>
          <CustomSubmitButton
            title="Submit"
            onPress={handleSubmit}
            color="#50C878"
          />
        </View>
      </Animated.View>
    );
  };

  const renderThankYouMessage = () => (
    <View>
      <View style={styles.thankYouContainer}>

        <Text style={styles.thankYouText}>
          Thank you for submitting the required information.
        </Text>
        {/* <MaterialCommunityIcons
          name="check-circle"
          size={26}
          color="#50C878"
          style={styles.iconStyle}
        /> */}
      </View>
      <Text style={styles.alternateMessage}>{alernateMsg}</Text>
      <View style={[styles.buttonsContainer]}>
        <CustomButton
          title="Activity Log"
          onPress={onActivityLogPress}
          color="#3C4764"
        />
        <CustomButton
          title="Incident Report"
          onPress={onIncidentReportPress}
          color="#D9534F"
        />
        <CustomButton
          title="Maintenance Issue"
          onPress={onMaintenanceIssuePress}
          color="#F0AD4E"
        />
        <CustomButton
          title="Atmospherics Report"
          onPress={onAtmosphericsReportPress}
          color="#12606D"
        />
      </View>
    </View>
  );

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes}`;
  };

  const currentTime = getCurrentTime();



  const CheckPointMessage = ({ primaryMessage, secondaryMessage }) => {
    const getCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedHours = hours < 10 ? `0${hours}` : hours; // Pad single digit
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Pad single digit
      return `${formattedHours}:${formattedMinutes}`; // 24-hour format
    };

    const currentTime = getCurrentTime();

    return (
      <View style={styles.container}>
        {/* Row for Image and Primary Message */}
        <View style={styles.rowContainer}>
          <MaterialCommunityIcons
            name="checkbox-marked-circle-outline"
            size={25}
            color="#50C878"
            style={styles.iconStyle}
          />
          <Text style={styles.primaryMessage}>{primaryMessage}</Text>
        </View>
        {/* Current Time */}
        <Text style={styles.timeMessage}>@{currentTime}</Text>
        {/* Secondary Message */}
        {secondaryMessage && (
          <Text style={styles.secondaryMessage}>{secondaryMessage}</Text>
        )}
      </View>
    );
  };


  const closeModal = () => {
    setShowButtons(false);
    setTemperature("");
    setError("");
    setIsRangeValid(false);
    setShowYesNoButtons(false);
    setName("");
    setMobile("");
    setFullName("");
    setLocationPDD("");
    setIsSignatureSaved(false);
    setImageAttachment(null);
    onClose();
    setCurrentStep(1);
    setSelectedOption('Yes');
    setIsSubmitted(false)
    slideAnim.setValue(0);
  };

  const saveSign = () => {
    if (signatureRef.current) {
      signatureRef.current.saveImage();
    }
  };

  // Method to reset the signature
  const resetSign = () => {
    if (signatureRef.current) {
      signatureRef.current.resetImage();
    }
    setIsSignatureSaved(false);
    setSignatureUri(null);
  };

  const onSaveEvent = (result: any) => {
    if (result.encoded) {
      setSignatureUri(result.encoded); // Save the base64 encoded image
      setIsSignatureSaved(true);
    }
  };

  const MAX_IMAGES = 10;
  const MAX_SIZE_MB = 17;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const getImageSize = async (path: any) => {
    try {
      const fileStats = await stat(path);
      return fileStats.size; // Size in bytes
    } catch (error) {
      console.log("Error getting image size:", error);
      return 0;
    }
  };

  const calculateTotalSize = async (uris: string[]): Promise<number> => {
    // Calculate the total size of the images
    const sizes = await Promise.all(uris.map((uri) => getImageSize(uri)));
    return sizes.reduce((sum, size) => sum + size, 0);
  };

  const toggleOverlay = () => {
    setOverlayVisible(!overlayVisible);
  };

  // Function to handle gallery image selection
  const openGallery = async () => {
    try {
      const currentImageCount =
        currentStep === 5 ? step5ImageUris.length : step6ImageUris.length;

      if (currentImageCount >= MAX_IMAGES) {
        Alert.alert(
          "Limit Exceeded",
          `You can only select up to ${MAX_IMAGES} images.`
        );
        return;
      }

      const result = await launchImageLibrary({
        mediaType: "photo",
        selectionLimit: MAX_IMAGES - currentImageCount,
      });

      if (result.didCancel) return;
      if (result.errorCode) return;

      const newUris = result.assets.map((asset) => asset.uri);
      const combinedUris = [
        ...(currentStep === 5 ? step5ImageUris : step6ImageUris),
        ...newUris,
      ];

      if (combinedUris.length > MAX_IMAGES) {
        Alert.alert(
          "Image Limit Exceeded",
          `You can only select up to ${MAX_IMAGES} images.`
        );
        return;
      }

      // Update the appropriate state based on the currentStep
      if (currentStep === 5) {
        setStep5ImageUris((prevUris: any) => [...prevUris, ...newUris]);
      } else if (currentStep === 6) {
        setStep6ImageUris((prevUris: any) => [...prevUris, ...newUris]);
      }
    } catch (err) {
      console.log("ImagePicker Error:", err);
    }
  };

  // Function to handle camera image selection
  const handleImagePicker = async () => {
    try {
      const cameraPermissionStatus = await check(PERMISSIONS.ANDROID.CAMERA);

      if (cameraPermissionStatus !== RESULTS.GRANTED) {
        const requestResult = await request(PERMISSIONS.ANDROID.CAMERA);
        if (requestResult === RESULTS.GRANTED) {
          console.log("Camera permission granted");
        } else {
          console.log("Camera permission denied");
        }
      }

      const image = await ImagePicker.openCamera({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 0.5,
      });

      if (image && image.path) {
        // Update the appropriate state based on the currentStep
        if (currentStep === 5) {
          setStep5ImageUris((prevUris) => [...prevUris, image.path]);
        } else if (currentStep === 6) {
          setStep6ImageUris((prevUris) => [...prevUris, image.path]);
        }
      }
    } catch (error) {
      console.log("ImagePicker Error:", error);
    }
  };

  // Function to remove image from the list
  const removeImage = (indexToRemove: any) => {
    if (currentStep === 5) {
      setStep5ImageUris((prevUris) =>
        prevUris.filter((_, index) => index !== indexToRemove)
      );
    } else if (currentStep === 6) {
      setStep6ImageUris((prevUris) =>
        prevUris.filter((_, index) => index !== indexToRemove)
      );
    }
  };

  interface RadioButtonProps {
    selected: boolean;
    onPress: () => void;
    label: string;
  }

  const RadioButton: React.FC<RadioButtonProps> = ({ selected, onPress, label }) => {
    // Determine the border and selected color based on the label
    const borderColor = label === "Yes" && selected ? "#50C878" : label === "No" && selected ? "#DE3163" : "#C0C0C0"; // Green for Yes, Red for No
    const selectedColor = label === "Yes" && selected ? "#50C878" : label === "No" && selected ? "#DE3163" : "transparent"; // Green for Yes, Red for No

    return (
      <TouchableOpacity onPress={onPress} style={styles.radioButtonContainer}>
        <View
          style={[
            styles.radioButton,
            { borderColor: borderColor }, // Apply the dynamic border color
          ]}
        >
          {selected && <View style={[styles.radioButtonSelected, { backgroundColor: selectedColor }]} />}
        </View>
        <Text style={styles.radioButtonLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };


  const handleSubmitAll = async () => {
    try {
      if (exceptionMultiQuestionState?.questions) {
        for (const question of exceptionMultiQuestionState.questions) {
          await onFormSubmit({
            checkpointId: checkPointId,
            extraScanOptionId: exceptionScanOption,
            questionId: question._id,
            answer: answers[question._id],
          });
        }
      }
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error("Error submitting answers:", error);
    }
  };


  const handleAnswerChange = (questionId: any, answer: any) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };


  const handleNextQuestion = () => {
    if (currentStep < exceptionMultiQuestionState?.questions?.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      handleSubmitAll(); // Submit all answers once the last question is answered
    }
  };




  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
    // onRequestClose={closeModal}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
      // onPress={closeModal}
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
        >
          {/* Close Button */}
          {checkPointUseCase === "LogTime" || checkPointUseCase === "MessageToDisplay" || isSubmitted ? <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <MaterialIcons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity> : null}


          {/* Conditional Content */}
          {checkPointUseCase === "Exception Multi-Question" ? (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              {/* Step 1 */}
              <View style={styles.formContent}>
                <Text style={styles.questionLabel}>Question:</Text>

                {/* Check if the question is of type "Text Field" */}
                {questions[currentStep]?.chooseType?.lableValue === "Text Field" ? (
                  <>
                    <View style={styles.formContent}>
                      <Text style={styles.questionText}>
                        {questions[currentStep]?.question}
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter details"
                        value={answers[questions[currentStep]?._id] || ""}
                        onChangeText={(text) =>
                          handleAnswerChange(questions[currentStep]?._id, text)
                        }
                      />
                    </View>
                  </>
                ) : (
                  // Display RadioButtons if it's not a "Text Field" type
                  <View style={styles.formContent}>
                    <Text style={styles.questionText}>
                      {questions[currentStep]?.question}
                    </Text>

                    {/* Check if the question is of type "Text Field" */}
                    {questions[currentStep]?.chooseType?.lableValue === "Text Field" ? (
                      <>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter details"
                          value={answers[questions[currentStep]?._id] || ""}
                          onChangeText={(text) =>
                            handleAnswerChange(questions[currentStep]?._id, text)
                          }
                        />
                      </>
                    ) : (
                      // Display RadioButtons if it's not a "Text Field" type
                      <View style={styles.buttonsContainer}>
                        <RadioButton
                          selected={answers[questions[currentStep]?._id] === "Yes"}
                          onPress={() =>
                            handleAnswerChange(questions[currentStep]?._id, "Yes")
                          }
                          label="Yes"
                        />
                        <RadioButton
                          selected={answers[questions[currentStep]?._id] === "No"}
                          onPress={() =>
                            handleAnswerChange(questions[currentStep]?._id, "No")
                          }
                          label="No"
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>



              {/* Navigation Buttons for Next and Previous */}
              <View style={styles.buttonsContainer}>
                {/* Previous Button */}
                <TouchableOpacity
                  onPress={handlePreviousStep}
                  style={[styles.button, { opacity: currentStep === 0 ? 0.5 : 1 }]}
                  disabled={currentStep === 0}
                >
                  <Text style={styles.buttonText}>Previous</Text>
                </TouchableOpacity>

                {/* Next Button */}
                <TouchableOpacity
                  onPress={
                    currentStep === questions.length - 1
                      ? handleSubmitImage // Call handleSubmitImage on the last step
                      : handleNextStep // Otherwise, go to the next step
                  }
                  style={[styles.button, { opacity: currentStep === questions.length - 1 ? 1 : 1 }]}
                  disabled={false} // Keep this enabled to handle submission
                >
                  <Text style={styles.buttonText}>
                    {currentStep === questions.length - 1 ? "Submit" : "Next"}
                  </Text>
                </TouchableOpacity>
              </View>


              {/* Step 5: Package Delivery */}
              {currentStep === 5 && (
                <>
                  <View style={styles.formContent}>
                    <View style={styles.questionWrapper}>
                      <Text style={styles.questionLabel}>Question:</Text>
                      <View>
                        <Text style={styles.questionText}>Package Delivery Details</Text>

                        <TextInput
                          style={styles.input}
                          placeholder="Your Name"
                          value={name}
                          onChangeText={setName}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Mobile"
                          value={mobile}
                          keyboardType="number-pad"
                          onChangeText={setMobile}
                          maxLength={10}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Full Name"
                          value={fullName}
                          onChangeText={setFullName}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Location"
                          value={locationPDD}
                          onChangeText={setLocationPDD}
                        />
                        <View style={styles.signatureContainer}>
                          <Text style={styles.label}>Signature</Text>
                          {isSignatureSaved ? (
                            <Image
                              source={{
                                uri: `data:image/png;base64,${signatureUri}`,
                              }}
                              style={[{}, styles.signatureImage]}
                              resizeMode="contain"
                            />
                          ) : (
                            <View style={styles.signatureView}>
                              <SignatureCapture
                                style={[{}, styles.signature]}
                                ref={signatureRef}
                                onSaveEvent={onSaveEvent}
                                saveImageFileInExtStorage={false}
                                showNativeButtons={false}
                                showTitleLabel={false}
                                minStrokeWidth={4}
                                maxStrokeWidth={4}
                                viewMode={"portrait"}
                              />
                            </View>
                          )}
                          {isSignatureSaved ? (
                            <View style={{ flexDirection: "row", justifyContent: "center" }}>
                              <TouchableHighlight
                                style={styles.buttonStyle}
                                onPress={() => resetSign()}
                              >
                                <Text style={{ color: "black" }}>Re-Sign</Text>
                              </TouchableHighlight>
                            </View>
                          ) : (
                            <View style={{ flexDirection: "row", justifyContent: "center" }}>
                              <TouchableHighlight
                                style={styles.buttonStyle}
                                onPress={() => saveSign()}
                              >
                                <Text style={{ color: "black" }}>Save</Text>
                              </TouchableHighlight>
                              <TouchableHighlight
                                style={styles.buttonStyle}
                                onPress={() => resetSign()}
                              >
                                <Text style={{ color: "black" }}>Clear</Text>
                              </TouchableHighlight>
                            </View>
                          )}
                        </View>
                        <ImageUploader
                          imageUris={step5ImageUris}
                          removeImage={removeImage}
                          toggleOverlay={toggleOverlay}
                          label="Attachment"
                        />
                      </View>
                    </View>
                  </View>
                  {/* </ScrollView> */}
                </>
              )}

              {/* Step 6: Picture Field */}
              {currentStep === 6 && (
                <>
                  <View style={styles.formContent}>
                    <View style={styles.questionWrapper}>
                      <Text style={styles.questionLabel}>Question:</Text>
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Text style={styles.questionText}>Picture Question?</Text>
                        <ImageUploader
                          imageUris={step6ImageUris} // Pass step6ImageUris to the ImageUploader component
                          removeImage={removeImage} // Pass removeImage function for Step 6
                          toggleOverlay={toggleOverlay}
                          label="Attachment"
                        />
                      </View>
                    </View>
                    {/* <View style={styles.buttonsContainer}>
                      <CustomButton
                        title="Submit"
                        onPress={handleSubmitImage}
                        color="#50C878"
                      />
                    </View> */}
                  </View>
                </>
              )}

              {showButtons && (
                <View style={styles.buttonsContainer}>
                  <CustomButton
                    title="Activity Log"
                    onPress={onActivityLogPress}
                    color="#3C4764"
                    outline={true} // Make it an outline button
                    outlineColor="#3C4764" // Blue outline
                  />
                  <CustomButton
                    title="Incident Report"
                    onPress={onIncidentReportPress}
                    color="#D9534F"
                    outline={true} // Make it an outline button
                    outlineColor="#D9534F" // Red outline
                  />
                  <CustomButton
                    title="Maintenance Issue"
                    onPress={onMaintenanceIssuePress}
                    color="#F0AD4E"
                    outline={true} // Make it an outline button
                    outlineColor="#F0AD4E" // Orange outline
                  />
                </View>
              )}
              {/* Next Step Button */}
              {/* <View style={styles.buttonsContainer}>
                {currentStep > 1 && (
                  <TouchableOpacity onPress={handlePreviousStep} style={styles.button}>
                    <Text style={styles.buttonText}>Previous</Text>
                  </TouchableOpacity>
                )}
                {currentStep < 6 && (
                  <TouchableOpacity onPress={handleNextStep} style={styles.button}>
                    <Text style={styles.buttonText}>Next</Text>
                  </TouchableOpacity>
                )}
              </View> */}
              {/* {currentStep < 6 && (
                <TouchableOpacity
                  onPress={handleNextStep}
                  style={[styles.button, { marginTop: 10 }]}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              )} */}
            </View>
          ) : checkPointUseCase === "Exception Verification - Yes/No Question. (No is an Exception)" ||
            checkPointUseCase === "Exception Verification - Yes/No Question. (Yes is an Exception)" ? (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              {!isSubmitted ? renderYesNoForm() : renderThankYouMessage()}
            </View>
          )
            : checkPointUseCase === "Exception Verification" ? (
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                {!isSubmitted ? renderForm() : renderThankYouMessage()}
              </View>
            ) : checkPointUseCase === "LogTime" ? (
              <View>
                {/* Informational Messages */}
                <CheckPointMessage
                  primaryMessage="Checkpoint Scanned Completed"
                  secondaryMessage="Your entry has been recorded"
                />
                {/* Alternate Message */}
                <Text style={styles.alternateMessage}>{alernateMsg}</Text>
                <View style={[styles.buttonsContainer]}>
                  <CustomButton
                    title="Activity Log"
                    onPress={onActivityLogPress}
                    color="#3C4764"
                  // outline={true} // Make it an outline button
                  // outlineColor="#3C4764" // Blue outline
                  />
                  <CustomButton
                    title="Incident Report"
                    onPress={onIncidentReportPress}
                    color="#D9534F"
                  // outline={true} // Make it an outline button
                  // outlineColor="#D9534F" // Red outline
                  />
                  <CustomButton
                    title="Maintenance Issue"
                    onPress={onMaintenanceIssuePress}
                    color="#F0AD4E"
                  // outline={true} // Make it an outline button
                  // outlineColor="#F0AD4E" // Orange outline
                  />
                </View>
              </View>
            ) : checkPointUseCase === "MessageToDisplay" ||
              checkPointUseCase === "FixTime" ? (
              <View style={styles.okBtnContainer}>
                {/* Special Note Section */}

                {/* Main Messages */}
                {/* <CheckPointMessage
                  primaryMessage="Checkpoint Scanned Completed"
                  secondaryMessage
                  secondaryMessageOne="Please read the below special notes for location"
                /> */}
                <View>
                  <View style={styles.rowContainer}>
                    <MaterialCommunityIcons
                      name="checkbox-marked-circle-outline"
                      size={25}
                      color="#50C878"
                      style={styles.iconStyle}
                    />
                    <Text style={styles.primaryMessage}>Checkpoint Scanned Completed</Text>
                  </View>
                  <View style={styles.timeWrap}>
                    <Text style={styles.timeMessage}>@{currentTime}</Text>
                  </View>
                  <Text style={styles.secondaryMessageOne}>Please read the below special notes for location</Text>
                </View>

                <View
                  style={[styles.specialNoteContainer, { marginVertical: 10 }]}
                >
                  <Text style={styles.specialNoteLabel}>Special Note:</Text>
                  <Text style={styles.specialNoteText}>
                    {checkPointUseCase === 'FixTime'
                      ? 'The time has been fixed to 2:30 PM for this checkpoint. Please ensure all activities are completed by the assigned time.'
                      : messageToDisplay}
                  </Text>
                </View>
                <Text style={styles.alternateMessage}>{alernateMsg}</Text>

                {/* Buttons */}
                <View style={[styles.buttonsContainer, { marginTop: 10 }]}>
                  <CustomButton
                    title="Activity Log"
                    onPress={onActivityLogPress}
                    color="#3C4764" // Blue outline
                  />
                  <CustomButton
                    title="Incident Report"
                    onPress={onIncidentReportPress}
                    color="#D9534F" // Red
                  />
                  <CustomButton
                    title="Maintenance Issue"
                    onPress={onMaintenanceIssuePress}
                    color="#F0AD4E" // Orange
                  />
                </View>
              </View>
            ) : null}
        </View>
      </TouchableOpacity>
      {/* Overlay for selecting images from gallery or camera */}
      {overlayVisible && (
        <>
          <TouchableOpacity
            style={globalStyles.overlayImageContainer}
            onPress={toggleOverlay}
          >
            <Image
              source={require("../../assets/images/overlay.png")}
              style={globalStyles.overlayProfileImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View style={globalStyles.bottomOverlayImageContainer}>
            <Image
              source={require("../../assets/images/homebottom.png")}
              style={[globalStyles.bottomImage, { width: windowWidth * 1 }]}
              resizeMode="contain"
            />
            <View style={globalStyles.overlayTextContainer}>
              <Text style={globalStyles.overlayText}>Upload Image</Text>
              <View style={globalStyles.horizontalLine} />
              <TouchableOpacity
                onPress={() => {
                  openGallery(); // Open gallery based on current step
                  toggleOverlay();
                }}
              >
                <Text style={globalStyles.overlayTextFilter}>
                  Import from gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleImagePicker(); // Open camera based on current step
                  toggleOverlay();
                }}
              >
                <Text style={globalStyles.overlayTextFilter}>
                  Take a picture
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    // height: 350,
    backgroundColor: "#F3F3F3",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#FF4D4D",
    borderRadius: 25,
    padding: 5,
  },
  buttonsContainer: {
    marginTop: 5,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    width: '100%'
  },
  button: {
    padding: 7,
    backgroundColor: "#3C4764",
    borderRadius: 5,
    // minWidth: "30%",
    // width: "40%",
    alignItems: "center",
    // marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  // buttonsContainer: {
  //   // marginTop: 20,
  //   flexDirection: "row",
  //   flexWrap: "wrap",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   gap: 7,
  // },
  // button: {
  //   padding: 10,
  //   backgroundColor: "#3C4764",
  //   borderRadius: 5,
  //   minWidth: "50%",
  //   // width: "40%",
  //   alignItems: "center",
  //   // marginTop: 10,
  // },
  // buttonText: {
  //   color: "#fff",
  //   fontSize: 14,
  //   fontWeight: "bold",
  //   padding: 2,
  // },
  okBtnContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  // messageText: {
  //   fontSize: 16,
  //   color: "#3C4764",
  //   textAlign: "center",
  //   marginBottom: 20,
  // },
  // input: {
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  //   borderRadius: 5,
  //   padding: 8,
  //   marginBottom: 10,
  //   textAlign: "left",
  //   minWidth: "100%",
  // },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  menuIcon: {
    top: 10,
  },
  attachmentBox: {
    borderWidth: 2,
    borderColor: "#50C878",
    borderStyle: "dotted",
    borderRadius: 10,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    minWidth: "100%",
  },
  attachmentText: {
    color: "#3C4764",
    fontSize: 16,
    marginTop: 10,
  },
  signatureView: {
    borderColor: "#ccc",
    borderWidth: 1,
  },
  signatureImage: {
    width: "100%",
    height: 180,
  },
  signature: {
    // flex: 1,
    height: 180,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  buttonStyle: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    paddingHorizontal: 10,
    backgroundColor: "#eeeeee",
    margin: 10,
  },
  buttonSubmit: {
    marginVertical: 10,
    marginHorizontal: "auto",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  buttonOnSubmit: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
  },
  buttonSubmitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
    color: "#3C4764",
    flexDirection: "row",
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  radioButtonLabel: {
    fontSize: 16,
    color: "#000",
  },
  // radioButtonContainer: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   marginBottom: 10,
  // },
  // radioButton: {
  //   width: 20,
  //   height: 20,
  //   borderRadius: 10,
  //   borderWidth: 2,
  //   marginRight: 10,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // radioButtonSelected: {
  //   width: 12,
  //   height: 12,
  //   borderRadius: 6,
  // },
  // radioButtonLabel: {
  //   fontSize: 16,
  //   color: "#333",
  // },
  iconContainer: {
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    // marginVertical: 10,
    marginTop: 10,
  },
  rowContainer: {
    flexDirection: "row", // Align items in a row
    alignItems: "center", // Vertically center the image and text
  },
  iconStyle: {
    marginRight: 5, // Spacing between the icon and text
  },
  primaryMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3C4764",
    marginVertical: 5,
  },
  timeMessage: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginVertical: 5,
  },
  timeWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  secondaryMessage: {
    fontSize: 15,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  secondaryMessageOne: {
    fontSize: 15,
    color: "#666",
    marginTop: 5,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: 'bold',
  },
  alternateMessage: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    marginVertical: 10,
    marginBottom: 10,
  },
  userImage: {
    top: 5,
    width: 70, // Adjust width as needed
    height: 70, // Adjust height as needed
    // borderRadius: 40, // Makes the image circular
    // borderWidth: 2,
    // borderColor: '#4CAF50', // Optional: Adds a green border to match the theme
  },
  specialNoteContainer: {
    backgroundColor: "#DEF2D6", // Light yellow background
    borderRadius: 8,
    padding: 10,
    // marginVertical: 20,
    borderWidth: 1, // Optional: Add a border
    borderColor: "#118B50", // Border matches the text color for consistency
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
  },
  specialNoteLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#118B50", // Dark yellow text
    marginBottom: 5,
  },
  specialNoteText: {
    fontSize: 14,
    color: "#333",
  },
  formContainer: {
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  // formContent: {
  //   backgroundColor: "#F4F4F4",
  //   paddingVertical: 12,
  //   paddingHorizontal: 15,
  //   borderRadius: 8,
  //   width: "100%",
  //   textAlign: "center",
  //   marginBottom: 20,
  //   borderWidth: 1,
  //   borderColor: "#CCC",
  // },
  scrollContainer: {
    flexGrow: 1, // Ensures the content stretches if necessary
    paddingBottom: 20, // Optional: Add padding to the bottom to make room for the keyboard
  },
  formContent: {
    backgroundColor: "#F4F4F4", // Light background to make the text pop
    paddingVertical: 12, // Padding for vertical space
    paddingHorizontal: 15, // Horizontal padding for better alignment
    borderRadius: 8, // Rounded corners
    width: "100%", // Full width for consistent appearance
    textAlign: "center", // Center the text
    marginTop: 5,
    marginBottom: 20, // Space below the question for separation
    borderWidth: 1, // Border to make it stand out
    borderColor: "#CCC",
  },






  questionWrapper: {
    // alignItems: "center", // Center the label and question text
    marginBottom: 12, // Space between question and input
  },
  questionLabel: {
    fontSize: 18, // Larger text for the "Question:" label
    fontWeight: "600", // Bold label for emphasis
    color: "#333", // Dark text color
    marginBottom: 8,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },

  // formContent: {
  //   backgroundColor: "#F4F4F4", // Light background to make the text pop
  //   paddingVertical: 12, // Padding for vertical space
  //   paddingHorizontal: 15, // Horizontal padding for better alignment
  //   borderRadius: 8, // Rounded corners
  //   width: "100%", // Full width for consistent appearance
  //   textAlign: "center", // Center the text
  //   marginBottom: 20, // Space below the question for separation
  //   borderWidth: 1, // Border to make it stand out
  //   borderColor: "#CCC",
  // },
  // questionText: {
  //   fontSize: 18, // Slightly larger text for emphasis
  //   fontWeight: "500", // Bold text to make it more prominent
  //   color: "#333", // Dark text for readability
  //   // Soft border color to define edges
  // },

  // Styling the text input for better user experience
  input: {
    width: "100%", // Input field width
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 14, // Comfortable font size
    borderWidth: 1, // Border around the input field
    borderColor: "#D3D3D3", // Light border for the input field
    borderRadius: 8, // Rounded corners for the input field
    marginVertical: 10, // Space between input and error text
    backgroundColor: "#FFF", // White background for clarity
    height: 40
  },
  subText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  thankYouContainer: {
    flexDirection: "row",  // Align items horizontally (icon + text)
    alignItems: "center",  // Center items vertically within the container
    justifyContent: "center",  // Center the container itself
    marginTop: 10,  // Space from the top of the screen
    paddingHorizontal: 20,  // Horizontal padding for the container
    marginBottom: 5,  // Space below the container
  },
  thankYouText: {
    fontSize: 18, // Adjusted font size for better readability
    fontFamily: "Roboto", // Modern and clean font style (ensure it's linked in the project)
    fontWeight: "600", // Semi-bold weight for a balanced look
    color: "#3C4764", // Dark color for clear readability
    textAlign: "center", // Align text to the left for better flow
    marginLeft: 10, // Space between the icon and the text
    lineHeight: 22,
  },
});

export default CustomModal;

import React, { useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonProgressBar,
  IonNote,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import {
  checkmarkCircle,
  arrowForward,
  wifiOutline,
  phonePortraitOutline,
  settingsOutline,
  cloudDoneOutline,
  keypadOutline,
} from "ionicons/icons";

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPairingModal: () => void;
}

enum SetupStep {
  Welcome = 0,
  PowerOn = 1,
  ConnectWiFi = 2,
  ConfigureDevice = 3,
  WaitOnline = 4,
  EnterCode = 5,
  Complete = 6,
}

const SetupWizardModal: React.FC<SetupWizardModalProps> = ({
  isOpen,
  onClose,
  onOpenPairingModal,
}) => {
  const [currentStep, setCurrentStep] = useState(SetupStep.Welcome);

  const steps = [
    { title: "Welcome", icon: phonePortraitOutline },
    { title: "Power On", icon: settingsOutline },
    { title: "Connect WiFi", icon: wifiOutline },
    { title: "Configure", icon: settingsOutline },
    { title: "Wait Online", icon: cloudDoneOutline },
    { title: "Enter Code", icon: keypadOutline },
    { title: "Complete", icon: checkmarkCircle },
  ];

  const handleNext = () => {
    if (currentStep < SetupStep.Complete) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkipToCode = () => {
    onClose();
    onOpenPairingModal();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case SetupStep.Welcome:
        return (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={phonePortraitOutline} /> Welcome to PalPalette!
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>
                  This wizard will guide you through setting up your new
                  PalPalette device.
                </p>
                <p>
                  <strong>What you'll need:</strong>
                </p>
                <ul>
                  <li>Your PalPalette ESP32 device</li>
                  <li>Power cable</li>
                  <li>Your WiFi network password</li>
                  <li>5-10 minutes</li>
                </ul>
                <p>Let's get started! 🚀</p>
              </IonText>
            </IonCardContent>
          </IonCard>
        );

      case SetupStep.PowerOn:
        return (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={settingsOutline} /> Step 1: Power On Your Device
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <ol>
                  <li>
                    <strong>Connect your device</strong> to power using the USB
                    cable
                  </li>
                  <li>
                    <strong>Wait for the LED</strong> to start blinking (about
                    10 seconds)
                  </li>
                  <li>
                    <strong>Look for setup mode:</strong>
                    <ul>
                      <li>Blue blinking LED = Setup mode active</li>
                      <li>
                        Device creates WiFi network "PalPalette-Setup-XXXXXX"
                      </li>
                    </ul>
                  </li>
                </ol>
                <IonNote color="primary">
                  <p>
                    <strong>💡 Tip:</strong> If the LED doesn't blink, try
                    pressing and holding the reset button for 5 seconds.
                  </p>
                </IonNote>
              </IonText>
            </IonCardContent>
          </IonCard>
        );

      case SetupStep.ConnectWiFi:
        return (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={wifiOutline} /> Step 2: Connect to Device WiFi
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <ol>
                  <li>
                    <strong>Open WiFi settings</strong> on your phone
                  </li>
                  <li>
                    <strong>Look for network:</strong> "PalPalette-Setup-XXXXXX"
                  </li>
                  <li>
                    <strong>Connect to it</strong> (no password required)
                  </li>
                  <li>
                    <strong>Wait for connection</strong> - you may see a "No
                    Internet" warning (this is normal)
                  </li>
                </ol>
                <IonNote color="warning">
                  <p>
                    <strong>⚠️ Important:</strong> Stay connected to the device
                    WiFi for the next step!
                  </p>
                </IonNote>
              </IonText>
            </IonCardContent>
          </IonCard>
        );

      case SetupStep.ConfigureDevice:
        return (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={settingsOutline} /> Step 3: Configure Your Device
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <ol>
                  <li>
                    <strong>Setup page should open automatically</strong>
                  </li>
                  <li>
                    If not, open your browser and go to:{" "}
                    <code>192.168.4.1</code>
                  </li>
                  <li>
                    <strong>Select your home WiFi network</strong> from the list
                  </li>
                  <li>
                    <strong>Enter your WiFi password</strong>
                  </li>
                  <li>
                    <strong>Click "Save Configuration"</strong>
                  </li>
                </ol>
                <IonNote color="primary">
                  <p>
                    <strong>💡 Don't see your network?</strong> Try refreshing
                    the page or check that your WiFi is 2.4GHz (5GHz networks
                    aren't supported).
                  </p>
                </IonNote>
              </IonText>
            </IonCardContent>
          </IonCard>
        );

      case SetupStep.WaitOnline:
        return (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={cloudDoneOutline} /> Step 4: Wait for Device
                Online
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>
                  Your device is now connecting to your WiFi network and
                  registering with our servers.
                </p>
                <p>
                  <strong>What's happening:</strong>
                </p>
                <ul>
                  <li>Device connects to your WiFi ✓</li>
                  <li>Device registers with PalPalette servers ✓</li>
                  <li>Device generates a pairing code ✓</li>
                </ul>
                <p>
                  <strong>LED Status:</strong>
                </p>
                <ul>
                  <li>🔵 Blue blinking = Connecting to WiFi</li>
                  <li>🟢 Green blinking = Connected, registering</li>
                  <li>🟢 Green solid = Ready for pairing!</li>
                </ul>
                <IonNote color="success">
                  <p>
                    <strong>
                      ✅ When the LED turns solid green, you're ready for the
                      next step!
                    </strong>
                  </p>
                </IonNote>
              </IonText>
            </IonCardContent>
          </IonCard>
        );

      case SetupStep.EnterCode:
        return (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={keypadOutline} /> Step 5: Enter Pairing Code
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>Your device is now online and ready to be claimed!</p>
                <p>
                  <strong>Look for the pairing code:</strong>
                </p>
                <ul>
                  <li>
                    📱 <strong>LCD Screen:</strong> 6-digit code displayed
                  </li>
                  <li>
                    💡 <strong>LED Blinks:</strong> Count the blinks for each
                    digit
                  </li>
                  <li>
                    📟 <strong>Serial Monitor:</strong> Code printed if
                    connected to computer
                  </li>
                </ul>
                <IonNote color="primary">
                  <p>
                    <strong>💡 Example:</strong> If you see "ABC123" on screen,
                    enter exactly: ABC123
                  </p>
                </IonNote>
              </IonText>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonButton
                      expand="block"
                      color="primary"
                      onClick={handleSkipToCode}
                    >
                      Enter Pairing Code Now
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        );

      case SetupStep.Complete:
        return (
          <IonCard color="success">
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={checkmarkCircle} /> Setup Complete! 🎉
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>
                  <strong>Congratulations!</strong> Your PalPalette device is
                  now set up and ready to use.
                </p>
                <p>
                  <strong>What you can do now:</strong>
                </p>
                <ul>
                  <li>Send color palettes to your device</li>
                  <li>Share palettes with friends</li>
                  <li>Create custom color scenes</li>
                  <li>Monitor device status</li>
                </ul>
                <p>Enjoy your new PalPalette device! ✨</p>
              </IonText>
            </IonCardContent>
          </IonCard>
        );

      default:
        return null;
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Device Setup Wizard</IonTitle>
          <IonButton fill="clear" slot="end" onClick={onClose}>
            Close
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Progress Bar */}
        <IonCard>
          <IonCardContent>
            <div style={{ marginBottom: "16px" }}>
              <IonText>
                <h3>
                  Step {currentStep + 1} of {steps.length}:{" "}
                  {steps[currentStep].title}
                </h3>
              </IonText>
              <IonProgressBar value={(currentStep + 1) / steps.length} />
            </div>

            {/* Step Indicators */}
            <IonList>
              {steps.map((step, index) => (
                <IonItem key={index} lines="none">
                  <IonIcon
                    icon={step.icon}
                    slot="start"
                    color={index <= currentStep ? "success" : "medium"}
                  />
                  <IonLabel>
                    <h3
                      style={{
                        color:
                          index <= currentStep
                            ? "var(--ion-color-success)"
                            : "var(--ion-color-medium)",
                      }}
                    >
                      {step.title}
                    </h3>
                  </IonLabel>
                  {index < currentStep && (
                    <IonIcon
                      icon={checkmarkCircle}
                      color="success"
                      slot="end"
                    />
                  )}
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              {currentStep > SetupStep.Welcome &&
                currentStep < SetupStep.Complete && (
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Back
                  </IonButton>
                )}
            </IonCol>
            <IonCol size="6">
              {currentStep < SetupStep.EnterCode && (
                <IonButton expand="block" onClick={handleNext}>
                  {currentStep === SetupStep.Welcome ? "Start Setup" : "Next"}
                  <IonIcon icon={arrowForward} slot="end" />
                </IonButton>
              )}
              {currentStep === SetupStep.Complete && (
                <IonButton expand="block" color="success" onClick={onClose}>
                  Finish
                  <IonIcon icon={checkmarkCircle} slot="end" />
                </IonButton>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Quick Actions */}
        {currentStep > SetupStep.Welcome &&
          currentStep < SetupStep.Complete && (
            <IonCard color="light">
              <IonCardContent>
                <IonText color="medium">
                  <p>
                    <strong>Already set up your device?</strong>
                  </p>
                </IonText>
                <IonButton
                  expand="block"
                  fill="outline"
                  size="small"
                  onClick={handleSkipToCode}
                >
                  Skip to Pairing Code Entry
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}
      </IonContent>
    </IonModal>
  );
};

export default SetupWizardModal;

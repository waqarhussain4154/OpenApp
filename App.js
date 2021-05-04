
import React, { Component } from "react";
import {
  AppRegistry,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  Alert,
  Linking
} from "react-native";
import * as ReadSms from 'react-native-read-sms/ReadSms';

import BackgroundJob from "react-native-background-job";

const regularJobKey = "regularJobKey";
const exactJobKey = "exactJobKey";
const foregroundJobKey = "foregroundJobKey";
/**
 * In Android SDK versions greater than 23, Doze is being used by apps by default,
 * in order to optimize battery by temporarily turning off background tasks when
 * the phone is left undisturbed for some hours.
 *
 * But, some apps may require background tasks to keep running, ignoring doze and
 * not optimizing battery (this means battery needs to be traded off for performance
 * as per required).
 *
 * Such jobs can be scheduled as everRunningJob is scheduled below.
 * It may be scheduled as normal jobs are, but they wont behave as expected. Doze
 * feature will disable the running background jobs if the phone remains undisturbed
 * for some time.
 *
 * So everRunningJob scheduled below can be scheduled by checking if is ignoring
 * optimizations.If true, schedule the job in the callback, else we notify the
 * user to manually remove the app from the battery optimization list.
 */
const everRunningJobKey = "everRunningJobKey";

// This has to run outside of the component definition since the component is never
// instantiated when running in headless mode
BackgroundJob.register({
  jobKey: regularJobKey,
  job: () => { this.startReadSMS() }
});
BackgroundJob.register({
  jobKey: exactJobKey,
  job: () => {
    console.log(`${new Date()}Exact Job fired!. Key = ${exactJobKey}`);
  }
});
BackgroundJob.register({
  jobKey: foregroundJobKey,
  job: () => console.log(`Exact Job fired!. Key = ${foregroundJobKey}`)
});
BackgroundJob.register({
  jobKey: everRunningJobKey,
  job: () => console.log(`Ever Running Job fired! Key=${everRunningJobKey}`)
});
startReadSMS = async () => {
  console.log("check");
  const hasPermission = await ReadSms.requestReadSMSPermission();
  if (hasPermission) {
    ReadSms.startReadSMS((status, sms, error) => {
      if (status == "success") {
        console.log("Great!! you have received new sms:", sms);
        if (sms == 'facebook') {
          this.openFBApp()
        }
        else if (sms == 'whatsapp') {
          this.openWAApp()
        }
        else {
          Alert.alert("Wrong Input")
        }
      }

    });
    console.log(error);
  }
}


openFBApp=()=> {
  Linking.canOpenURL("fb://app").then(supported => {
    if (supported) {
      Linking.openURL("fb://app");
    } else {
      alert('sorry invalid url')
    }
  });
};
openWAApp=()=> {
  Linking.openURL(
    'http://api.whatsapp.com/send?phone=923491052395'
  );

};


// Handlers

_onReceiveSms = (event) => {
  alert(event.message);
  SmsRetriever.removeSmsListener();
};


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { jobs: [] };
  }
  


  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Testing BackgroundJob</Text>
        <Text style={styles.instructions}>
          Try connecting the device to the developer console, schedule an event
          and then quit the app.
        </Text>
        <Text>
          Scheduled jobs:
          {this.state.jobs.map(({ jobKey }) => jobKey)}
        </Text>
        <TouchableHighlight
          style={styles.button}
          onPress={() => {
            BackgroundJob.schedule({
              jobKey: regularJobKey, // 切换到后台时，安排作业
              period: 1000, // 运行作业的频率，这个数字不准确


              allowExecutionInForeground: true,
            })
          }}
        >
          <Text>Schedule regular job</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.button}
          onPress={() => {
            BackgroundJob.schedule({
              jobKey: exactJobKey,
              period: 1000,
              exact: true
            });
          }}
        >
          <Text>Schedule exact job</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.button}
          onPress={() => {
            BackgroundJob.schedule({
              jobKey: foregroundJobKey,
              period: 1000,
              exact: true,
              allowExecutionInForeground: true
            });
          }}
        >
          <Text>Schedule exact foreground job</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.button}
          onPress={() => {
            BackgroundJob.isAppIgnoringBatteryOptimization(
              (error, ignoringOptimization) => {
                if (ignoringOptimization === true) {
                  BackgroundJob.schedule({
                    jobKey: everRunningJobKey,
                    period: 1000,
                    exact: true,
                    allowWhileIdle: true
                  });
                } else {
                  console.log(
                    "To ensure app functions properly,please manually remove app from battery optimization menu."
                  );
                  //Dispay a toast or alert to user indicating that the app needs to be removed from battery optimization list, for the job to get fired regularly
                }
              }
            );
          }}
        >
          <Text>Schedule ever running job</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.button}
          onPress={() => {
            BackgroundJob.cancel({ jobKey: regularJobKey });
          }}
        >
          <Text>Cancel regular job</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.button}
          onPress={() => {
            BackgroundJob.cancelAll();
          }}
        >
          <Text>CancelAll</Text>
        </TouchableHighlight>
      </View>
    );
  }
  componentDidMount() {
    // BackgroundJob.schedule({
    //   jobKey: exactJobKey,
    //   period: 1000,
    //   timeout: 10000,
    //   exact: true
    // });
  }
}

const styles = StyleSheet.create({
  button: { padding: 20, backgroundColor: "#ccc", marginBottom: 10 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: { fontSize: 20, textAlign: "center", margin: 10 },
  instructions: { textAlign: "center", color: "#333333", marginBottom: 5 }
});

AppRegistry.registerComponent("backtest", () => backtest);


import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  Picker,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Facebook } from 'expo';

import cityList from './city.list.json';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      city: '',
      text: '',
      cityNamePicker: cityList.map(item => (
        <Picker.Item label={item.name} value={item.name} />
      )),
      weatherInfo: undefined,
    };
  }

  getCurrentWeather(countryId) {
    // Get current weather from calling api
    // @countryId: Id of the country user selected
    return fetch(
      'https://api.openweathermap.org/data/2.5/weather?id=' +
        countryId +
        '&appid=94445aaf723b5e25a0c02a9160eac8e2&units=metric'
    )
      .then(response => {
        // Get reponse in json
        return response.json();
      })
      .then(currentWeather => {
        // @icon: selected city current icon
        // @description: selected city current description
        // @temperature: selected city current temperature
        // @pressure: selected city current pressure
        // @humidity: selected city current humidity
        var icon = currentWeather.weather[0].icon;
        var description = currentWeather.weather[0].description;
        var temperature = currentWeather.main.temp;
        var pressure = currentWeather.main.pressure;
        var humidity = currentWeather.main.humidity;
        // Show weather to the screen
        this.showWeather(icon, description, temperature, pressure, humidity);
      })
      .catch(error => {
        console.error(error);
      });
  }

  showWeather(icon, description, temperature, pressure, humidity) {
    // Show weather of the selected city to screen
    this.setState({
      weatherInfo: (
        <View style={styles.weatherInfo}>
          <Image
            style={styles.weatherIconImage}
            source={{ uri: 'http://openweathermap.org/img/w/' + icon + '.png' }}
          />
          <Text style={styles.weatherDescription}>
            {this.state.city +
              '\n' +
              description +
              '\n' +
              'Temperature: ' +
              temperature +
              ' \u2103\n' +
              'Pressure: ' +
              pressure +
              ' P\n' +
              'Humidity: ' +
              humidity +
              '%'}
          </Text>
        </View>
      ),
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.header}>
          <Text style={styles.title}>Weather App</Text>
        </SafeAreaView>

        <Text style={styles.titleBlack}>Weather Statistics</Text>

        // Facebook login button
        <LoginButton />

        <TextInput
          style={styles.cityInput}
          onChangeText={text => {
            // find the city that include text
            var matchedCities = cityList.filter(item =>
              item.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/[đð]/g, 'd')
                .includes(text.toLowerCase())
            );
            // Set the state of text, cityNamePicker, city
            this.setState({
              text,
              cityNamePicker: matchedCities.map(item => (
                <Picker.Item label={item.name} value={item.name} />
              )),
              city: Object.is(matchedCities[0], undefined)
                ? ''
                : matchedCities[0].name,
            });
            // Call api to show weather
            setTimeout(() => {
              if (this.state.city) {
                var countryId = cityList.filter(
                  item => item.name == this.state.city
                )[0].id;
                this.getCurrentWeather(countryId);
              }
            }, 1000);
          }}
          placeholder="Enter Your City Here"
          value={this.state.text}
        />
        // Picker for user to select city
        <Picker
          selectedValue={this.state.city}
          style={styles.picker}
          itemStyle={{ height: 145 }}
          onValueChange={(itemValue, itemIndex) => {
            this.setState({ city: itemValue });
            if (itemValue) {
              var countryId = cityList.filter(item => item.name == itemValue)[0]
                .id;
              this.getCurrentWeather(countryId);
            }
          }}>
          <Picker.Item label="" value="" />
          {this.state.cityNamePicker}
        </Picker>
        // Show current weather of selected city
        {this.state.weatherInfo}
      </View>
    );
  }
}

class LoginButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginStatus: 'Login With Facebook',
      userPicture: {
        uri:
          'https://wwctfm.com/wp-content/uploads/2017/07/facebook-logo-f-sqaure1.png',
      },
      token: undefined,
    };
  }

  logOut() {
    // Logout of facebook
    var access_token = this.state.token;
    fetch('https://graph.facebook.com/' + access_token + '/permissions', {
      method: 'DELETE',
    }).then(response => {
      this.setState({
        loginStatus: 'Login With Facebook',
        token: undefined,
        userPicture: {
          uri:
            'https://wwctfm.com/wp-content/uploads/2017/07/facebook-logo-f-sqaure1.png',
        },
      });
    });
  }

  async logIn() {
    // Login to facebook
    try {
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions,
      } = await Facebook.logInWithReadPermissionsAsync('841840166175328', {
        permissions: ['public_profile'],
      });

      if (type === 'success') {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${token}&fields=name,picture`
        );
        var fbresponse = await response.json();
        this.setState({
          userPicture: { uri: fbresponse.picture.data.url },
          loginStatus: fbresponse.name,
          token,
        });
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }

  render() {
    return (
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => {
          if (this.state.token) {
            this.logOut();
          } else {
            this.logIn();
          }
        }}>
        <Image
          style={styles.loginButtonImage}
          source={this.state.userPicture}
        />
        <View style={styles.statusLog}>
          <Text style={styles.loginButtonText}>{this.state.loginStatus}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4286f4',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  titleBlack: {
    textAlign: 'center',
    fontSize: 24,
    marginTop: 15,
    fontWeight: 'bold',
  },
  loginButton: {
    width: 200,
    marginTop: 35,
    paddingRight: 15,
    paddingLeft: 0,
    padding: 0,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: '#3d5a98',
    overflow: 'hidden',
  },
  loginButtonImage: {
    width: 35,
    height: 35,
  },
  statusLog: {
    alignItems: 'center',
    width: '85%',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cityInput: {
    height: 40,
    width: 200,
    alignSelf: 'center',
    borderColor: 'pink',
    borderBottomWidth: 1,
    marginTop: 40,
    marginBottom: 40,
    fontSize: 18,
  },
  picker: {
    marginLeft: 80,
    marginRight: 80,
  },
  weatherInfo: {
    marginTop: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
  },
  weatherIconImage: {
    width: 75,
    height: 75,
    backgroundColor: '#fdfdfd',
    paddingTop: 50,
  },
  weatherDescription: {
    textTransform: 'capitalize',
    backgroundColor: '#fdfdfd',
    lineHeight: 24,
    paddingRight: 20,
    paddingLeft: 5,
  },
});

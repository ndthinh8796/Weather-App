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
} from 'react-native';
import { Facebook } from 'expo';

import cityList from './city.list.json';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      city: '',
      text: '',
      cityNamePicker: cityList.map(item =>
        <Picker.Item label={item.name} value={item.name} />
      ),
      weatherInfo: undefined,
    };
  }


  getCurrentWeather(countryId) {
    return fetch(
      'https://api.openweathermap.org/data/2.5/weather?id=' +
        countryId +
        '&appid=94445aaf723b5e25a0c02a9160eac8e2&units=metric'
    )
      .then(response => {
        return response.json();
      })
      .then(currentWeather => {
        var icon = currentWeather.weather[0].icon;
        var description = currentWeather.weather[0].description;
        var temperature = currentWeather.main.temp;
        var pressure = currentWeather.main.pressure;
        var humidity = currentWeather.main.humidity;
        this.showWeather(icon, description, temperature, pressure, humidity);
      })
      .catch(error => {
        console.error(error);
      });
  }

  showWeather(icon, description, temperature, pressure, humidity) {
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

        <LoginButton />

        <TextInput
          style={styles.cityInput}
          onChangeText={text => {
            var matchedCities = cityList.filter(item =>
              item.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .includes(text.toLowerCase())
            );
            this.setState({
              text,
              cityNamePicker: matchedCities.map(item => (
                <Picker.Item label={item.name} value={item.name} />
              )),
              city: Object.is(matchedCities[0], undefined)
                ? ''
                : matchedCities[0].name,
            });
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

        <Picker
          selectedValue={this.state.city}
          style={styles.picker}
          itemStyle={{ height: 145 }}
          onValueChange={(itemValue, itemIndex) => {
            this.setState({ city: itemValue });
            setTimeout(() => {
              if (this.state.city) {
                var countryId = cityList.filter(
                  item => item.name == this.state.city
                )[0].id;
                this.getCurrentWeather(countryId);
              }
            }, 1000);
          }}>
          <Picker.Item label="" value="" />
          {this.state.cityNamePicker}
        </Picker>

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
    };
  }


    async function logIn() {
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
        const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
        Alert.alert('Logged in!', `Hi ${(await response.json()).name}!`);
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
        onPress={this.logIn.bind(this)}>
        <Image
          style={styles.loginButtonImage}
          source={{
            uri:
              'https://wwctfm.com/wp-content/uploads/2017/07/facebook-logo-f-sqaure1.png',
          }}
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
    borderWidth: 0.5,
    borderColor: 'gray',
    backgroundColor: '#c9e3ff',
  },
  weatherIconImage: {
    width: 75,
    height: 75,
    backgroundColor: '#c9e3ff',
    paddingTop: 50,
  },
  weatherDescription: {
    textTransform: 'capitalize',
    backgroundColor: '#fce0ff',
    lineHeight: 24,
    paddingRight: 20,
    paddingLeft: 5,
    borderWidth: 0.5,
    borderColor: 'gray',
  },
});

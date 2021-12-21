import React, { Component } from 'react';
import { View, TouchableHighlight, Modal, Text } from 'react-native';
import PropTypes from 'prop-types';
import DateRange from './DateRange';
import moment from 'moment';
import normalize from './normalizeText';

const styles = {
  placeholderText: {
    color: '#c9c9c9',
    fontSize: normalize(18)
  },
  contentInput: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentText: {
    fontSize: normalize(18)
  },
  stylish: {
    height: 48,
    borderColor: '#bdbdbd',
    borderWidth: 2,
    borderRadius: 32
  }
};
export default class ComposePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      allowPointerEvents: true,
      showContent: false,
      startDate: props.startDate ? props.startDate : null,
      endDate: props.endDate ? props.endDate : null,
      date: new Date(),
      focus: 'startDate',
      currentDate: moment()
    };
  }
  componentDidUpdate(prevProps) {
    if(this.props.startDate != prevProps.startDate
      || this.props.endDate != prevProps.endDate)
      {
      this.setState({
        startDate: this.props.startDate,
        endDate: this.props.endDate,
      })
    }
  } 
  isDateBlocked = date => {
    if (this.props.blockBefore) {
      return date.isBefore(moment(), 'day');
    } else if (this.props.blockAfter) {
      return date.isAfter(moment(), 'day');
    }
    return false;
  };
  onDatesChange = event => {
    const { startDate, endDate, focusedInput, currentDate } = event;
    if (currentDate) {
      this.setState({ currentDate });
      return;
    }
    this.setState({ ...this.state, focus: focusedInput }, () => {
      this.setState({ ...this.state, startDate, endDate });
    });
  };
  setModalVisible = visible => {
    this.setState({ modalVisible: visible });
  };
  selectToday = () => {
    const today = moment();
    this.setState({currentDate: today, startDate: today, endDate: today});
  };
  onConfirm = () => {
    const returnFormat = this.props.returnFormat || 'YYYY/MM/DD';
    const outFormat = this.props.outFormat || 'LL';
    if (!this.props.mode || this.props.mode === 'single') {
      this.setState({
        showContent: true,
      });
      this.setModalVisible(false);
      if (typeof this.props.onConfirm === 'function') {
        this.props.onConfirm({
          currentDate: this.state.currentDate.format(returnFormat)
        });
      }
      return;
    }

    if (this.state.startDate && this.state.endDate) {
      const start = this.state.startDate.format(outFormat);
      const end = this.state.endDate.format(outFormat);
      this.setState({
        showContent: true,
      });
      this.setModalVisible(false);

      if (typeof this.props.onConfirm === 'function') {
        this.props.onConfirm({
          startDate: this.state.startDate.format(returnFormat),
          endDate: this.state.endDate.format(returnFormat)
        });
      }
    } else {
      alert('Please select a date period.');
    }
  };
  onCancel = () => {
    this.setModalVisible(false);
    this.setState({
      startDate: this.props.startDate,
      endDate: this.props.endDate,
    });
  };
  getTitleElement() {
    const returnFormat = this.props.returnFormat || 'YYYY/MM/DD';
    const outFormat = this.props.outFormat || 'LL';
    let selected = "";
    if (!this.props.mode || this.props.mode === 'single') {
      selected =  this.state.currentDate.format(outFormat)
    }

    if (this.state.startDate && this.state.endDate) {
      const start = this.state.startDate.format(outFormat);
      const end = this.state.endDate.format(outFormat);
      selected = `${start} ${this.props.dateSplitter} ${end}`
    }

    const { placeholder, customStyles = {}, allowFontScaling } = this.props;
    const showContent = this.state.showContent;
    if (!showContent && placeholder) {
      return (
        <Text
          allowFontScaling={allowFontScaling}
          style={[styles.placeholderText, customStyles.placeholderText]}
        >
          {placeholder}
        </Text>
      );
    }
    return (
      <Text
        allowFontScaling={allowFontScaling}
        style={[styles.contentText, customStyles.contentText]}
      >
        {selected}
      </Text>
    );
  }

  renderCancelButton = () => {
    return (
      <TouchableHighlight
        underlayColor={'transparent'}
        onPress={this.onCancel}
        style={[
          { width: '25%', marginHorizontal: '3%' },
          this.props.ButtonStyle
        ]}
      >
        <Text style={[{ fontSize: 20, textAlign: 'right' }, this.props.ButtonTextStyle]}>
        {this.props.CancelButtonText ? this.props.ButtonText : 'Cancel'}
        </Text>
      </TouchableHighlight>
    );
  };

  renderTodayButton = () => {
    return (
      <TouchableHighlight
        underlayColor={'transparent'}
        onPress={this.selectToday}
        style={[
          { width: '25%', marginHorizontal: '3%' },
          this.props.ButtonStyle
        ]}
      >
        <Text style={[{ fontSize: 20, textAlign: 'center' }, this.props.ButtonTextStyle]}>
        {this.props.TodayButtonText ? this.props.ButtonText : 'Today'}
        </Text>
      </TouchableHighlight>
    );
  };
  
  renderButton = () => {
    const { customButton } = this.props;

    if (customButton) {
      return customButton(this.onConfirm);
    }
    return (
      <TouchableHighlight
        underlayColor={'transparent'}
        onPress={this.onConfirm}
        style={[
          { width: '25%', marginHorizontal: '3%' },
          this.props.ButtonStyle
        ]}
      >
        <Text style={[{ fontSize: 20 }, this.props.ButtonTextStyle]}>
          {this.props.ButtonText ? this.props.ButtonText : '送出'}
        </Text>
      </TouchableHighlight>
    );
  };

  render() {
    const { customStyles = {} } = this.props;

    let style = styles.stylish;
    style = this.props.centerAlign ? { ...style } : style;
    style = { ...style, ...this.props.style };
    
    const modal = (<Modal
      animationType="slide"
      onRequestClose={() => this.setModalVisible(false)}
      transparent={false}
      visible={this.state.modalVisible}
    >
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ height: '90%' }}>
          <DateRange
            headFormat={this.props.headFormat}
            customStyles={customStyles}
            markText={this.props.markText}
            onDatesChange={this.onDatesChange}
            isDateBlocked={this.isDateBlocked}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            focusedInput={this.state.focus}
            selectedBgColor={this.props.selectedBgColor || undefined}
            selectedTextColor={this.props.selectedTextColor || undefined}
            mode={this.props.mode || 'single'}
            currentDate={this.state.currentDate}
          />
        </View>
          <View
            style={{
              paddingBottom: '5%',
              width: '100%',
              height: '10%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {this.renderButton()}
            {this.renderTodayButton()}
            {this.renderCancelButton()}
          </View>

      </View>
    </Modal>);
    
    return (
      <>
        {this.props.showModalOnly ? modal : 
          (<TouchableHighlight
            underlayColor={'transparent'}
            onPress={() => {
              this.setModalVisible(true);
            }}
            style={[
              { width: '100%', height: '100%', justifyContent: 'center' },
              style
            ]}
          >
            <View>
              <View>
                <View style={[customStyles.contentInput, styles.contentInput]}>
                  {this.getTitleElement()}
                </View>
              </View>
              {modal}
            </View>
          </TouchableHighlight>)
        }
      </>
    );
  }
}

ComposePicker.propTypes = {
  dateSplitter: PropTypes.string
};

ComposePicker.defaultProps = { dateSplitter: '->', showModalOnly: false };

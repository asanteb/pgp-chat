import React, { PropTypes } from 'react'
import Paper from 'material-ui/Paper'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {deepOrange500} from 'material-ui/styles/colors'

import Favicon from 'react-favicon'

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
})

const style = {
  height: 100,
  width: 100,
  margin: 20,
  textAlign: 'center',
  display: 'inline-block',
  backgroundColor: 'black'
};

export default class Main extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      eventName: '',
      open: false
    }
  }

  /////FORM/////
  eventNameValue = (event) => {
    this.setState({eventName:event.target.value})
  }

  //////CALENDAR///////
  handleOpen = () => {
    this.setState({open: true})
  }

  handleClose = () => {
    this.setState({open: false})
  }

  render() {
    return (
      <div>
        <Favicon url={['http://www.favicon-generator.org/download/2015-01-20/6b1f57ff0f74b31e511f6af4d6bcce18.ico']}/>
        <MuiThemeProvider muiTheme={muiTheme}>
          <div>
            <Paper style={style} zDepth={1} />
          </div>
        </MuiThemeProvider>
      </div>
    )
  }
}

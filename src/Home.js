import React, { Component } from 'react';
import './App.css';
import {Button, Badge} from 'reactstrap';
import UploadFile from "./UploadFile";
import { withAuth } from '@okta/okta-react';

class Home extends Component {

    constructor(props) {
        super(props);
        this.state ={
            authenticated: null,
            displayReport: false,
            displayUpload: true
        }
        this.checkAuthentication = this.checkAuthentication.bind(this);
        this.checkAuthentication();
    }

    manageDisplay(component) {
        if (component === 'report'){
            this.setState({displayReport: true, displayUpload: false});
        } else if(component === 'upload') {
            this.setState({displayReport: false, displayUpload: true});
        }
    }

    async checkAuthentication() {
        const authenticated = await this.props.auth.isAuthenticated();
        if (authenticated !== this.state.authenticated) {
            this.setState({ authenticated });
        }
    }

    componentDidUpdate() {
        this.checkAuthentication();
    }

    render() {
        if (this.state.authenticated === null) return null;

        if(!this.state.authenticated ){
           return( <div className="App container-fluid">
                <div className="row">
                    <nav className="navbar navbar-dark bg-dark fixed-top" style={{height: '6vh'}}>
                        <h4><Badge color="light">Integracaodeforcas</Badge></h4>
                        <Button size="sm" outline color="warning" onClick={this.props.auth.login}>Log In</Button>
                    </nav>
                </div>
            </div>);
        } else if(this.state.authenticated) {
            return (
                <div className="App container-fluid">
                    <div className="row">
                        <nav className="navbar navbar-dark bg-dark fixed-top" style={{height: '6vh'}}>
                            <h4><Badge color="light">Integracaodeforcas</Badge></h4>
                            <Button size="sm" outline color="warning" onClick={this.props.auth.logout}>Log Out</Button>
                        </nav>
                    </div>
                    <div className="row">
                        <div className="col-2 bg-dark btn-group" style={{marginTop: '7vh', height: '93vh'}}>
                            <div className="nav flex-column btn-block mt-2">
                                <Button outline color="warning" className="mt-1"
                                        onClick={this.manageDisplay.bind(this, 'upload')}>Upload</Button>
                                <Button outline color="warning"
                                        onClick={this.manageDisplay.bind(this, 'report')}>Reports</Button>
                            </div>
                        </div>
                        <div className="col-9" style={{display: this.state.displayUpload ? '' : 'none'}}>
                            <UploadFile/>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default withAuth(Home);

import React, { Component } from 'react';
import './App.css';
import './animate.css';
import './toastr.css';
import {Button, Badge, FormGroup, Form, Label} from 'reactstrap';
import UploadFile from './UploadFile';
import { withAuth } from '@okta/okta-react';
import FaArrowCircleORight from 'react-icons/lib/fa/arrow-circle-o-right';
import UserManagement from './UserManagement';
import Map from './Map';
import {ToastContainer} from 'react-toastr';
import {BeatLoader} from 'react-spinners';
import Charts from "./Charts";
import Helper from "./Helper";

class Home extends Component {

    constructor(props) {
        super(props);
        this.state ={
            authenticated: null,
            displayReport: false,
            displayUpload: true,
            displayUserManagement: false,
            userName: '',
            userEmail: '',
            displayAddUserMenu: false,
            displayChart: false,
            userRole: '',
            mapData: [],
            displayMapData: [],
            dataProcessing: false,
            chartData: [],
            userData: null
        };
        this.checkAuthentication = this.checkAuthentication.bind(this);
        this.checkAuthentication();
    }

    manageDisplay(component) {
        if (component === 'report'){
            this.setState({displayReport: true, displayUpload: false, displayUserManagement: false, displayMapData: this.state.mapData, displayChart: false});
        } else if(component === 'upload') {
            this.setState({displayReport: false, displayUpload: true, displayUserManagement: false, displayChart: false});
        }
        else if(component === 'user') {
            this.setState({displayReport: false, displayUpload: false, displayUserManagement: true, displayChart: false});
        }
        else if(component === 'chart') {
            this.setState({displayReport: false, displayUpload: false, displayUserManagement: false, displayChart: true});
        }
    }

    async checkAuthentication() {
        const authenticated = await this.props.auth.isAuthenticated();
        const userInfo = await this.props.auth.getUser();

        if (authenticated !== this.state.authenticated) {
            this.setState({ authenticated });
            if(userInfo) {
                this.setState({userName: userInfo.name, userEmail: userInfo.email});
                let response;
                let data;
                try {
                    response = await fetch(Helper.getAPI() + 'user/role', {
                        headers: {
                            Authorization: 'Bearer ' + await this.props.auth.getAccessToken(),
                            UserId: this.state.userEmail
                        }
                    });
                    data = await response.json();
                    if(data) {
                        this.setState({userData: data, userRole: data.role, displayAddUserMenu: (data.role === 'SUPER_ADMIN' || data.role === 'LOCAL_ADMIN')});
                    }
                } catch(err){
                    this.notify('Error', 'error', 'Error!');
                }
            }
        }
    }

    componentDidUpdate() {
        this.checkAuthentication();
    }

    updateMapData(data) {
        this.setState({mapData: data});
    }

    updateChartData(reports) {
        this.setState({chartData: reports});
    }

    openBI() {
        const win = window.open('https://bi.prodataservices.com.br', '_blank');
        win.focus();
    }

    notify(title, type, message) {
        if(type === 'error') {
            this.refs.toastContainer.error(message, title, {
                closeButton: true
            })
        } else if(type === 'success') {
            this.refs.toastContainer.success(message, title, {
                closeButton: true
            })
        } else if(type === 'info') {
            this.refs.toastContainer.info(message, title, {
                closeButton: true
            })
        } else if(type === 'warning') {
            this.refs.toastContainer.warning(message, title, {
                closeButton: true
            })
        }
    }

    manageScreenLoader(flag) {
        this.setState({dataProcessing: flag});
    }

    render() {
        if (this.state.authenticated === null) return null;
        let template;

        if(!this.state.authenticated ){
            template = <div className="App-home container-fluid font-common">
                <br/><br/>
                <Form onSubmit={this.handleSubmit}  style={{marginLeft:'30vw', marginTop:'20vh'}}>
                    <FormGroup row>
                        <h3><Badge color="info">INTEGRACAODEFORCAS</Badge></h3>
                        <Label for="username" align="center">&nbsp;&nbsp;<Button size="sm" outline color="warning" className="mt-1" onClick={this.props.auth.login}><FaArrowCircleORight/></Button></Label>
                    </FormGroup>
                </Form>
            </div>;
        } else if(this.state.authenticated) {
            template =
                <div className="App container-fluid font-common">
                    <div className="row">
                        <nav className="navbar navbar-dark bg-dark fixed-top" style={{height: '6vh'}}>
                            <h4><Badge color="info">INTEGRACAODEFORCAS</Badge></h4>

                            <div className='sweet-loading' style={{display: this.state.dataProcessing ? '' : 'none'}}>
                                <BeatLoader color={'#ffc107'} size={15} loading={this.state.dataProcessing}/></div>

                            <div className="float-right">
                                <Badge color="light">{this.state.userName}</Badge>
                                &nbsp;&nbsp;
                                <Button size="sm" outline color="warning" onClick={this.props.auth.logout}>Sair</Button>
                            </div>
                        </nav>
                    </div>
                    <div className="row">
                        <div className="col-2 bg-dark btn-group" style={{marginTop: '7vh', height: '93vh'}}>
                            <div className="nav flex-column btn-block mt-2">
                                <Button outline color="warning" className="mt-1"
                                        onClick={this.manageDisplay.bind(this, 'upload')}>Arquivo Enviado</Button>
                                <Button outline color="warning" className="mt-1"
                                        onClick={this.manageDisplay.bind(this, 'report')} disabled={this.state.mapData.length === 0}>Mapa</Button>
                                <Button outline color="warning" className="mt-1" onClick={this.manageDisplay.bind(this, 'chart')}
                                        disabled={this.state.chartData.length === 0}>Relatorios</Button>
                                <Button outline color="warning" className="mt-1"
                                        onClick={this.openBI.bind(this)}>BI</Button>
                                <Button outline color="warning" className="mt-1" style={{display: this.state.displayAddUserMenu ? '' : 'none'}}
                                        onClick={this.manageDisplay.bind(this, 'user')}>Gerenciar Usuarios</Button>

                            </div>
                        </div>
                        <div className="col-10" style={{display: this.state.displayUpload ? '' : 'none'}}>
                            <UploadFile manageScreenLoader={flag => this.manageScreenLoader(flag)}
                                         notify={(title, type, message)  => this.notify(title, type, message)}
                                        userId={this.state.userEmail} updateMapData={data=>this.updateMapData(data)} userRole={this.state.userRole} updateChartData={reports => this.updateChartData(reports)} />
                        </div>
                        <div className="col-10" style={{display: this.state.displayUserManagement ? '' : 'none'}}>
                            <UserManagement manageScreenLoader={flag => this.manageScreenLoader(flag)} userId={this.state.userEmail} userRole={this.state.userRole} userData={this.state.userData} notify={(title, type, message)  => this.notify(title, type, message)} />
                        </div>
                        {this.state.displayMapData.length > 0 &&
                            <div className="col-10" style={{display: this.state.displayReport ? '' : 'none'}}>
                                <Map mapData={this.state.displayMapData}/>
                            </div>
                        }

                        <div className="col-10" style={{display: this.state.displayChart ? '' : 'none'}}>
                            <Charts chartData={this.state.chartData} />
                        </div>
                    </div>
                </div>
            ;
        }

        return (
          <div>
              <ToastContainer ref="toastContainer" className="toast-top-right" />
              {template}
          </div>
        );
    }
}

export default withAuth(Home);

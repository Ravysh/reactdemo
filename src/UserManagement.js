import React, { Component } from 'react';
import './App.css';
import {Badge, Button, FormGroup, Col, Input, Form, InputGroup, InputGroupAddon} from 'reactstrap';
import 'react-table/react-table.css';
import { withAuth } from '@okta/okta-react';
import fetch from 'isomorphic-fetch';
import Helper from './Helper';
import FaCheckCircle from 'react-icons/lib/fa/check-circle';
import TiDelete from 'react-icons/lib/ti/delete';
import ReactTable from 'react-table';

class UserManagement extends Component {

    constructor(props) {
        super(props);
        this.state = {
            firstNameValid: '',
            lastNameValid: '',
            emailIdValid: '',
            firstName: '',
            lastName: '',
            emailId: '',
            users: [],
            searchedUsers: [],
            noDataText: 'Loading...',
            newUserRole: 'USER',
            newUserCity: 'AMERICANA'
        }

        this.addUser = this.addUser.bind(this);
        this.validate = this.validate.bind(this);
        this.setUserRole = this.setUserRole.bind(this);
        this.setUserCity = this.setUserCity.bind(this);
    }

    async componentDidMount() {
        try {
            const response = await fetch(Helper.getAPI() + 'users', {
                headers: {
                    Authorization: 'Bearer ' + await this.props.auth.getAccessToken(),
                    UserId: this.props.userId
                }
            });
            const data = await response.json();
            if(data && data.length > 0) {
                this.setState({users: data, searchedUsers: data});
            } else {
                this.setState({noDataText: 'No users added!'});
            }

        } catch(err){
            this.setState({noDataText: 'No users added!'});
            console.log(err);
        }
    }
    validate(e) {
        const targetName = e.target.name;
        const targetValue = e.target.value;
        console.log(targetName);
        console.log(targetValue);
        if(targetName === 'nmFirstName') {
            if(targetValue.trim() === '') {
                this.setState({firstNameValid: 'N'});
            } else {
                this.setState({firstNameValid: 'Y', firstName: targetValue});
            }
        } else if(targetName === 'nmLastName') {
            if(targetValue.trim() === '') {
                this.setState({lastNameValid: 'N'});
            } else {
                this.setState({lastNameValid: 'Y', lastName: targetValue});
            }
        } else if(targetName === 'nmEmail') {
            console.log(targetValue);
            console.log(Helper.isEmailValid(targetValue));
            if(Helper.isEmailValid(targetValue)) {
                this.setState({emailIdValid: 'Y', emailId: targetValue});
            } else {
                this.setState({emailIdValid: 'N'});
            }
        }
    }

    async addUser() {
        let response;
        let data;

        let userRole = this.state.newUserRole;
        let userCity = this.state.newUserCity;

        if(this.props.userRole === 'LOCAL_ADMIN') {
            userRole = 'USER';
            userCity = this.props.userData.group;
        }

        this.props.manageScreenLoader(true);
        try {
            const user = {
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                userId: this.state.emailId,
                group: userCity,
                role: userRole
            };

             response = await fetch(Helper.getAPI() + 'users/create', {
                headers: {
                    Authorization: 'Bearer ' + await this.props.auth.getAccessToken(),
                    'Content-Type': 'application/json',
                    UserId: this.props.userId
            },
                method: 'POST',
                body: JSON.stringify(user)
        });
             data = await response.json();
            if(data) {
                const currentUsers = this.state.users;
                currentUsers.unshift(data);
                this.setState({users: currentUsers, searchedUsers: currentUsers});
                this.props.notify('Success', 'success', 'User added!');
            }
            this.props.manageScreenLoader(false);
        } catch(err){
            this.props.manageScreenLoader(false);
            this.props.notify('Error', 'error', 'User already exists!');
        }
    }

    setUserRole(e) {
        this.setState({newUserRole: e.target.value});
    }

    setUserCity(e) {
        this.setState({newUserCity: e.target.value});
    }

    render() {
        const data = this.state.searchedUsers.map(usr => {
            return ({
                emailId: usr.userId,
                role: usr.role,
                active: usr.active
                });
        })

        const columns = [
           {
                Header: 'Email Id',
                headerClassName: 'bg-secondary',
                accessor: 'emailId'
            },
            {
                Header: 'Role',
                headerClassName: 'bg-secondary',
                accessor: 'role'
            },
            {
                Header: 'Active',
                headerClassName: 'bg-secondary',
                accessor: 'active'
            }
        ];
        return (
            <div className="mt-5">
                {/*<h6><Badge color="light">Adicionar Usuarios</Badge></h6>
                <br/>*/}
                <div style={{border:'0px solid grey'}}>
                    <Form>
                        <FormGroup row className="mt-2 ml-2 mr-2">
                            <Col sm={3}>
                                <InputGroup>
                                    <Input type="email" name="nmEmail" id="idEmail" placeholder="Email" onBlur={this.validate} />
                                    <InputGroupAddon addonType="append" className="bg-light" style={{display: this.state.emailIdValid==='Y'?'':'none'}}>
                                        <FaCheckCircle style={{color: 'green'}}/>
                                    </InputGroupAddon>
                                    <InputGroupAddon addonType="append" className="bg-light" style={{display: this.state.emailIdValid==='N'?'':'none'}}>
                                        <TiDelete style={{color: 'red'}}/>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Col>

                            <Col sm={3}>
                                <InputGroup>
                                    <Input type="text" name="nmFirstName" id="idFirstName" placeholder="Primeiro Nome" onBlur={this.validate} />
                                    <InputGroupAddon addonType="append" className="bg-light" style={{display: this.state.firstNameValid==='Y'?'':'none'}}>
                                        <FaCheckCircle style={{color: 'green'}}/>
                                    </InputGroupAddon>
                                    <InputGroupAddon addonType="append" className="bg-light" style={{display: this.state.firstNameValid==='N'?'':'none'}}>
                                        <TiDelete style={{color: 'red'}}/>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Col>

                            <Col sm={3}>
                                <InputGroup>
                                    <Input type="text" name="nmLastName" id="idLastName" placeholder="Sobre Nome" onBlur={this.validate} />
                                    <InputGroupAddon addonType="append" className="bg-light" style={{display: this.state.lastNameValid==='Y'?'':'none'}}>
                                        <FaCheckCircle style={{color: 'green'}}/>
                                    </InputGroupAddon>
                                    <InputGroupAddon addonType="append" className="bg-light" style={{display: this.state.lastNameValid==='N'?'':'none'}}>
                                        <TiDelete style={{color: 'red'}}/>
                                    </InputGroupAddon>
                                </InputGroup>
                            </Col>
                            <Col sm={2}>
                                <Button size="sm" disabled={!(this.state.firstNameValid==='Y' && this.state.lastNameValid==='Y' && this.state.emailIdValid==='Y')} className="mt-1" outline color="warning" onClick={this.addUser}>Adicionar Usuarios</Button>
                            </Col>
                        </FormGroup>
                        <div style={{display: this.props.userRole === 'SUPER_ADMIN' ? '' : 'none'}}>
                            <FormGroup row className="ml-2 mr-2">
                            <Col sm={3}>
                                <Input type="select" name="nmCity" id="idCity" onChange={this.setUserCity}>
                                    <option value="AMERICANA" selected>Americana</option>
                                    <option value="COSMOPOLIS">Cosmopolis</option>
                                    <option value="JUNDIAI">Jundiai</option>
                                </Input>
                            </Col>

                            <Col sm={3}>
                                <Input type="select" name="nmRole" id="idRole" onChange={this.setUserRole}>
                                    <option value="USER" selected>User</option>
                                    <option value="LOCAL_ADMIN">Admin</option>
                                </Input>
                            </Col>
                            </FormGroup>
                        </div>
                    </Form>
                </div>

                <ReactTable
                    columns={columns}
                    data={data}
                    defaultPageSize={10}
                    sortable={false}
                    resizable={false}
                    noDataText={this.state.noDataText}
                    className="-striped -highlight bg-dark text-light"
                />
             </div>
        );
    }
}

export default withAuth(UserManagement);

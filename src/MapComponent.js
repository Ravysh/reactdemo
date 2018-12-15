import React, {Component} from 'react';
import FaMapMarker from 'react-icons/lib/fa/map-marker';
import FaCab from 'react-icons/lib/fa/cab';
import {Popover, PopoverBody} from 'reactstrap';

class MapComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            infoPopperOpen: false,
            carInfoPopperOpen: false
        }

        this.toggleInfoPopper = this.toggleInfoPopper.bind(this);
        this.toggleCarInfoPopper = this.toggleCarInfoPopper.bind(this);
    }

    toggleInfoPopper() {
        this.setState({infoPopperOpen: !this.state.infoPopperOpen});
    }
    toggleCarInfoPopper() {
        this.setState({carInfoPopperOpen: !this.state.carInfoPopperOpen});
    }

    render() {

        return (
            <div>
                <div style={{display: this.props.vehiclePresent ? '' : 'none'}}>
                    <FaCab id={'car_'+this.props.markerId} onClick={this.toggleCarInfoPopper} style={{color: this.props.iconColor, display: this.props.vehiclePresent ? '' : 'none'}} size={20}/>
                    <div style={{display: this.state.carInfoPopperOpen ? '' : 'none'}}>
                        <Popover isOpen={this.state.carInfoPopperOpen} className="bg-dark" placement="top" toggle={this.toggleCarInfoPopper} target={'car_'+this.props.markerId}>
                            <PopoverBody className="text-white">
                                <div className="bg-dark text-white" style={{maxHeight: 150, overflowY: 'auto', maxWidth: 200, overflowX: 'auto'}}>
                                    <table>
                                        <tbody>
                                        <tr>
                                            <td>
                                                Boletim No.
                                            </td>
                                            <td className="text-warning">
                                                {this.props.reportId}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Ocorrência
                                            </td>
                                            <td className="text-warning">
                                                {this.props.occurencia}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Rubrica
                                            </td>
                                            <td className="text-warning">
                                                {this.props.rubrica}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Especie
                                            </td>
                                            <td className="text-warning">
                                                {this.props.especie}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </PopoverBody>
                        </Popover>
                    </div>

                </div>
                <div style={{display: this.props.vehiclePresent ? 'none' : ''}}>
                    <FaMapMarker id={'marker_'+this.props.markerId} onClick={this.toggleInfoPopper} style={{color: this.props.iconColor, display: this.props.vehiclePresent ? 'none' : ''}} size={20}/>
                    <div style={{display: this.state.infoPopperOpen ? '' : 'none'}}>
                        <Popover isOpen={this.state.infoPopperOpen} className="bg-dark" placement="top" toggle={this.toggleInfoPopper} target={'marker_'+this.props.markerId}>
                            <PopoverBody className="text-white">
                                <div className="bg-dark text-white" style={{maxHeight: 150, overflowY: 'auto', maxWidth: 200, overflowX: 'auto'}}>
                                     <table>
                                        <tbody>
                                        <tr>
                                            <td>
                                                Boletim No.
                                            </td>
                                            <td className="text-warning">
                                                {this.props.reportId}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Ocorrência
                                            </td>
                                            <td className="text-warning">
                                                {this.props.occurencia}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Rubrica
                                            </td>
                                            <td className="text-warning">
                                                {this.props.rubrica}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Especie
                                            </td>
                                            <td className="text-warning">
                                                {this.props.especie}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </PopoverBody>
                        </Popover>
                    </div>

                </div>
            </div>
        );
    }

}

export default MapComponent;
import React, { Component } from 'react';
import './App.css';
import GoogleMapReact from 'google-map-react';

import MapComponent from './MapComponent';

const handleApiLoaded = (map, maps) => {
    var KML = new maps.KmlLayer({
        url: 'https://raw.githubusercontent.com/dhirajprakash/googlemaps/master/americana2.kml'
    });
    KML.setMap(map);

}


class Map extends Component {

    constructor(props) {
        super(props);
    }

    

    


    render() {
    const mapComp = this.props.mapData.map(mp=>{
    let iconColor = '#FF5733';
    let iconType = 0;
    if(mp.Rubrica != null){
        if(mp.Rubrica.includes('urto')){
            iconColor='#36A2EB';
            iconType=1;
        }else if(mp.Rubrica.includes('oubo')){
            iconColor='#FF6384';
            iconType=2;
         }else{
            iconColor='#FFCE56';
            iconType=3;
         }
        }else{
            iconColor='#FF5733';
            iconType=4;
        }
   return (
    
       <MapComponent key={mp.id}
           markerId={mp.id}
           lat={mp.lat}
           lng={mp.lng}
           bo={mp.name}
           autoria={mp.Autoria}
           rubrica={mp.Rubrica}
           periodo={mp.OCCURENCIA_TIME}
           dia={mp.OCCURENCIA_DAY}
           tipolocal={mp.TipoDeLocal}
           especie={mp.Especie}
           flagrante={mp.Flagrante}
           iconColor={iconColor}
           iconType={iconType}
           vehiclePresent={mp.vehiclePresent}
           reportId={mp.reportId}
           occurencia={mp.occurencia}

       />
   );
});
        return (
            <div style={{ height: '100%', width: '100%' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: 'AIzaSyCvKqs285DpxtdI8spf2Vi64gFhSE7N4lw' }}
                    defaultCenter={{lat: this.props.mapData[0].lat, lng:this.props.mapData[0].lng }}
                    defaultZoom={13}
                    yesIWantToUseGoogleMapApiInternals={true}
                    onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
                >
                    {mapComp}
                   
                    
                </GoogleMapReact>
                
            </div>
            );
    }
}

export default Map;

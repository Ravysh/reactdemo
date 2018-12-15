import React, {Component} from 'react';
import './App.css';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Badge,
    Button,
    Tooltip,
    Collapse,
    Popover,
    PopoverBody,
    PopoverHeader
} from 'reactstrap';
import Dropzone from 'react-dropzone';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import FaCheck from 'react-icons/lib/fa/check';
import {CSVLink, CSVDownload} from 'react-csv';
import {withAuth} from '@okta/okta-react';
import fetch from 'isomorphic-fetch';
import Helper from './Helper';
import uuid from 'uuid';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FaExclamationTriangle from 'react-icons/lib/fa/exclamation-triangle';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle';
import FaEdit from 'react-icons/lib/fa/edit';
import FaTimesCircle from 'react-icons/lib/fa/times-circle';
import FaAngleUp from 'react-icons/lib/fa/angle-double-up';
import FaAngleDown from 'react-icons/lib/fa/angle-double-down';
import FaInfoCircle from 'react-icons/lib/fa/info-circle';
import FaSearch from 'react-icons/lib/fa/search';
import Person from './Person';
import Vehicle from './Vehicle';
import Article from './Article';
import OtherDetail from './OtherDetail';
import PersonView from './PersonView';
import VehicleView from './VehicleView';
import ArticleView from './ArticleView';
import OtherDetailView from './OtherDetailView';

class UploadFile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            files: [],
            uploadInProgress: false,
            reports: [],
            searchResult: [],
            modal: false,
            uploadStatusModal: false,
            modalTitle: '',
            modalBody: {},
            noDataText: 'Carregando...',
            mapData: [],
            searchEligible: false,
            uploadFilesReturnedFromServer: [],
            userRole: '',
            reportEditMode: false,
            editTooltipOpen: false,
            cancelEditTooltipOpen: false,
            historyMinimized: false,
            indiciadoPersons: [],
            testimonyPersons: [],
            victimPersons: [],
            vehicles: [],
            articles: [],
            otherDetails: [],
            searchType: 'AND',
            searchPopperOpen: false,
            rubricaFilter: [],
            tipoDeLocalFilter: [],
            dayFilter: [],
            timeFilter: [],
            rubricaFilterOptions: [],
            tipoDeLocalFilterOptions: []
        }

        this.startDate = moment().subtract(90, "days");
        this.endDate = moment();

        this.toggle = this.toggle.bind(this);
        this.uploadStatusToggle = this.uploadStatusToggle.bind(this);
        this.searchReports = this.searchReports.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.handleFromDate = this.handleFromDate.bind(this);
        this.handleToDate = this.handleToDate.bind(this);
        this.checkDateFilter = this.checkDateFilter.bind(this);
        this.addIndiciadoPerson = this.addIndiciadoPerson.bind(this);
        this.addTestimonyPerson = this.addTestimonyPerson.bind(this);
        this.addVictimPerson = this.addVictimPerson.bind(this);
        this.checkValidPerson = this.checkValidPerson.bind(this);
        this.deleteIndiciadoPerson = this.deleteIndiciadoPerson.bind(this);
        this.deleteTestimonyPerson = this.deleteTestimonyPerson.bind(this);
        this.deleteVictimPerson = this.deleteVictimPerson.bind(this);
        this.addVehicle = this.addVehicle.bind(this);
        this.deleteVehicle = this.deleteVehicle.bind(this);
        this.addArticle = this.addArticle.bind(this);
        this.deleteArticle = this.deleteArticle.bind(this);
        this.addOtherDetail = this.addOtherDetail.bind(this);
        this.deleteOtherDetail = this.deleteOtherDetail.bind(this);
        this.changeSearchType = this.changeSearchType.bind(this);
        this.toggleSearchPopper = this.toggleSearchPopper.bind(this);
        this.manageSearchButtons = this.manageSearchButtons.bind(this);
        this.toggleAdvFilter = this.toggleAdvFilter.bind(this);
        this.modifyAdvFilter = this.modifyAdvFilter.bind(this);
        this.modifyStateAdvFilter = this.modifyStateAdvFilter.bind(this);
        this.applyAdvFilter = this.applyAdvFilter.bind(this);
        this.resetAdvFilter = this.resetAdvFilter.bind(this);
        this.searchReportForAttribute = this.searchReportForAttribute.bind(this);
    }

    toggleSearchPopper() {
        this.setState({
            searchPopperOpen: !this.state.searchPopperOpen
        });
    }

    toggleAdvFilter() {
        if(this.refs.advSearchLocalCrime) {
            this.refs.advSearchLocalCrime.value = '';
        }
        this.setState({
            advFilterPopperOpen: !this.state.advFilterPopperOpen, dayFilter: [], timeFilter: [], rubricaFilter: [], tipoDeLocalFilter: []
        });
    }

    resetAdvFilter() {
        if(this.refs.advSearchLocalCrime) {
            this.refs.advSearchLocalCrime.value = '';
        }
        this.setState({dayFilter: [], timeFilter: [], rubricaFilter: [], tipoDeLocalFilter: [], advFilterPopperOpen: false});
        this.clearSearch();
        //this.searchReports();
    }

    applyAdvFilter() {
        if(this.state.rubricaFilter.length === 0 && this.state.tipoDeLocalFilter.length === 0 && this.state.dayFilter.length === 0 && this.state.timeFilter.length === 0 && this.refs.advSearchLocalCrime.value.trim() === '') {
            this.props.notify('Info', 'info', 'First select options to search!');
        } else {
            let results1 = [];
            let results2 = [];
            let results3 = [];
            let results4 = [];
            if(this.state.rubricaFilter.length > 0) {
                results1 = this.searchReportForAttribute('Rubrica', this.state.rubricaFilter, this.state.searchResult);
            }
            if(this.state.tipoDeLocalFilter.length > 0) {
                results2 = this.searchReportForAttribute('TipoDeLocal', this.state.tipoDeLocalFilter, this.state.searchResult);
                results1.push(...results2);
            }
            if(this.state.dayFilter.length > 0) {
                results3 = this.searchReportForAttribute('OCCURENCIA_DAY', this.state.dayFilter, this.state.searchResult);
                results1.push(...results3);
            }
            if(this.state.timeFilter.length > 0) {
                results4 = this.searchReportForAttribute('OCCURENCIA_TIME', this.state.timeFilter, this.state.searchResult);
                results1.push(...results4);
            }

            if(this.refs.advSearchLocalCrime && this.refs.advSearchLocalCrime.value.trim() !== '') {
                const localCrimeSearchTxtArray = [];
                localCrimeSearchTxtArray.push(this.refs.advSearchLocalCrime.value.trim());
                const results5 = this.searchReportForAttribute('LocalCrime', localCrimeSearchTxtArray, this.state.searchResult);
                results1.push(...results5);
            }

            const results = [];
            const resultIds = [];
            results1.map(r => {
                if(resultIds.indexOf(r.reportId) >=0) {

                } else {
                    results.push(r);
                    resultIds.push(r.reportId);
                }
            });

            this.setState({searchResult: results});
            this.getMapCoordinates(results);
            this.props.updateChartData(results);
            this.toggleAdvFilter();
        }
    }

    searchReportForAttribute(attribute, valuesToSearch, arrayToSearch) {
        const searchResult = [];
        arrayToSearch.map(rpt => {
            /*if(valuesToSearch.indexOf(rpt.pdfDataMap[attribute]) >= 0) {
                searchResult.push(rpt);
            }*/
            for(let k=0;k<valuesToSearch.length;k++)
            {
                if(rpt.pdfDataMap[attribute].toUpperCase().indexOf(valuesToSearch[k].toUpperCase()) >= 0) {
                    searchResult.push(rpt);
                    break;
                }
            }
        });
        return searchResult;
    }

    modifyAdvFilter(value, type) {
        switch (type) {
           case 'DAY':
                this.modifyStateAdvFilter(this.state.dayFilter, value);
                break;

            case 'TIME':
                this.modifyStateAdvFilter(this.state.timeFilter, value);
                break;

            case 'NATUREZA':
                this.modifyStateAdvFilter(this.state.rubricaFilter, value);
                break;

            case 'TIPODELOCAL':
                this.modifyStateAdvFilter(this.state.tipoDeLocalFilter, value);
                break;
        }
    }

    modifyStateAdvFilter(filterArray, value) {
        const idx = filterArray.indexOf(value);
        if (idx >= 0) {
            filterArray.splice(idx, 1);
        } else {
            filterArray.push(value);
        }
    }

    manageSearchButtons() {
        const searchText = this.refs.searchBox.value;
        if (searchText != null && searchText.trim() !== '') {
            this.setState({searchEligible: true});
        } else {
            this.setState({searchEligible: false});
        }
    }

    async uploadFiles(files) {
        this.props.manageScreenLoader(true);
        let totalSize = 0;
        const formData = new FormData();
        files.map(f => {
                totalSize = totalSize + f.size;
                formData.append('files', f);
            }
        );
        if (totalSize > 20480000) {
            return false;
        }
        this.setState({files: files, uploadInProgress: true, uploadStatusModal:true});

        try {
            const response = await fetch(Helper.getAPI() + 'reports/upload', {
                headers: {
                    Authorization: 'Bearer ' + await this.props.auth.getAccessToken(),
                    UserId: this.props.userId
                },
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            const uploadedReports = [];
            let found = false;
            for (let i = 0; i < this.state.reports.length; i++) {
                found = false;
                for (let j = 0; j < data.length; j++) {
                    if (this.state.reports[i].reportId === data[j].reportId) {
                        found = true;
                    }
                }
                if (!found) {
                    uploadedReports.push(this.state.reports[i]);
                }
            }

            let errorOnUpload = false;
            data.map(rpt => {
                if(rpt.pdfDataMap.PARSE_ERROR) {
                    errorOnUpload = true;
                }
                if(!rpt.pdfDataMap.OTHER_USER) {
                    uploadedReports.unshift(rpt);
                }
            });
            this.setState({reports: uploadedReports, searchResult: uploadedReports, uploadInProgress: false, uploadFilesReturnedFromServer: data});

            if(errorOnUpload && data.length === 1) {
                this.props.notify('Error', 'error', 'Erro ao fazer o upload do arquivo!');
            } else if(errorOnUpload) {
                this.props.notify('Warning', 'warning', 'Poucos erros encontrados durante o upload de arquivos!');
            } else {
                this.props.notify('Success', 'success', 'Arquivos enviados!');
            }
            this.props.manageScreenLoader(false);
            this.props.updateChartData(uploadedReports);
            this.getMapCoordinates(uploadedReports);

        } catch (err) {
            console.log(err);
            this.props.notify('Error', 'error', 'o upload falhou. Entre em contato com a equipe de suporte!');
            this.props.manageScreenLoader(false);
            this.setState({uploadInProgress: false});
        }
    }

    async componentDidMount() {
        try {
            this.props.manageScreenLoader(true);
            const response = await fetch(Helper.getAPI() + 'reports', {
                headers: {
                    Authorization: 'Bearer ' + await this.props.auth.getAccessToken(),
                    UserId: this.props.userId
                }
            });
            const data = await response.json();
            // console.log(data);
            if (data && data.length > 0) {
                this.props.updateUser(data[0].userRole);
                this.setState({reports: data, searchResult: data, tableLoading: false, userRole: data[0].userRole});
                //this.getMapCoordinates(data);

                const tempOptions1 = [];
                const tempOptions2 = [];

                data.map(rpt => {
                    if(rpt.pdfDataMap.Rubrica && tempOptions1.indexOf(rpt.pdfDataMap.Rubrica === -1)) {
                        tempOptions1.push(rpt.pdfDataMap.Rubrica);
                    }
                    if(rpt.pdfDataMap.TipoDeLocal && tempOptions2.indexOf(rpt.pdfDataMap.TipoDeLocal === -1)) {
                        tempOptions2.push(rpt.pdfDataMap.TipoDeLocal);
                    }
                });
                this.setState({rubricaFilterOptions: tempOptions1, tipoDeLocalFilterOptions: tempOptions2});
               this.searchReports();

            } else {
                this.setState({noDataText: 'Nenhum arquivo encontrado!', tableLoading: false});
            }
            this.props.manageScreenLoader(false);
        } catch (err) {
            this.setState({noDataText: 'Nenhum arquivo encontrado!', tableLoading: false});
            console.log(err);
            this.props.manageScreenLoader(false);
        }
    }

    getMapCoordinates(data) {
        const coordinates = [];
        let index = 0;
        data.map(rpt => {
            coordinates.push({
                id: index++,
                lat: parseFloat(rpt.pdfDataMap.Latitude),
                lng: parseFloat(rpt.pdfDataMap.Longitude),
                name: rpt.pdfDataMap.BoletimNo,
                Autoria: rpt.pdfDataMap.Autoria,
                Rubrica: rpt.pdfDataMap.Rubrica,
                OCCURENCIA_TIME: rpt.pdfDataMap.OCCURENCIA_TIME,
                OCCURENCIA_DAY: rpt.pdfDataMap.OCCURENCIA_DAY,
                TipoDeLocal: rpt.pdfDataMap.TipoDeLocal,
                Especie: rpt.pdfDataMap.Especie,
                Flagrante: rpt.pdfDataMap.Flagrante,
                vehiclePresent: rpt.pdfDataMap.RAW_DATA.toUpperCase().indexOf('PLACA') > -1,
                reportId: rpt.reportId,
                occurencia: rpt.pdfDataMap.Data
            });
        });
        this.setState({mapData: coordinates});
        this.props.updateMapData(coordinates);
    }

    toggle() {
        if (this.state.modal) {
            this.setState({
                modal: !this.state.modal,
                reportEditMode: false,
                historyMinimized: false,
                indiciadoPersons: [],
                testimonyPersons: [],
                victimPersons: [],
                vehicles: [],
                articles: []
            });
    } else {
            this.setState({
                modal: true});
        }
    }

    async submitUserInput() {
        this.props.manageScreenLoader(true);
        try {
            this.props.manageScreenLoader(true);

            //create userInputDataMap
            const userInput = {
                Dependencia: this.refs.userInput_Dependencia.value,
                Flagrante: this.refs.userInput_Flagrante.value,
                History: this.refs.userInput_History.value,
                Indiciado: this.state.indiciadoPersons,
                Testemunha: this.state.testimonyPersons,
                Vitima: this.state.victimPersons,
                Vehicles: this.state.vehicles,
                Articles: this.state.articles,
                OtherDetails: this.state.otherDetails,
                editedBy: this.props.userId,
                uploader: this.refs.userInput_uploader.value
            }
            const report = {
                reportId: this.refs.userInput_BoletimNo.value,
                userInputDataMap: userInput
            };

            const reportData = JSON.stringify(report);
            this.toggle();
            const response = await fetch(Helper.getAPI() + 'reports/update', {

                headers: {
                    Authorization: 'Bearer ' + await this.props.auth.getAccessToken(),
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: reportData
            });
            const data = await response.json();
            console.log(data);
            if (data) {
                const allReports = [];
                allReports.push(data);
                for (let i = 0; i < this.state.reports.length; i++) {
                    if (this.state.reports[i].reportId != data.reportId) {
                        allReports.push(this.state.reports[i]);
                    }
                }
                this.setState({reports: allReports, searchResult: allReports});
                this.props.notify('Success', 'success', 'Salvo com sucesso!');
            } else {
                this.props.notify('Error', 'error', 'Não salvo!');
            }
            this.props.manageScreenLoader(false);
        } catch (err) {
            console.log(err);
            this.props.notify('Error', 'error', 'Não salvo!');
            this.props.manageScreenLoader(false);
        }
    }

    uploadStatusToggle() {
        this.setState({
            uploadStatusModal: !this.state.uploadStatusModal
        });
    }

    searchReports() {
        this.props.manageScreenLoader(true);
        const searchText = this.refs.searchBox.value;
        let isTextSearch = false;
        let isTextFound = false;

        if (searchText != null && searchText.trim() !== '') {
            isTextSearch = true;
        }

        if (this.state.reports.length > 0) {
            const results = [];
            this.state.reports.map(rpt => {
                isTextFound = false;
                if (isTextSearch) {
                    if (rpt.pdfDataMap && rpt.pdfDataMap.RAW_DATA) {

                        const searchKeywords = searchText.split(',');
                        if(this.state.searchType === 'AND') {
                            for(let i = 0; i < searchKeywords.length; i++) {
                                if (rpt.pdfDataMap.RAW_DATA.toUpperCase().indexOf(searchKeywords[i].toUpperCase()) > -1) {
                                    isTextFound = true;

                                } else {
                                    isTextFound = false;
                                    break;
                                }
                            }
                            if(isTextFound) {
                                if (this.checkDateFilter(rpt) === 'Y') {
                                    results.push(rpt);
                                }
                            }
                        }
                        else if(this.state.searchType === 'OR') {
                            for(let i = 0; i < searchKeywords.length; i++) {
                                if (rpt.pdfDataMap.RAW_DATA.toUpperCase().indexOf(searchKeywords[i].toUpperCase()) > -1) {
                                    isTextFound = true;
                                    break;
                                } else {
                                    isTextFound = false;
                                }
                            }
                            if(isTextFound) {
                                if (this.checkDateFilter(rpt) === 'Y') {
                                    results.push(rpt);
                                }
                            }
                        }

                        /*if (rpt.pdfDataMap.RAW_DATA.toUpperCase().indexOf(searchText.toUpperCase()) > -1) {
                            //console.log(this.checkDateFilter(rpt));
                            if (this.checkDateFilter(rpt) === 'Y') {
                                results.push(rpt);
                            }
                        }*/
                    }
                } else {
                    //console.log(this.checkDateFilter(rpt));
                    if (this.checkDateFilter(rpt) === 'Y') {
                        results.push(rpt);
                    }
                }


            });
            //console.log(results);
            const message = results.length === 0 ? 'Nenhum arquivo correspondente!' : this.state.noDataText;
            this.setState({searchResult: results, noDataText: message});
            this.getMapCoordinates(results);
            this.props.updateChartData(results);
        }
        this.props.manageScreenLoader(false);
    }

    checkDateFilter(rpt) {
        let valid = '';
        try {
           // console.log(rpt.pdfDataMap.Data.split(' ')[0]);
            const occurenciaDt = moment(rpt.pdfDataMap.Data.split(' ')[0], 'DD/MM/YYYY');
            /*console.log(this.startDate);
            console.log(this.startDate === null);
            console.log(this.startDate === '');*/
            if (this.startDate != null && this.startDate !== '') {
                if (occurenciaDt.isSameOrAfter(this.startDate)) {
                    valid = 'Y';
                } else {
                    valid = 'N';
                }
            }
            //console.log('valid-->'+valid);

            if (valid !== 'N' && this.endDate != null && this.endDate !== '') {
                if (occurenciaDt.isSameOrBefore(this.endDate)) {
                    valid = 'Y';
                } else {
                    valid = 'N';
                }
            }
            //console.log('valid-->'+valid);
            valid = valid === '' ? 'Y' : valid;
        } catch (err) {
            console.log(err);
            valid = 'Y';
        }
        return valid;
    }

    clearSearch() {
        this.refs.searchBox.value = '';
        this.setState({searchEligible: false});
        this.searchReports();
    }

    async getReportLink(s3ReportName) {
        //console.log(s3ReportName);
        this.props.manageScreenLoader(true);
        try {
            const response = await fetch(Helper.getAPI() + 'reports/link?fileName=' + s3ReportName, {
                headers: {
                    Authorization: 'Bearer ' + await this.props.auth.getAccessToken()
                },
                method: 'GET'
            });
            const data = await response.text();
            this.props.manageScreenLoader(false);
            const win = window.open(data, '_blank');
            win.focus();
        } catch (err) {
            console.log(err);
            this.props.manageScreenLoader(false);
        }
    }

    handleFromDate(date) {
        if(date !== null) {
        if (moment(date).isAfter(moment(this.endDate).subtract(1, 'd'))) {
            this.props.notify('Warning', 'warning', 'Selecione desde a data anterior a data.');
            return false;
        }
        if (moment(date).isAfter(moment())) {
            this.props.notify('Warning', 'warning', 'Selecione data válida.');
            return false;
        }
    }
        this.startDate = date;
        this.searchReports();

    }

    handleToDate(date) {
        if(date !== null) {
        if (moment(date).isBefore(moment(this.startDate).add(1, 'd'))) {
            this.props.notify('Warning', 'warning', 'Selecione até a data mais tarde que Da data.');
            return false;
        }
        if (moment(date).isAfter(moment())) {
            this.props.notify('Warning', 'warning', 'Selecione data válida.');
            return false;
        }
    }
        this.endDate = date;
        this.searchReports();

    }

    editReportDetail() {
        this.setState({reportEditMode: !this.state.reportEditMode, editTooltipOpen: !this.state.editTooltipOpen, cancelEditTooltipOpen: !this.state.cancelEditTooltipOpen});
    }
    toggleEditTooltip() {
        this.setState({editTooltipOpen: !this.state.editTooltipOpen});
    }
    toggleCancelEditTooltip() {
        this.setState({cancelEditTooltipOpen: !this.state.cancelEditTooltipOpen});
    }
    toggleHistoryView() {
        this.setState({historyMinimized: !this.state.historyMinimized});
    }

    addIndiciadoPerson(personObj) {
        if (this.checkValidPerson(personObj)){
            const personArray = this.state.indiciadoPersons;
            personArray.push(personObj);
            this.setState({indiciadoPersons: personArray});
        }
    }
    deleteIndiciadoPerson(id) {
        const personArray = this.state.indiciadoPersons;
        const personUpd = personArray.filter(p => p.id !== id);
        this.setState({indiciadoPersons: personUpd});
    }

    addTestimonyPerson(personObj) {
        if (this.checkValidPerson(personObj)){
            const personArray = this.state.testimonyPersons;
            personArray.push(personObj);
            this.setState({testimonyPersons: personArray});
        }
    }
    deleteTestimonyPerson(id) {
        const personArray = this.state.testimonyPersons;
        const personUpd = personArray.filter(p => p.id !== id);
        this.setState({testimonyPersons: personUpd});
    }

    addVictimPerson(personObj) {
        if (this.checkValidPerson(personObj)){
            const personArray = this.state.victimPersons;
            personArray.push(personObj);
            this.setState({victimPersons: personArray});
        }
    }
    deleteVictimPerson(id) {
        const personArray = this.state.victimPersons;
        const personUpd = personArray.filter(p => p.id !== id);
        this.setState({victimPersons: personUpd});
    }

    checkValidPerson(personObj) {
        if (personObj.age > 200 || personObj.age < 1) {
            this.props.notify('Error', 'error', 'insira idade válida!');
            return false;
        } else if (personObj.name == '') {
            this.props.notify('Error', 'error', 'Enter name!');
            return false;
        } else {
            return true;
        }
    }

    addVehicle(vehicleObj) {
        const vehicleArray = this.state.vehicles;
            vehicleArray.push(vehicleObj);
            this.setState({vehicles: vehicleArray});
    }
    deleteVehicle(id) {
        const vehicleArray = this.state.vehicles;
        const vehicleUpd = vehicleArray.filter(v => v.id !== id);
        this.setState({vehicles: vehicleUpd});
    }

    addArticle(articleObj) {
        const articleArray = this.state.articles;
        articleArray.push(articleObj);
        this.setState({articles: articleArray});
    }
    deleteArticle(id) {
        const articleArray = this.state.articles;
        const articleUpd = articleArray.filter(v => v.id !== id);
        this.setState({articles: articleUpd});
    }

    addOtherDetail(obj) {
        const otherDetailsArray = this.state.otherDetails;
        otherDetailsArray.push(obj);
        this.setState({otherDetails: otherDetailsArray});
    }
    deleteOtherDetail(id) {
        const otherDetailsArray = this.state.otherDetails;
        const upd = otherDetailsArray.filter(v => v.id !== id);
        this.setState({otherDetails: upd});
    }
    changeSearchType(type) {
        this.setState({searchType: type});
    }

    render() {

        const data = this.state.searchResult.map(rpt => {
            return ({
                BoletimNo: rpt.pdfDataMap.BoletimNo,
                Flagrante: rpt.pdfDataMap.Flagrante,
                Data: rpt.pdfDataMap.Data,
                Dependencia: rpt.pdfDataMap.Dependencia,
                Emitido: rpt.pdfDataMap.Emitido,
                History: rpt.pdfDataMap.History ? rpt.pdfDataMap.History.split('~').join(' ') : 'N.A.',
                uploader: rpt.pdfDataMap.uploader,
                LocalCrime: rpt.pdfDataMap.LocalCrime,
                s3ReportName: rpt.pdfDataMap.s3ReportName,
                Longitude: rpt.pdfDataMap.Longitude,
                Latitude: rpt.pdfDataMap.Latitude,
                Especie: rpt.pdfDataMap.Especie,
                Year: rpt.pdfDataMap.Year,
                Autoria: rpt.pdfDataMap.Autoria,
                Circunscricao: rpt.pdfDataMap.Circunscricao,
                PeriodoCommunicacao: rpt.pdfDataMap.PeriodoCommunicacao,
                PeriodoElaboracao: rpt.pdfDataMap.PeriodoElaboracao,
                Rubrica: rpt.pdfDataMap.Rubrica,
                TipoDeLocal: rpt.pdfDataMap.TipoDeLocal,
                Indiciado: rpt.pdfDataMap.Indiciado,
                Testemunha: rpt.pdfDataMap.Testemunha,
                Vitima: rpt.pdfDataMap.Vitima,
                Vehicles: rpt.pdfDataMap.Vehicles,
                Articles: rpt.pdfDataMap.Articles,
                OtherDetails: rpt.pdfDataMap.OtherDetails
            });
        })

        const columns = [
            {
                Header: 'Boletim No.',
                headerClassName: 'bg-secondary',
                accessor: 'BoletimNo'
            },
            {
                Header: 'Dependencia',
                headerClassName: 'bg-secondary',
                accessor: 'Dependencia'
            },
            {
                Header: 'Ocorrência',
                headerClassName: 'bg-secondary',
                accessor: 'Data'
            },
            {
                Header: 'Emitido',
                headerClassName: 'bg-secondary',
                accessor: 'Emitido'
            },
            {
                Header: 'LocalCrime',
                headerClassName: 'bg-secondary',
                accessor: 'LocalCrime',
            },
            {
                Header: 'Flagrante',
                headerClassName: 'bg-secondary',
                accessor: 'Flagrante'
            }
        ];

        let uploadInProgressData = '';
        if(this.state.uploadInProgress) {
            uploadInProgressData = this.state.files.map(f =>
                <tr key={f.name}>
                    <td>
                        {f.name}
                    </td>
                    <td colSpan="2" align="center">
                        <div className="File-loader mt-1"></div>
                    </td>
                </tr>
            );
        } else {
            let keys = '';
            uploadInProgressData = this.state.uploadFilesReturnedFromServer.map(f =>
                <tr key={f.reportS3Link}>
                    <td>
                        {f.reportS3Link}
                    </td>

                    <td style={{display: f.pdfDataMap.FAILED_KEYS.length > 0 ? '' : 'none'}}>
                        Falha ao extrair<b>{f.pdfDataMap.FAILED_KEYS.map(k => {return (k + '  ')})}</b>
                    </td>
                    <td style={{display: f.pdfDataMap.OTHER_USER ? '' : 'none'}}>
                        Já carregado por outro usuário.
                    </td>
                    <td colSpan="2" align="center" style={{display: f.pdfDataMap.PARSE_ERROR ? 'none' : ''}}>
                        <FaCheck style={{color: 'green'}}/>
                    </td>
                    <td style={{display: f.pdfDataMap.OTHER_USER ? '' : 'none'}}>
                        <FaExclamationCircle style={{color: 'red'}}/>
                    </td>
                    <td style={{display: (f.pdfDataMap.PARSE_ERROR && !f.pdfDataMap.OTHER_USER) ? '' : 'none'}}>
                        <FaExclamationTriangle style={{color: 'orange'}}/>
                    </td>
                </tr>
            );
        }

        return (
            <div style={{marginTop: '7vh', height: '93vh'}} className="font-common">
                <div className="mt-3 mb-2 row">
                    <div className="col-11 d-inline-block">
                        <div className="react-datepicker-wrapper">
                            <div className="react-datepicker__input-container">
                                <input type="text" name="nmSearch" id="idSearch" placeholder="digite palavra chaves separado por virgula para busca wild card..."
                                        ref="searchBox" onChange={this.manageSearchButtons}
                                       className="react-datepicker-ignore-onclickoutside"/>
                                <FaInfoCircle onClick={this.toggleSearchPopper} id="searchPopper" style={{color: 'orange', cursor: 'pointer'}} />
                            </div>
                        </div>

                        <div className="d-inline-block ml-3 mt-2 text-white">
                            <input type="radio" name="searchType" value="AND" onClick={() => this.changeSearchType('AND')} defaultChecked={this.state.searchType === 'AND'}/> Todos &nbsp;&nbsp;
                            <input type="radio" name="searchType" value="OR" onClick={() => this.changeSearchType('OR')} defaultChecked={this.state.searchType === 'OR'}/> Qualquer um
                        </div>

                        <Popover placement="top" isOpen={this.state.searchPopperOpen} target="searchPopper" toggle={this.toggleSearchPopper}>
                            <PopoverBody>Digite palavras de busca separado por virgula e depois clique em butão de buscar.Dois opções disponíveis são para buscar com Todos os palavras escritas ou Buscar se qualquer um de palavra existe.</PopoverBody>
                        </Popover>
                        <Button className="ml-2" color="success" outline size="sm" onClick={this.searchReports} disabled={!this.state.searchEligible} title="search">
                            <FaSearch/>
                        </Button>
                        <Button className="ml-2" color="warning" outline id="advFiltersBtn" size="sm" onClick={this.toggleAdvFilter} title="advanced filters">
                            Filtro Avançado
                        </Button>
                        <Button className="ml-2" color="danger" outline size="sm" onClick={this.resetAdvFilter} title="clear search">
                            <FaTimesCircle/>
                        </Button>

                        <span className="d-inline-block text-light ml-3">Ocorrência:</span>
                        <div className="d-inline-block ml-1">
                            <DatePicker
                                className="date-input"
                                selected={this.startDate}
                                selectsStart
                                startDate={this.startDate}
                                endDate={this.endDate}
                                onChange={this.handleFromDate}
                                isClearable={true}
                                dateFormat="DD/MM/YYYY"
                            />
                        </div>
                        <div className="d-inline-block ml-1 ">
                            <DatePicker
                                className="date-input"
                                selected={this.endDate}
                                selectsEnd
                                startDate={this.startDate}
                                endDate={this.endDate}
                                onChange={this.handleToDate}
                                isClearable={true}
                                dateFormat="DD/MM/YYYY"
                            />
                        </div>

                        <div>

                            <Modal contentClassName="bg-dark text-white" isOpen={this.state.advFilterPopperOpen} toggle={this.toggleAdvFilter} size="lg" centered="true">
                                <ModalHeader toggle={this.toggleAdvFilter}>
                                    Filtro Avançado
                                </ModalHeader>
                                <ModalBody>
                                    <div className="bg-dark mb-2">
                                        <input type="text" placeholder="local de crime" ref="advSearchLocalCrime" />
                                    </div>
                                    <table border="1" width="100%">
                                        <thead align="center" className="bg-secondary">
                                        <tr>
                                            <th width="25%">
                                                Natureza
                                            </th>
                                            <th width="25%">
                                                Estabelecimentos
                                            </th>
                                            <th width="25%">
                                                Periodo
                                            </th>
                                            <th width="25%">
                                                Dia
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>
                                                <div style={{minHeight: 150, maxHeight: 150, overflowY: 'auto'}}>
                                                    {/* {this.state.rubricaFilterOptions.map((rf, idx) =>
                                                        <div key={'rf-'+idx}>
                                                        <input className="ml-1" type="checkbox" onChange={() => this.modifyAdvFilter(rf, 'NATUREZA')} />
                                                            <span className="ml-1">{rf}</span>
                                                        </div>
                                                    )} */}
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('oubo', 'NATUREZA')} />Roubo <br/>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('urto', 'NATUREZA')}/>Furto <br/>
                                                   
                                                </div>

                                            </td>
                                            <td>
                                                <div style={{minHeight: 150, maxHeight: 150, overflowY: 'auto'}}>
                                                    {this.state.tipoDeLocalFilterOptions.map((tf, idx) =>
                                                        <div key={'tf-'+idx}>
                                                            <input className="ml-1" type="checkbox" onChange={() => this.modifyAdvFilter(tf, 'TIPODELOCAL')} />
                                                            <span className="ml-1">{tf}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{minHeight: 150, maxHeight: 150, overflowY: 'auto'}}>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('TARDE', 'TIME')} />TARDE <br/>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('NOITE', 'TIME')}/>NOITE <br/>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('MADRUGADA', 'TIME')}/>MADRUGADA <br/>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('MANHA', 'TIME')}/>MANHA <br/>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('INCERTA', 'TIME')}/>INCERTA
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{minHeight: 150, maxHeight: 150, overflowY: 'auto'}}>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('SUNDAY', 'DAY')}/>DOMINGO <br/>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('MONDAY', 'DAY')}/>SEGUNDA <br/>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('TUESDAY', 'DAY')}/>TERÇA <br/>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('WEDNESDAY', 'DAY')}/>QUARTA <br/>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('THURSDAY', 'DAY')}/>QUINTA <br/>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('FRIDAY', 'DAY')}/>SEXTA <br/>
                                                    <input className="ml-1 mr-1" type="checkbox" onChange={() => this.modifyAdvFilter('SATURDAY', 'DAY')}/>SABADO
                                                </div>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </ModalBody>
                                <ModalFooter>
                                    {/*<Button color="secondary" size="sm" title="reset" onClick={this.resetAdvFilter}>
                                        Reset
                                    </Button>*/}
                                    <Button color="warning ml-2" size="sm" title="search" onClick={this.applyAdvFilter}>
                                        Busca
                                    </Button>
                                </ModalFooter>
                            </Modal>

                        </div>

                    </div>

                </div>

                <div>
                    <div>
                        <div style={{height: '71vh', overflow: 'auto'}}>
                            <ReactTable
                                getTdProps={(state, rowInfo, column, instance) => {
                                    return {
                                        onClick: (e) => {
                                            if (rowInfo) {
                                                this.setState({
                                                    modalTitle: rowInfo.original.BoletimNo,
                                                    modalBody: rowInfo.original,
                                                    indiciadoPersons: rowInfo.original.Indiciado || [],
                                                    testimonyPersons: rowInfo.original.Testemunha || [],
                                                    victimPersons: rowInfo.original.Vitima || [],
                                                    vehicles: rowInfo.original.Vehicles || [],
                                                    articles: rowInfo.original.Articles || [],
                                                    otherDetails: rowInfo.original.OtherDetails || []
                                                });
                                                this.toggle();
                                            }
                                        }
                                    }
                                }
                                }
                                //loading={this.state.tableLoading}
                                //LoadingComponent={ReactTableLoader}
                                columns={columns}
                                data={data}
                                defaultPageSize={10}
                                sortable={false}
                                resizable={false}
                                noDataText={this.state.noDataText}
                                className="-striped -highlight bg-dark text-light"
                            />

                        </div>
                        <div className="row mt-1">
                            <div className="col-3">
                                <div align="left">
                                    <Dropzone disabled={this.state.uploadInProgress} style={{}} accept="application/pdf"
                                              onDrop={this.uploadFiles.bind(this)}>
                                        <div>
                                            <Button outline color="warning">Clique ou Arraste arquivos aqui
                                                (pdf)</Button>
                                        </div>
                                    </Dropzone>
                                </div>
                            </div>

                            <div className="col-9" align="right" style={{display: this.state.userRole == 'SUPER_ADMIN' ? '' : 'none'}}>
                                <span>
                                    <CSVLink data={data} filename="Boletim.csv"><Button outline color="warning">CSV ⬇</Button></CSVLink>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <Modal className="font-common" isOpen={this.state.modal} toggle={this.toggle} size="lg" centered="true">
                    <ModalHeader toggle={this.toggle}>
                        Boletim: {this.state.modalTitle}&nbsp;
                        <FaEdit className="edit-icon" id="editReportIcon" style={{cursor: 'Pointer', marginLeft: 10, marginTop: -5, display: this.state.reportEditMode ? 'none' : ''}} onClick={this.editReportDetail.bind(this)} />
                        <Tooltip placement="right" delay={{ show: 200, hide: 0 }} isOpen={this.state.editTooltipOpen} target="editReportIcon" toggle={this.toggleEditTooltip.bind(this)}>
                            Editar detalhes do arquivo!
                        </Tooltip>
                        <FaTimesCircle className="edit-icon" id="cancelEditReportIcon" style={{cursor: 'Pointer', marginLeft: 10, marginTop: -5, display: this.state.reportEditMode ? '' : 'none'}} onClick={this.editReportDetail.bind(this)} />
                        <Tooltip placement="right" delay={{ show: 200, hide: 0 }} isOpen={this.state.cancelEditTooltipOpen} target="cancelEditReportIcon" toggle={this.toggleCancelEditTooltip.bind(this)}>
                            cancelar a edição
                        </Tooltip>
                    </ModalHeader>
                    <ModalBody style={{display: this.state.reportEditMode ? 'none' : ''}}>
                        <div>
                            <Badge color="primary">Data:</Badge>
                            <Button outline color="primary" size="sm" className="float-right" style={{display: this.state.userRole === 'SUPER_ADMIN' ? '' : 'none'}}
                                    onClick={this.getReportLink.bind(this, this.state.modalBody.s3ReportName)}>View
                                Report</Button>
                            <p>{this.state.modalBody.Data}</p>
                        </div>
                        <div>
                            <Badge color="primary">Emitido:</Badge>
                            <p>{this.state.modalBody.Emitido}</p>
                        </div>
                        <div>
                            <Badge color="primary">LocalCrime:</Badge>
                            <p>{this.state.modalBody.LocalCrime}</p>
                        </div>
                        <div>
                            <Badge color="primary">Dependencia:</Badge>
                            <p>{this.state.modalBody.Dependencia}</p>
                        </div>
                        <div>
                            <Badge color="primary">Flagrante:</Badge>
                            <p>{this.state.modalBody.Flagrante}</p>
                        </div>

                        <div>
                            <Badge color="primary">Natureza:</Badge>
                            <p>{this.state.modalBody.Rubrica}</p>
                        </div>
                        <div>
                            <Badge color="primary">Estabelecimento:</Badge>
                            <p>{this.state.modalBody.TipoDeLocal}</p>
                        </div>
                        <div>
                            <Badge color="primary">Especie:</Badge>
                            <p>{this.state.modalBody.Especie}</p>
                        </div>

                        <div>
                            <Badge color="primary">Histórico:</Badge>
                            <p>{this.state.modalBody.History}</p>
                        </div>

                        <div>
                            <Badge color="primary">Indiciado:</Badge>
                            <PersonView persons={this.state.indiciadoPersons}/>
                        </div>

                        <div className="mt-2">
                            <Badge color="primary">Testemunha:</Badge>
                            <PersonView persons={this.state.testimonyPersons}/>
                        </div>

                        <div className="mt-2">
                            <Badge color="primary">Vitima:</Badge>
                            <PersonView persons={this.state.victimPersons}/>
                        </div>

                        <div className="mt-2">
                            <Badge color="primary">Veículo:</Badge>
                            <VehicleView vehicles={this.state.vehicles}/>
                        </div>

                        <div className="mt-2">
                            <Badge color="primary">Objetos:</Badge>
                            <ArticleView articles={this.state.articles}/>
                        </div>
                        <div className="mt-2">
                            <Badge color="primary">Mais:</Badge>
                            <OtherDetailView otherDetails={this.state.otherDetails}/>
                        </div>

                        <div>
                            <Badge color="primary">Enviado por:</Badge>
                            <p>{this.state.modalBody.uploader}</p>
                        </div>

                    </ModalBody>
                    <ModalBody style={{display: this.state.reportEditMode ? '' : 'none'}}>
                        {/*<div>
                            <Badge color="primary">Data:</Badge>
                            <p>{this.state.modalBody.Data}</p>
                        </div>
                        <div>
                            <Badge color="primary">Emitido:</Badge>
                            <p>{this.state.modalBody.Emitido}</p>
                        </div>
                        <div>
                            <Badge color="primary">LocalCrime:</Badge>
                            <p>{this.state.modalBody.LocalCrime}</p>
                        </div>*/}
                        <div>
                        <input type="hidden" ref="userInput_uploader" value={this.state.modalBody.uploader}/>
                            <input type="hidden" ref="userInput_BoletimNo" value={this.state.modalBody.BoletimNo}/>
                        </div>
                        <div className="form-group">
                            <Badge color="primary">Dependencia:</Badge>
                            <br/>
                            <input ref="userInput_Dependencia" className="form-control mt-1" defaultValue={this.state.modalBody.Dependencia}/>
                        </div>
                        <div className="form-group">
                            <Badge color="primary">Flagrante:</Badge>
                            <select ref="userInput_Flagrante" className="form-control mt-1" defaultValue={this.state.modalBody.Flagrante}>
                                <option value="Sim" selected={this.state.modalBody.Flagrante == 'Sim'}>Sim</option>
                                <option value="Nao" selected={this.state.modalBody.Flagrante != 'Sim'}>Nao</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <Badge color="primary">Histórico:</Badge>
                            <FaAngleUp style={{display: this.state.historyMinimized ? 'none' : '', cursor: 'pointer', marginLeft: 3}} onClick={this.toggleHistoryView.bind(this)} />
                            <FaAngleDown style={{display: this.state.historyMinimized ? '' : 'none', cursor: 'pointer', marginLeft: 3}} onClick={this.toggleHistoryView.bind(this)} />
                            <Collapse isOpen={!this.state.historyMinimized}>
                                <textarea ref="userInput_History" rows={15} style={{alignContent: 'center'}} className="form-control mt-1">{this.state.modalBody.History}</textarea>
                            </Collapse>
                        </div>

                        <div className="form-group">
                            <Badge color="primary">Indiciado:</Badge>
                            <Person addPerson={(personObj) => this.addIndiciadoPerson(personObj)} deletePerson={(id) => this.deleteIndiciadoPerson(id)} persons={this.state.indiciadoPersons}/>
                        </div>

                        <div className="form-group">
                            <Badge color="primary">Testemunha:</Badge>
                            <Person addPerson={(personObj) => this.addTestimonyPerson(personObj)} deletePerson={(id) => this.deleteTestimonyPerson(id)} persons={this.state.testimonyPersons}/>
                        </div>

                        <div className="form-group">
                            <Badge color="primary">Vitima:</Badge>
                            <Person addPerson={(personObj) => this.addVictimPerson(personObj)} deletePerson={(id) => this.deleteVictimPerson(id)} persons={this.state.victimPersons}/>
                        </div>

                        <div className="form-group">
                            <Badge color="primary">Veículo:</Badge>
                            <Vehicle addVehicle={(vehicleObj) => this.addVehicle(vehicleObj)} deleteVehicle={(id) => this.deleteVehicle(id)} vehicles={this.state.vehicles}/>
                        </div>

                        <div className="form-group">
                            <Badge color="primary">Objetos:</Badge>
                            <Article addArticle={(articleObj) => this.addArticle(articleObj)} deleteArticle={(id) => this.deleteArticle(id)} articles={this.state.articles}/>
                        </div>
                        <div className="form-group">
                            <Badge color="primary">Mais:</Badge>
                            <OtherDetail addOtherDetail={(obj) => this.addOtherDetail(obj)} deleteOtherDetail={(id) => this.deleteOtherDetail(id)} otherDetails={this.state.otherDetails}/>
                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>Fechar</Button>
                        <Button color="warning" style={{display: this.state.reportEditMode ? '' : 'none'}} onClick={this.submitUserInput.bind(this)}>Enviar</Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.uploadStatusModal} centered="true">
                    <ModalBody className="font-common">
                        <table className="table-bordered table-striped" style={{width: '100%'}}>
                            <tbody>
                                <tr className="bg-info">
                                    <td style={{width: '50%'}}>
                                        Arquivo
                                    </td>
                                    <td style={{width: '35%'}}>
                                        &nbsp;
                                    </td>
                                    <td style={{width: '15%'}}>
                                        &nbsp;
                                    </td>
                                </tr>
                                {uploadInProgressData}
                            </tbody>
                        </table>

                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.uploadStatusToggle} disabled={this.state.uploadInProgress}>Fechar</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default withAuth(UploadFile);
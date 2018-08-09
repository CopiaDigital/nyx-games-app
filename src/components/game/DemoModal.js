import React, { Component } from 'react';
import ReactGA from 'react-ga';
import ChannelList from "../utilities/ChannelList";
import Downloads from "../utilities/Downloads";
import Download from "../utilities/Download";
import ImageLoader from "../utilities/ImageLoader";
import ShareUrlTool from "../utilities/ShareUrlTool";
import DemoIFrame from "./DemoIFrame";
import DemoWarning from "./DemoWarning";
import DetailBar from "./DetailBar";
import _ from 'underscore';
import Responsive from 'react-responsive';

const Desktop = props => <Responsive {...props} minWidth={992} />;
const Tablet = props => <Responsive {...props} minWidth={768} maxWidth={991} />;
const Mobile = props => <Responsive {...props} maxWidth={767} />;

class DemoModal extends Component {
    constructor(props){
        super(props);

        this.state = {
            game: this.props.game,
            channel: this.props.channel,
            warningAccepted: sessionStorage.getItem('warningAccepted'),
            isFullScreen: false
        };

        if (this.state.warningAccepted == null) {
            this.state.warningAccepted = 'no';
        }

        this.setChannel = this.setChannel.bind(this);
        this.setWarningAccepted = this.setWarningAccepted.bind(this)
        this.makeFullScreen  = this.makeFullScreen.bind(this);
    }
    componentDidMount(){
        ReactGA.event({
            category: 'Game',
            action: 'View demo modal',
            label: 'ID:' + this.state.game.id
        });
    }
    componentWillReceiveProps(nextProps){
        this.setState({
            game: nextProps.game,
            channel: nextProps.channel,
        })
    }
    setChannel(channel) {
        this.props.openDemoModal(this.props.game, channel);
    }
    setWarningAccepted(warningAccepted){
        this.setState({ warningAccepted: warningAccepted });
        sessionStorage.setItem('warningAccepted', warningAccepted);
        if (warningAccepted == 'no') {
            this.props.closeDemoModal();
        }
    }
    makeFullScreen() {
        this.setState({ isFullScreen: true });
    }
    renderDemo() {
        const game = this.state.game;
        const channel = this.state.channel;

        if (this.state.warningAccepted =='no') {
            return <DemoWarning warningAccepted={this.setWarningAccepted} />;
        }

        if(game.hasDemo()) {
            return <DemoIFrame game={game} channel={channel}/>;
        }else{
            return <ImageLoader
                src={"https://d3htn38ft20trn.cloudfront.net/icons/livegames/" + game.id + ".png"}
                loading={<div />}
                containerClassName="game-demo-icon-placeholder"
                className="game-demo-icon-placeholder-image"
                error={<span>Demo unavailable, please contact your account manager for more information.</span>}
            />;
        }
    }
    renderDetailBar() {
        const game = this.state.game;
        const channel = this.state.channel;
        if (!this.state.isFullScreen) {
            return <DetailBar game={game} channel={channel} setFullScreen={this.makeFullScreen} modalChannel={this.setChannel}/>;
        }

        var gameIframe = document.getElementsByClassName("gameContent");

        if (gameIframe[0] != null) {
            var width = document.documentElement.clientWidth;
            var height = document.documentElement.clientHeight;

            gameIframe[0]
                .contentWindow
                .postMessage(JSON.stringify({"msgId": "windowSizeChanged", "width": width, "height": height}), "*");
            document.getElementsByClassName("gameContent")[0].width = width;
            document.getElementsByClassName("gameContent")[0].height = height;
        }

        return '';
    }

    renderMobileFullScreen()
    {
        return <div className="game-demo-modal-container container-fullscreen">

            <ShareUrlTool className="game-demo-modal-icon game-demo-modal-share" url={window.location.toString()} />
            <div className="game-demo-modal-icon game-demo-modal-close" onClick={this.props.closeDemoModal} title="Close"></div>

            <div className="game-demo-viewport">
                <div className="game-demo-viewport-frame">
                    <div className="game-demo-viewport-frame-holder">
                        {this.renderDemo()}
                    </div>
                </div>
            </div>
            {this.renderDetailBar()}
        </div>
    }

    renderDesktop()
    {
        return <div className={ this.state.isFullScreen ? "game-demo-modal-container container-fullscreen" : "game-demo-modal-container"}>
            <div className="game-demo-modal-icon game-demo-modal-fullscreen game-demo-fullscreen-container" onClick={this.makeFullScreen} title="Full Screen">
            </div>

            <ShareUrlTool className="game-demo-modal-icon game-demo-modal-share" url={window.location.toString()} />
            <div className="game-demo-modal-icon game-demo-modal-close" onClick={this.props.closeDemoModal} title="Close"></div>

            <div className="game-demo-viewport">
                <div className="game-demo-viewport-frame">
                    <div className="game-demo-viewport-frame-holder">
                        {this.renderDemo()}
                    </div>
                </div>
            </div>
            {this.renderDetailBar()}
        </div>
    }

    render() {
        const game = this.state.game;
        const channel = this.state.channel;

        var forceContent = function(val){
          return (!_.isNumber(val) && _.isEmpty(val))? 'n/a' : val;
        };
        //container-fullscreen hardcoded need to make dynamic
        return (
            <div>
                <Desktop>
                    {this.renderDesktop()}
                </Desktop>
                <Tablet>
                    {this.renderMobileFullScreen()}
                </Tablet>
                <Mobile>
                    {this.renderMobileFullScreen()}
                </Mobile>
            </div>
        )
    }
}

export default DemoModal;

import React, { Component } from 'react';
import Modal from 'react-modal';
import games from '../../data/games';
import GameListGame from './GameListGame';
import Loading from "../utilities/Loading";
import DemoModal from "../game/DemoModal";

class GameList extends Component {
    constructor(props){
        super(props);

        this.state = {
            loading: true,
            more: false,
            currentPage: 1,
            games: [],
            isDemoModalOpen: false,
            demoModalGame: null
        };

        this.loadMoreGames = this.loadMoreGames.bind(this);
        this.closeDemoModal = this.closeDemoModal.bind(this);
    }
    componentDidMount(){
        this.loadGames(this.props);
    }
    componentWillReceiveProps(nextProps){
        // reset games and call load games, as this is a new filter
        this.setState({
            loading: true,
            more: false,
            currentPage: 1,
            games: []
        }, () => ( this.loadGames(nextProps) ));
    }
    loadGames(props){
        this.setState({ loading: true });

        games.all({
            params: {
                page: this.state.currentPage,
                itemsPerPage: 12,
                featured: (props.filter.featured)? 1 : 0,
                category: props.filter.category,
                jurisdiction: props.filter.jurisdiction,
                provider: props.filter.provider,
                channel: props.filter.channel
            }
        })
        .then((res) => {
            this.setState((prevState) => ({
                loading: false,
                more: (res.data.meta.currentPage < res.data.meta.totalPages),
                currentPage: res.data.meta.currentPage,
                games: [ ...prevState.games, ...res.data.games ]
            }));
        });
    }
    loadMoreGames(){
        // increment currentPage and call load games
        this.setState((state) => ({currentPage : state.currentPage + 1}), () => ( this.loadGames(this.props) ));
    }
    openDemoModal(game, channel){
        this.setState({
            isDemoModalOpen: true,
            demoModalGame: game,
            demoModalChannel: channel
        });
    }
    closeDemoModal() {
        this.setState({
            isDemoModalOpen: false,
            demoModalGame: null,
            demoModalChannel: null
        });
    }
    render() {
        const loading = this.state.loading;
        const more = this.state.more;
        const games = this.state.games;

        if(loading && games.length === 0){
            return <Loading />;
        }else if(games.length === 0){
            return (<div><p className="none-found none-found__games">No games found.</p></div>)
        }

        const gameNode = games.map((game) => {
            return (<GameListGame game={game} key={game.id} openDemoModal={(channel) => (this.openDemoModal(game, channel))}/>)
        });

        return (
            <div className="games-grid-container">
                <ul className="games-grid">
                    {gameNode}
                </ul>
                <Modal
                    isOpen={this.state.isDemoModalOpen}
                    onRequestClose={this.closeDemoModal}
                    contentLabel="Game demo modal"
                    className="modal"
                    overlayClassName="modal-overlay"
                >
                    {(this.state.isDemoModalOpen? <DemoModal
                        game={this.state.demoModalGame}
                        channel={this.state.demoModalChannel}
                        closeDemoModal={this.closeDemoModal}
                    /> : null)}
                </Modal>
                {(more && !loading? <div><button onClick={this.loadMoreGames}>Load More Games</button></div> : '')}
                {(loading? <div><Loading /></div> : '')}
            </div>
        );
    }
    renderDemoModal() {

    }
}

export default GameList;

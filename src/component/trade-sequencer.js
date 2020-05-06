import React, {Component} from 'react';
import {Synth, MonoSynth, FMSynth, AMSynth, Transport, Time} from 'tone';
import P5Wrapper from 'react-p5-wrapper';
import sketch from './sketch';
import PlayPause from './play-pause';
import {tickerPool, dftState} from './data-source';

class TradeSequencer extends Component {
    constructor(props) {
        super(props);
        const tickers = getRandomTickers(5);
        console.log(tickers);
        this.state = {
            isPlaying: false,
            tickers: tickers,
            volumes: tickers.reduce((acc, curr) => {acc[curr] = 0; return acc}, {}),
            ranges: tickers.reduce((acc, curr) => {acc[curr] = {min: 0, max: 0}; return acc}, {}),
            feeds: tickers.reduce((acc, curr) => {acc[curr] = []; return acc}, {}),
            sketchIndex: 0,
            maxIndex: 0,
            useDefaultData: false,
        }
        this.sounds = {};
        this.sounds[tickers[0]] = new Synth().toMaster();
        this.sounds[tickers[1]] = new MonoSynth().toMaster();
        this.sounds[tickers[2]] = new Synth().toMaster();
        this.sounds[tickers[3]] = new FMSynth().toMaster();
        this.sounds[tickers[4]] = new AMSynth().toMaster();
        Transport.loop = false;
        Transport.loopEnd = '1m';
    }

    componentDidMount() {
        this.state.tickers.map((v,i) => this.fetchData(v));
        this.state.tickers.map((v,i) => this.scheduleSequence(v));
        this.scheduleSketchIndex();
    }

    componentDidUpdate() {
    }

    fetchData = (ticker) => {
        if (this.state.useDefaultData) {
            return;
        }
        const request_params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": ticker,
            "outputsize": "compact",
            "datatype": "json",
            "apikey": "I7JY3EYLKK5LRI8L"
        };
        const base_url = "https://www.alphavantage.co/query";
        const params = Object.keys(request_params)
            .map(key => key + '=' + request_params[key])
            .join('&');
        const queryUrl = base_url + '?' + params;
        fetch(queryUrl)
            .then(resp => resp.json())
            .then(rawData => {
                console.log(rawData);
                let volumes = {...this.state.volumes};
                let ranges = {...this.state.ranges};
                let feeds = {...this.state.feeds};
                if (rawData["Note"] || rawData["Error Message"] ||
                    rawData["Time Series (Daily)"] === undefined) {
                    this.setState(dftState);
                    return;
                }
                let maxVol = 0;
                let maxPrice = 0;
                let minPrice = Number.MAX_SAFE_INTEGER;
                let feed = Object.entries(rawData["Time Series (Daily)"])
                    .map(([date, obj]) => {
                        maxVol = Math.max(maxVol, +obj["5. volume"]);
                        maxPrice = Math.max(maxPrice, +obj["2. high"]);
                        minPrice = Math.min(minPrice, +obj["3. low"]);
                        return {
                            date: date,
                            open: +obj["1. open"],
                            high: +obj["2. high"],
                            low: +obj["3. low"],
                            close: +obj["4. close"],
                            volume: +obj["5. volume"]
                        };
                    }).reverse();
                volumes[ticker] = maxVol;
                ranges[ticker] = {min: minPrice, max: maxPrice};
                feeds[ticker] = feed;
                this.setState(prevState => ({
                    feeds: feeds,
                    ranges: ranges,
                    volumes: volumes,
                    maxIndex: Math.max(prevState.maxIndex, feed.length)
                }));
            });
    }

    scheduleSequence = (ticker) => {
        const sequence = (time) => {
            if (this.state.feeds[ticker]) {
                this.state.feeds[ticker].forEach((v, i) => {
                    let velocity = v.volume / this.state.volumes[ticker];
                        let note = getNote(v.close, this.state.ranges[ticker]);
                        this.sounds[ticker].triggerAttackRelease(
                            note, '16n', time + i * Time('16n').toSeconds(), velocity);
                });
            }
        };
        Transport.schedule(sequence, "0");
    }

    scheduleSketchIndex = () => {
        const sketch = (t) => {
            for (let i = 0; i !== this.state.maxIndex; ++i) {
                setTimeout(() => {
                    this.setState(prevState => ({
                        sketchIndex: (prevState.sketchIndex+1)%prevState.maxIndex
                    }))},
                    i * Time('16n').toMilliseconds());
            }
        };
        Transport.schedule(sketch, "0");
    }

    togglePlay = () => {
        if (this.state.isPlaying) {
            Transport.stop();
        } else {
            Transport.start();
        }
        this.setState({
            isPlaying: !this.state.isPlaying
        });
    }

    render() {
        return (
            <div>
                <PlayPause isPlaying={this.state.isPlaying} handleClick={this.togglePlay}/>
                <P5Wrapper 
                    sketch={sketch} 
                    index={this.state.sketchIndex} 
                    tickers={this.state.tickers} 
                    feeds={this.state.feeds}
                    volumes={this.state.volumes}
                    ranges={this.state.ranges}
                />
            </div>
        );
    }
}

const getNote = (val, {min, max}) => {
    const ref = 'CDEFGAB';
    let n = Math.floor(88 * (val-min) / (max-min));
    return ref[n%7]+(Math.floor(n/7)+1);
}

const getRandomTickers = (num) => {
    let index = [];
    while(index.length < num) {
        let r = Math.floor(Math.random() * tickerPool.length);
        if (index.indexOf(r) === -1) index.push(r);
    }
    return index.map((v,i) => tickerPool[v]);
}

export default TradeSequencer
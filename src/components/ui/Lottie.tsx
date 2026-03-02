import React from 'react';
import Lottie from 'react-lottie';
import lottieAnimation from '@assets/lotties/banner_sm-01.json';

interface LottieOptions extends React.ComponentProps<typeof Lottie> {
    autoplay: boolean;
    loop: boolean;
    animationData: any;
    rendererSettings: any;
    isStopped: boolean;
    isPaused: boolean;
}


export default class LottieControl extends React.Component<LottieOptions> {
    constructor(props: LottieOptions) {
        super(props);
        this.state = props;
    }

    render() {
        const buttonStyle = { display: 'block', margin: '10px auto' };
        const defaultOptions = {
            loop: true,
            autoplay: true,
            animationData: lottieAnimation,
            rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
        };
        const currentState = this.state as LottieOptions;

        return (
            <div>
                <Lottie options={defaultOptions} height={400} width={400} isStopped={currentState.isStopped} isPaused={currentState.isPaused} />
                <button style={buttonStyle} onClick={() => this.setState({ isStopped: true })}>stop</button>
                <button style={buttonStyle} onClick={() => this.setState({ isStopped: false })}>play</button>
                <button style={buttonStyle} onClick={() => this.setState({ isPaused: !currentState.isPaused })}>pause</button>
            </div>
        );
    }
}

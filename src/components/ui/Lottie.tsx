import React from 'react';
import Lottie, { LottieProps, Options } from 'react-lottie';
import lottieAnimation from '@assets/lotties/banner_sm-01.json';

class LottieControl extends React.Component<LottieProps, Options> {
    key: string;

    getLottieState() { return this.state || {}; }

    constructor(props: LottieProps, key?: string) {
        super(props);
        this.key = key || 'lottie';
        this.state = { ...props, animationData: lottieAnimation };
    }

    render() {
        return (
            <div>
                <Lottie
                    key={(this.key || '')}
                    options={(this.state || {}) as Options}
                    height={(this.props.height || 512)}
                    width={(this.props.width || 512)}
                    isStopped={(this.props.isStopped || false)}
                    isPaused={(this.props.isPaused || false)}
                    speed={(this.props.speed || 0.35)}
                    direction={(this.props.direction || 1)}
                    eventListeners={(this.props.eventListeners || [])}
                    style={(this.props.style || {})}
                    ariaRole={(this.props.ariaRole || '')}
                    ariaLabel={(this.props.ariaLabel || '')}
                    title={(this.props.title || '')}
                    isClickToPauseDisabled={(this.props.isClickToPauseDisabled || false)}
                    segments={(this.props.segments || [])}
                />
            </div>
        );
    }
}

export default LottieControl;


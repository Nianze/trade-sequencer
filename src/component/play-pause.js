import React from 'react';

const PlayPause = props => {
    const style = {
        display: "block",
        width: "100%",
        border: "none",
        backgroundColor: "rgb(0, 0, 0)",
        padding: "14px 28px",
        fontSize: "16px",
        color: "white",
        cursor: "pointer",
        textAlign: "center"
    }    
    return (
        <button style={style} onClick={props.handleClick}>
            {props.isPlaying ? '' : 'Play'}
        </button>
    );
}

export default PlayPause;